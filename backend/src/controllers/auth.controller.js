import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import db from "../models/db.js";
import { getSecret } from "../middleware/auth.middleware.js";
import { sendMail } from "../lib/mailer.js";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 7;
const REFRESH_TTL_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

function hashRefresh(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function randomRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function saveRefreshToken(user, token) {
  await db("refresh_tokens").insert({
    user_id: user.id,
    email: user.email,
    token_hash: hashRefresh(token),
    expires_at: new Date(Date.now() + REFRESH_TTL_MS),
  });
}

async function issueTokens(user) {
  const access = jwt.sign(
    { id: user.id, email: user.email },
    getSecret(),
    { expiresIn: ACCESS_TTL }
  );
  const refreshToken = randomRefreshToken();
  await saveRefreshToken(user, refreshToken);
  return {
    token: access,
    refreshToken,
    user: { id: user.id, email: user.email },
  };
}

function generateCode() {
  return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

async function sendCodeEmail(email, code, isResend = false) {
  const subject = isResend ? "Повторный код входа" : "Код входа";
  const text = `Ваш код для входа: ${code}\n\nКод действует 10 минут.`;
  const { delivered } = await sendMail({ to: email, subject, text });
  if (!delivered) {
    console.log(`2FA-код для ${email}: ${code}`);
  }
}

export async function checkEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email обязателен" });

    const user = await db("users").where({ email }).first();
    if (user) return res.json({ type: "user" });

    res.json({ type: "unknown" });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await db("users").where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    const [loginId] = await db("login_codes").insert({
      user_id: user.id,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    await sendCodeEmail(user.email, code);

    res.json({ step: "2fa", loginId });
  } catch (err) {
    next(err);
  }
}

export async function verify2fa(req, res, next) {
  try {
    const { loginId, code } = req.body;
    if (!loginId || !code) {
      return res.status(400).json({ error: "loginId и код обязательны" });
    }
    const loginCode = await db("login_codes").where({ id: loginId }).first();
    if (!loginCode || loginCode.used) {
      return res.status(400).json({ error: "Код недействителен" });
    }
    if (new Date(loginCode.expires_at) < new Date()) {
      return res.status(400).json({ error: "Код истёк. Запросите новый." });
    }
    const ok = await bcrypt.compare(code, loginCode.code_hash);
    if (!ok) {
      return res.status(400).json({ error: "Неверный код" });
    }

    await db("login_codes").where({ id: loginId }).update({ used: true });

    const user = await db("users").where({ id: loginCode.user_id }).first();
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const tokens = await issueTokens(user);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function resend2fa(req, res, next) {
  try {
    const { loginId } = req.body;
    if (!loginId) return res.status(400).json({ error: "loginId обязателен" });

    const loginCode = await db("login_codes").where({ id: loginId }).first();
    if (!loginCode || loginCode.used) {
      return res.status(400).json({ error: "Запись недействительна" });
    }

    const created = new Date(loginCode.created_at).getTime();
    if (Date.now() - created < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ error: "Подождите 60 секунд перед повторной отправкой" });
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    await db("login_codes").where({ id: loginId }).update({
      code_hash: codeHash,
      expires_at: new Date(Date.now() + CODE_TTL_MS),
      created_at: new Date(),
    });

    const user = await db("users").where({ id: loginCode.user_id }).first();
    await sendCodeEmail(user.email, code, true);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "refreshToken обязателен" });

    const record = await db("refresh_tokens")
      .where({ token_hash: hashRefresh(refreshToken) })
      .first();
    if (!record) return res.status(401).json({ error: "Недействительный refresh-токен" });
    if (new Date(record.expires_at) < new Date()) {
      await db("refresh_tokens").where({ id: record.id }).del();
      return res.status(401).json({ error: "Refresh-токен истёк" });
    }

    await db("refresh_tokens").where({ id: record.id }).del();

    const user = await db("users").where({ id: record.user_id }).first();
    if (!user) {
      return res.status(401).json({ error: "Пользователь больше не существует" });
    }
    const tokens = await issueTokens(user);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db("refresh_tokens").where({ token_hash: hashRefresh(refreshToken) }).del();
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await db("users").where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Заполните оба поля" });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: "Новый пароль должен быть не короче 8 символов" });
    }
    const user = await db("users").where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) return res.status(400).json({ error: "Текущий пароль неверен" });

    const hash = await bcrypt.hash(new_password, 10);
    await db("users").where({ id: user.id }).update({ password_hash: hash });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
