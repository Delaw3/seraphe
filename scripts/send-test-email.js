const fs = require("node:fs");
const path = require("node:path");
const nodemailer = require("nodemailer");
const {
  renderTestEmailTemplate,
} = require("../dist/mail/templates/test-email.template");

const envPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^["']|["']$/g, "");

    process.env[key] = value;
  }
}

async function sendTestEmail() {
  const requiredEnv = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "MAIL_FROM",
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing email environment variables: ${missingEnv.join(", ")}`,
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const result = await transporter.sendMail({
    from: `Seraphe Beauty <${process.env.MAIL_FROM}>`,
    to: "lauphix1@gmail.com",
    subject: "Seraphe Beauty Email Test",
    text: "Seraphe Beauty\n\nGmail SMTP has been configured successfully.",
    html: renderTestEmailTemplate(),
  });

  console.log(
    `Test email sent to lauphix1@gmail.com. Message ID: ${result.messageId}`,
  );
}

sendTestEmail().catch((error) => {
  console.error(`Failed to send test email: ${error.message}`);
  process.exit(1);
});
