import jwt from "jsonwebtoken";

export function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "your-secret-key-change-in-production") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET не задан. Укажите надёжный секрет в .env");
    }
    return "dev-secret";
  }
  return secret;
}

function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("Требуется авторизация");
    err.status = 401;
    throw err;
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, getSecret());
  } catch {
    const err = new Error("Неверный или просроченный токен");
    err.status = 401;
    throw err;
  }
}

export function anyAuth(req, res, next) {
  try {
    verifyToken(req);
    next();
  } catch (err) {
    next(err);
  }
}

export function authMiddleware(req, res, next) {
  try {
    verifyToken(req);
    next();
  } catch (err) {
    next(err);
  }
}
