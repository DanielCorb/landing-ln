// lib
import { getNotificationAddress } from '@lib/email/recipients';
import { sendMail } from '@lib/email/transport';
import { getNewSubscriberAlert, getUnsubscribeAlert } from '@lib/email/templates/adminAlert';
import { getWelcomeEmail } from '@lib/email/templates/welcome';
import { getOneClickUnsubscribeUrl, getUnsubscribeUrl } from './token';

/**
 * The emails triggered by a single subscriber changing their mind.
 *
 * Every function here is fire-and-forget: the Firestore write has already happened and is
 * the thing that matters, so a mailbox that is down must not turn a successful signup into
 * an error message. Failures are logged inside `sendMail` and swallowed here.
 */

/** Greet a new subscriber. */
export const sendWelcomeEmail = async (email: string): Promise<void> => {
  const welcome = getWelcomeEmail(getUnsubscribeUrl(email));

  await sendMail({
    to: email,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
    unsubscribeUrl: getOneClickUnsubscribeUrl(email) ?? undefined,
  });
};

/** Tell the editorial mailbox that the list changed. */
const sendAdminAlert = async (alert: {
  subject: string;
  html: string;
  text: string;
}): Promise<void> => {
  const admin = await getNotificationAddress();
  if (!admin) return;

  await sendMail({
    to: admin,
    subject: alert.subject,
    html: alert.html,
    text: alert.text,
  });
};

export const sendSubscribeAlert = async (email: string, activeCount?: number): Promise<void> =>
  sendAdminAlert(getNewSubscriberAlert({ email, activeCount }));

export const sendUnsubscribeAlert = async (email: string, activeCount?: number): Promise<void> =>
  sendAdminAlert(getUnsubscribeAlert({ email, activeCount }));
