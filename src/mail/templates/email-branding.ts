export const SERAPHE_LOGO_URL =
  "https://tpxszntofapxgjadidqo.supabase.co/storage/v1/object/public/Branding/red-logo.png";

export const SERAPHE_WEBSITE_URL = "https://seraphebeauty.org";

export function renderEmailLogoHeader(): string {
  return `
    <tr>
      <td align="center" style="padding:28px 32px 0;">
        <a href="${SERAPHE_WEBSITE_URL}" style="text-decoration:none;">
          <img
            src="${SERAPHE_LOGO_URL}"
            alt="Seraphe Beauty"
            width="140"
            style="display:block;width:140px;max-width:140px;height:auto;border:0;outline:none;text-decoration:none;"
          />
        </a>
      </td>
    </tr>
  `;
}
