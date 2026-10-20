import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", "..");

function isSmtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail({ to, subject, text }) {
  if (!isSmtpConfigured()) {
    writeTempFile(subject, text);
    return { delivered: false };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
  return { delivered: true };
}

function writeTempFile(subject, text) {
  const filename = `temp-credentials-${Date.now()}.txt`;
  const filepath = path.join(projectRoot, filename);
  fs.writeFileSync(filepath, `${subject}\n\n${text}\n`, "utf8");
  console.log(`SMTP не настроен. Создан файл с данными: ${filepath}`);
}
