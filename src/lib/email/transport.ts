import nodemailer, { type Transporter } from 'nodemailer';
// constants
import { getFromAddress, getSmtpConfig } from '@constants/email';

/**
 * SMTP transport for every message the site sends.
 *
 * We talk to the cPanel mailbox that ships with the domain rather than to an email API.
 * That keeps the whole newsletter free — no per-message billing and no third-party account
 * holding the subscriber list — at the cost of doing deliverability ourselves: the domain
 * needs SPF, DKIM and DMARC records, and the mailbox has an hourly send cap.
 *
 * That cap is not handled here. `sendMany` paces messages *within* one batch; staying
 * under 50 an hour is the batching in `/api/newsletter/notify`, which sends a slice and
 * comes back an hour later. This module only ever sees a slice that already fits.
 *
 * The transporter is pooled and memoised per server instance. Nodemailer otherwise opens
 * a fresh TCP + TLS handshake per message, which is both slow and the quickest way to
 * look like a spam source to the receiving server.
 */

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (transporter) return transporter;

  const config = getSmtpConfig();
  if (!config) return null;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });

  return transporter;
};

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative. Absent means a lower spam score for no good reason. */
  text: string;
  replyTo?: string;
  /**
   * Values for the `List-Unsubscribe` pair.
   *
   * Gmail and Yahoo require bulk senders to offer one-click unsubscribe, and honouring it
   * is what keeps the domain out of the spam folder. Set on every newsletter message,
   * never on a reply to something the reader asked for.
   */
  unsubscribeUrl?: string;
}

/** True when a mailbox is configured; false means every send is a silent no-op. */
export const getIsEmailConfigured = (): boolean => getSmtpConfig() !== null;

const getHeaders = (message: MailMessage): Record<string, string> | undefined => {
  if (!message.unsubscribeUrl) return undefined;

  return {
    'List-Unsubscribe': `<${message.unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
};

/**
 * Send one message. Never throws — returns whether it actually went out.
 *
 * Callers treat email as a notification layered on top of work that is already durable
 * (the subscriber row, the published post), so a mail failure must never turn into a user
 * facing error for something that in fact succeeded. This mirrors how the contact form
 * already treats Resend.
 */
export const sendMail = async (message: MailMessage): Promise<boolean> => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `Email skipped — SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD ` +
        `to deliver "${message.subject}" to ${message.to}.`,
    );
    return false;
  }

  try {
    await mailer.sendMail({
      from: getFromAddress(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      headers: getHeaders(message),
    });
    return true;
  } catch (error) {
    console.error(`Email to ${message.to} failed:`, error);
    return false;
  }
};

export interface BulkResult {
  sent: number;
  failed: number;
}

/**
 * Send a personalised copy to many recipients, a few at a time.
 *
 * One message per subscriber rather than a single BCC blast: each copy carries its own
 * unsubscribe token, and BCC would put the size of the list — and the risk of leaking it
 * through a misconfigured header — on every message.
 *
 * `concurrency` is what keeps us under the mailbox's hourly cap. Recipients are processed
 * in fixed-size slices and each slice is awaited before the next starts.
 */
export const sendMany = async (
  messages: MailMessage[],
  concurrency: number,
): Promise<BulkResult> => {
  const result: BulkResult = { sent: 0, failed: 0 };
  const size = Math.max(1, concurrency);

  for (let index = 0; index < messages.length; index += size) {
    const slice = messages.slice(index, index + size);
    const outcomes = await Promise.all(slice.map(sendMail));

    for (const ok of outcomes) {
      if (ok) result.sent += 1;
      else result.failed += 1;
    }
  }

  return result;
};
