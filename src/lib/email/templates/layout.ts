// constants
import { EMAIL_COLORS, EMAIL_MAX_WIDTH } from '@constants/email';
import { BASE_URL, SITE_NAME } from '@constants/site';
// utils
import { getEscapedHtml } from '@utils/getHtml';

/**
 * The shell every outgoing email is wrapped in.
 *
 * Written as nested tables with inline styles on purpose. Outlook on Windows renders mail
 * through Word's HTML engine, which has no flexbox, no grid, no `max-width` on divs and
 * drops anything in a `<style>` block that isn't a plain class selector — so the layout
 * techniques used on the site itself are unavailable here. Tables and inline attributes
 * are the only things every client agrees on.
 *
 * Colours are literals from EMAIL_COLORS rather than CSS variables, and the design is
 * light-only: `prefers-color-scheme` support is inconsistent across clients, and a
 * half-applied dark theme reads far worse than a light email in a dark client.
 *
 * The header band uses the same teal as the call-to-action button. Both texts in it are
 * pure white rather than the brand's offwhite and gray-teal: against this lighter
 * background gray-teal falls to roughly 1.3:1 and is effectively unreadable, so the
 * hierarchy between the wordmark and the tagline is carried by size and weight instead of
 * by colour.
 */

export interface EmailButton {
  label: string;
  url: string;
}

interface LayoutOptions {
  /** Shown under the wordmark; the subject usually reads well here too. */
  preheader: string;
  bodyHtml: string;
  unsubscribeUrl?: string | null;
}

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

/**
 * Hidden first line of the message.
 *
 * Inbox lists show the opening body text next to the subject. Without this they show
 * whatever markup happens to come first — usually the alt text of the logo repeated.
 */
const getPreheader = (text: string): string => `
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:transparent;">
    ${getEscapedHtml(text)}
  </div>`;

/** Bulletproof-ish call to action: a table cell with a background, not a styled anchor. */
export const getButtonHtml = (button: EmailButton): string => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" bgcolor="${EMAIL_COLORS.teal}" style="border-radius:6px;">
        <a href="${button.url}"
           style="display:inline-block;padding:13px 28px;font-family:${FONT_STACK};font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:6px;">
          ${getEscapedHtml(button.label)}
        </a>
      </td>
    </tr>
  </table>`;

const getFooterHtml = (unsubscribeUrl?: string | null): string => {
  const unsubscribe = unsubscribeUrl
    ? `
      <p style="margin:0 0 10px;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${EMAIL_COLORS.muted};">
        Nu mai vrei aceste emailuri?
        <a href="${unsubscribeUrl}" style="color:${EMAIL_COLORS.teal};text-decoration:underline;">Dezabonează-te</a>.
      </p>`
    : '';

  return `
    <tr>
      <td style="padding:24px 32px 32px;border-top:1px solid ${EMAIL_COLORS.border};">
        ${unsubscribe}
        <p style="margin:0 0 6px;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${EMAIL_COLORS.muted};">
          <a href="${BASE_URL}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">${SITE_NAME}</a>
          &middot;
          <a href="${BASE_URL}/politica-de-confidentialitate" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Confidențialitate</a>
          &middot;
          <a href="${BASE_URL}/contact" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">Contact</a>
        </p>
        <p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${EMAIL_COLORS.muted};">
          Primești acest email pentru că te-ai abonat la newsletterul ${SITE_NAME}.
        </p>
      </td>
    </tr>`;
};

/** Wrap rendered body markup in the branded shell. */
export const getEmailLayout = (options: LayoutOptions): string => `<!DOCTYPE html>
<html lang="ro" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <title>${getEscapedHtml(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.pageBackground};">
  ${getPreheader(options.preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${EMAIL_COLORS.pageBackground};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="${EMAIL_MAX_WIDTH}" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:${EMAIL_MAX_WIDTH}px;background-color:#FFFFFF;border-radius:10px;overflow:hidden;border:1px solid ${EMAIL_COLORS.border};">

          <tr>
            <td align="center" bgcolor="${EMAIL_COLORS.teal}" style="padding:26px 32px;">
              <a href="${BASE_URL}" style="font-family:${FONT_STACK};font-size:23px;font-weight:bold;letter-spacing:0.4px;color:#FFFFFF;text-decoration:none;">
                ${getEscapedHtml(SITE_NAME)}
              </a>
              <p style="margin:6px 0 0;font-family:${FONT_STACK};font-size:12px;letter-spacing:0.3px;color:#FFFFFF;">
                Publicație online independentă
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 8px;">
              ${options.bodyHtml}
            </td>
          </tr>

          ${getFooterHtml(options.unsubscribeUrl)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/** Shared text helpers so every template's typography matches. */
export const EMAIL_TEXT = {
  heading: `margin:0 0 16px;font-family:${FONT_STACK};font-size:24px;line-height:32px;font-weight:bold;color:${EMAIL_COLORS.text};`,
  paragraph: `margin:0 0 16px;font-family:${FONT_STACK};font-size:15px;line-height:24px;color:${EMAIL_COLORS.text};`,
  muted: `margin:0 0 16px;font-family:${FONT_STACK};font-size:13px;line-height:20px;color:${EMAIL_COLORS.muted};`,
  label: `margin:0 0 8px;font-family:${FONT_STACK};font-size:12px;line-height:16px;font-weight:bold;letter-spacing:0.8px;text-transform:uppercase;color:${EMAIL_COLORS.teal};`,
} as const;

export { FONT_STACK };
