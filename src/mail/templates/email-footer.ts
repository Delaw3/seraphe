export const EMAIL_FOOTER_TEXT =
  "\n\n--\nThis is an auto-generated mail. Please do not reply.\n" +
  "For enquiries on Seraphé products and services, please call on: +234-705-968-6654\n" +
  "Email: seraphebeauty.ng@gmail.com";

export function renderEmailFooter(): string {
  return `
    <tr>
      <td style="padding:0 32px 32px;">
        <hr style="border:none;border-top:1px solid #E0E0E0;margin:20px 0;" />
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#666666;line-height:1.6;">
          <p style="margin:0 0 8px 0;font-style:italic;color:#888888;font-size:10px;">
            This is an auto-generated mail. Please do not reply.
          </p>
          <p style="margin:0 0 4px 0;">
            For enquiries on Seraph&eacute; products and services, please call on:
            <a href="tel:+2347059686654" style="color:#333333;text-decoration:none;font-weight:bold;">+234-705-968-6654</a>
          </p>
          <p style="margin:0;">
            Email: <a href="mailto:seraphebeauty.ng@gmail.com" style="color:#1A73E8;text-decoration:none;">seraphebeauty.ng@gmail.com</a>
          </p>
        </div>
      </td>
    </tr>
  `;
}
