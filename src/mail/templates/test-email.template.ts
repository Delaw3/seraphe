export function renderTestEmailTemplate(): string {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Seraphe Beauty Email Test</title>
      </head>
      <body style="margin:0;background:#f7f1ed;font-family:Arial,Helvetica,sans-serif;color:#2f2520;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1ed;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #eadbd3;">
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#2f2520;">
                      Seraphe Beauty
                    </h2>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#5f514b;">
                      Gmail SMTP has been configured successfully.
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#8a7469;">
                      This is a test email sent from the Seraphe Beauty API.
                    </p>
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
