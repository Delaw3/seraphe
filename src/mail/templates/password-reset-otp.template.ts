export interface PasswordResetOtpTemplateOptions {
  otp: string;
}

export function renderPasswordResetOtpTemplate(
  options: PasswordResetOtpTemplateOptions,
): string {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Seraphe Beauty Password Reset</title>
      </head>
      <body style="margin:0;background:#f7f1ed;font-family:Arial,Helvetica,sans-serif;color:#2f2520;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1ed;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #eadbd3;">
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px;font-size:13px;letter-spacing:1.8px;text-transform:uppercase;color:#9b6b58;">
                      Seraphe Beauty Admin
                    </p>
                    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;color:#2f2520;">
                      Password reset code
                    </h1>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#5f514b;">
                      Use this code to reset your admin password. It expires in 10 minutes.
                    </p>
                    <p style="margin:0 0 18px;font-size:30px;line-height:1.2;font-weight:bold;letter-spacing:6px;color:#2f2520;">
                      ${options.otp}
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#8a7469;">
                      If you did not request this code, you can ignore this email.
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
