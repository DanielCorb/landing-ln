import { NextResponse } from 'next/server';
// constants
import { CONTACTS_COLLECTION } from '@constants/site';
// lib
import { getNotificationAddress } from '@lib/email/recipients';
import { sendMail } from '@lib/email/transport';
import { getContactEmail, type ContactMessage } from '@lib/email/templates/contactMessage';
import { adminDb } from '@lib/firebase/admin';

/**
 * POST /api/contact — contact form handler.
 *
 * The message is stored in Firestore first; the email is a *notification* on top of
 * that. So as long as the message is safely recorded — and therefore visible in the
 * dashboard — the visitor is told it went through, even if the mailbox rejects the send.
 * Any other order surfaces "Eroare la trimiterea emailului" for a message that in fact
 * arrived, and the visitor re-sends it.
 *
 * Delivery goes over the domain's own SMTP mailbox, the same one the newsletter uses, so
 * there is a single set of credentials and a single place where deliverability is
 * configured. It previously went through Resend, which needed a separate account, a second
 * verified domain and an API key that was never filled in — the notification had simply
 * never worked.
 *
 * The recipient comes from `settings/general.notificationEmail`, editable in the dashboard,
 * and falls back to the environment when that field is empty — see @lib/email/recipients.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Send the notification. Never throws — returns whether it went out. */
const sendNotificationEmail = async (contact: ContactMessage): Promise<boolean> => {
  const receiver = await getNotificationAddress();

  if (!receiver) {
    console.warn(
      'Contact form: notification skipped — no recipient configured. Set "Email notificări" ' +
        'in the dashboard settings, or NEWSLETTER_ADMIN_EMAIL in the environment. The ' +
        'message was still stored in Firestore and is visible in the dashboard.',
    );
    return false;
  }

  const email = getContactEmail(contact);

  return sendMail({
    to: receiver,
    subject: email.subject,
    html: email.html,
    text: email.text,
    // Reply goes to the visitor; the message itself still leaves from our own mailbox.
    replyTo: contact.email,
  });
};

export async function POST(request: Request) {
  let body: ContactMessage;

  try {
    body = (await request.json()) as ContactMessage;
  } catch {
    return NextResponse.json({ error: 'Cerere invalidă.' }, { status: 400 });
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: 'Toate câmpurile sunt obligatorii.' }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(body.email.trim())) {
    return NextResponse.json({ error: 'Adresa de email nu este validă.' }, { status: 400 });
  }

  const contact: ContactMessage = {
    name: body.name.trim(),
    email: body.email.trim(),
    subject: body.subject.trim(),
    message: body.message.trim(),
  };

  let stored = false;

  try {
    await adminDb.collection(CONTACTS_COLLECTION).add({
      ...contact,
      createdAt: new Date().toISOString(),
      status: 'unread',
    });
    stored = true;
  } catch (error) {
    console.error('Contact form: failed to store the message in Firestore.', error);
  }

  const emailed = await sendNotificationEmail(contact);

  if (!stored && !emailed) {
    return NextResponse.json(
      { error: 'Nu am putut trimite mesajul. Te rugăm să încerci din nou.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, stored, emailed });
}
