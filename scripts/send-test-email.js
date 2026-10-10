const fs = require("node:fs");
const path = require("node:path");
const {
  renderTestEmailTemplate,
} = require("../dist/mail/templates/test-email.template");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

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
  const apiKey = (process.env.BREVO_API_KEY || "").trim();
  const from = (process.env.MAIL_FROM || process.env.EMAIL_FROM || "").trim();
  const fromName = (
    process.env.MAIL_FROM_NAME ||
    process.env.EMAIL_FROM_NAME ||
    "Seraphe Beauty"
  ).trim();

  const missingEnv = [];
  if (!apiKey) missingEnv.push("BREVO_API_KEY");
  if (!from) missingEnv.push("MAIL_FROM");

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing email environment variables: ${missingEnv.join(", ")}`,
    );
  }

  const to = (process.env.TEST_EMAIL_TO || "lauphix1@gmail.com").trim();
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: from },
      to: [{ email: to }],
      subject: "Seraphe Beauty Email Test",
      textContent:
        "Seraphe Beauty\n\nBrevo email API has been configured successfully.",
      htmlContent: renderTestEmailTemplate(),
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Brevo API request failed with status ${response.status}${detail ? `: ${detail}` : "."}`);
  }

  const body = await response.json();
  console.log(`Test email sent to ${to}. Message ID: ${body.messageId}`);
}

sendTestEmail().catch((error) => {
  console.error(`Failed to send test email: ${error.message}`);
  process.exit(1);
});

