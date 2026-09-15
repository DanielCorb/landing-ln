// constants
import { SITE_NAME } from '@constants/site';
// utils
import { getEscapedHtml } from '@utils/getHtml';
// lib
import { EMAIL_TEXT, getEmailLayout } from './layout';

/**
 * "Someone subscribed" / "someone left" notices for the editorial team.
 *
 * Sent to NEWSLETTER_ADMIN_EMAIL as the change happens rather than being surfaced only in
 * the dashboard, so nobody has to keep a tab open to notice the list moving. No
 * unsubscribe link: this goes to an internal mailbox, not to a reader who opted in.
 */

interface AdminAlert {
  subject: string;
  html: string;
  text: string;
}

interface AlertOptions {
  email: string;
  /** Total active subscribers after the change, when it is cheap to know. */
  activeCount?: number;
}

const getRowsHtml = (rows: [string, string][]): string =>
  rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="${EMAIL_TEXT.muted} margin:0;padding:6px 16px 6px 0;white-space:nowrap;">${label}</td>
          <td style="${EMAIL_TEXT.paragraph} margin:0;padding:6px 0;font-weight:bold;">${getEscapedHtml(value)}</td>
        </tr>`,
    )
    .join('');

const getAlert = (
  options: AlertOptions,
  { label, heading, subject }: { label: string; heading: string; subject: string },
): AdminAlert => {
  const rows: [string, string][] = [
    ['Adresă', options.email],
    ['Data', new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })],
  ];

  if (typeof options.activeCount === 'number') {
    rows.push(['Total abonați activi', String(options.activeCount)]);
  }

  const bodyHtml = `
    <p style="${EMAIL_TEXT.label}">${label}</p>
    <h1 style="${EMAIL_TEXT.heading}">${heading}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      ${getRowsHtml(rows)}
    </table>`;

  return {
    subject,
    html: getEmailLayout({ preheader: `${heading}: ${options.email}`, bodyHtml }),
    text: rows.map(([label_, value]) => `${label_}: ${value}`).join('\n'),
  };
};

export const getNewSubscriberAlert = (options: AlertOptions): AdminAlert =>
  getAlert(options, {
    label: 'Newsletter',
    heading: 'Abonat nou',
    subject: `[${SITE_NAME}] Abonat nou: ${options.email}`,
  });

export const getUnsubscribeAlert = (options: AlertOptions): AdminAlert =>
  getAlert(options, {
    label: 'Newsletter',
    heading: 'Dezabonare',
    subject: `[${SITE_NAME}] Dezabonare: ${options.email}`,
  });
