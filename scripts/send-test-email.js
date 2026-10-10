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
  const requiredEnv = ["SMTP_USER", "MAIL_FROM"];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing email environment variables: ${missingEnv.join(", ")}`,
    );
  }

  const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!password) {
    throw new Error("Missing email environment variables: SMTP_PASS");
  }

  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: password,
    },
  });

  const to = process.env.TEST_EMAIL_TO || "lauphix1@gmail.com";
  const fromName = process.env.MAIL_FROM_NAME || "Seraphe Beauty";
  const result = await transporter.sendMail({
    from: `"${fromName}" <${process.env.MAIL_FROM}>`,
    to,
    subject: "Seraphe Beauty Email Test",
    text: "Seraphe Beauty\n\nBrevo SMTP has been configured successfully.",
    html: renderTestEmailTemplate(),
  });

  console.log(`Test email sent to ${to}. Message ID: ${result.messageId}`);
}

sendTestEmail().catch((error) => {
  console.error(`Failed to send test email: ${error.message}`);
  process.exit(1);
});
