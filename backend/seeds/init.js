import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "../src/lib/mailer.js";

function generatePassword() {
  return crypto.randomBytes(9).toString("base64url").slice(0, 12);
}

export async function seed(knex) {
  const existing = await knex("users").count("* as c").first();
  if (existing.c > 0) {
    console.log("БД инициализирована — сид пропущен");
    return;
  }

  await knex("users").del();
  await knex("settings").del();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.ru";
  const password = process.env.ADMIN_PASSWORD || generatePassword();
  const hash = await bcrypt.hash(password, 10);

  await knex("users").insert({
    email: adminEmail,
    password_hash: hash,
  });

  console.log(`Создан админ: ${adminEmail}`);
  try {
    await sendMail({
      to: adminEmail,
      subject: "Доступ к админке",
      text: `Email: ${adminEmail}\nПароль: ${password}\n\nСмените пароль после первого входа.`,
    });
    if (process.env.ADMIN_PASSWORD) {
      console.log("Пароль задан в env, письмо отправлено на", adminEmail);
    } else {
      console.log(`Сгенерированный пароль отправлен на ${adminEmail} (или в temp-файл при отсутствии SMTP).`);
    }
  } catch (err) {
    console.error("Не удалось отправить письмо с паролем:", err.message);
  }

  await knex("settings").insert([
    { key: "site_title", value: "Logistics Control" },
    { key: "site_description", value: "" },
    { key: "h1", value: "Logistics Control" },
    { key: "seo_text", value: "" },
    { key: "seo_business_name", value: "Logistics Control" },
    { key: "seo_business_description", value: "" },
    { key: "seo_og_image", value: "" },
  ]);
}
