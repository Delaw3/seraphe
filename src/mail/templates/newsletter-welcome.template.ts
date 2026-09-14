export interface NewsletterWelcomeTemplateOptions {
  name?: string;
}

export function renderNewsletterWelcomeTemplate(
  options: NewsletterWelcomeTemplateOptions = {},
): string {
  const greetingName = options.name?.trim() || "there";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Welcome to Seraphe Beauty</title>
      </head>
      <body style="margin:0;background:#f7f1ed;font-family:Arial,Helvetica,sans-serif;color:#2f2520;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1ed;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #eadbd3;">
                <tr>
                  <td style="padding:34px 32px 10px;">
                    <p style="margin:0 0 8px;font-size:13px;letter-spacing:1.8px;text-transform:uppercase;color:#9b6b58;">
                      Seraphe Beauty Newsletter
                    </p>
                    <h1 style="margin:0;font-size:30px;line-height:1.2;color:#2f2520;">
                      Welcome, ${greetingName}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px 32px;">
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#5f514b;">
                      Thank you for joining the Seraphe Beauty community. You are now on the list for beauty tips, product updates, skincare notes, and special announcements.
                    </p>
                    <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#5f514b;">
                      We are glad to have you here.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background:#2f2520;padding:12px 18px;">
                          <a href="https://seraphebeauty.org" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">
                            Visit Seraphe Beauty
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
