// constants
import { EMAIL_COLORS } from '@constants/email';
import { SITE_NAME } from '@constants/site';
// utils
import { getEscapedHtml } from '@utils/getHtml';
// lib
import { EMAIL_TEXT, FONT_STACK, getEmailLayout } from './layout';

/**
 * The notification sent to the editorial inbox when the contact form is submitted.
 *
 * Goes to an internal mailbox, so no unsubscribe link — the reader never opted into it and
 * cannot leave it. The visitor's address ends up in `Reply-To` on the message itself
 * rather than in `From`, so hitting reply answers the person while the mail still leaves
 * from our own authenticated mailbox. Putting their address in `From` would be a forgery
 * the SMTP server refuses to relay, and SPF would fail it anyway.
 */

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactEmail {
  subject: string;
  html: string;
  text: string;
}

const getRowsHtml = (rows: [string, string][]): string =>
  rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="${EMAIL_TEXT.muted} margin:0;padding:6px 16px 6px 0;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="${EMAIL_TEXT.paragraph} margin:0;padding:6px 0;font-weight:bold;">${getEscapedHtml(value)}</td>
        </tr>`,
    )
    .join('');

export const getContactEmail = (contact: ContactMessage): ContactEmail => {
  const rows: [string, string][] = [
    ['Nume', contact.name],
    ['Email', contact.email],
    ['Subiect', contact.subject],
    ['Primit', new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })],
  ];

  const bodyHtml = `
    <p style="${EMAIL_TEXT.label}">Formular de contact</p>
    <h1 style="${EMAIL_TEXT.heading}">${getEscapedHtml(contact.subject)}</h1>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      ${getRowsHtml(rows)}
    </table>

    <div style="margin:20px 0 8px;padding:18px 20px;background-color:${EMAIL_COLORS.pageBackground};border-left:3px solid ${EMAIL_COLORS.teal};border-radius:4px;">
      <p style="margin:0;font-family:${FONT_STACK};font-size:15px;line-height:24px;color:${EMAIL_COLORS.text};white-space:pre-wrap;">${getEscapedHtml(contact.message)}</p>
    </div>

    <p style="${EMAIL_TEXT.muted}">
      Răspunde direct la acest email și mesajul ajunge la
      <a href="mailto:${encodeURI(contact.email)}" style="color:${EMAIL_COLORS.teal};">${getEscapedHtml(contact.email)}</a>.
    </p>`;

  const text = [...rows.map(([label, value]) => `${label}: ${value}`), '', contact.message].join(
    '\n',
  );

  return {
    subject: `[${SITE_NAME}] Contact: ${contact.subject}`,
    html: getEmailLayout({
      preheader: `${contact.name}: ${contact.subject}`,
      bodyHtml,
    }),
    text,
  };
};
