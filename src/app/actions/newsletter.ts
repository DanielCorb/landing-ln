'use server';

// lib
import {
  getActiveSubscriberCount,
  setSubscribed,
  setUnsubscribed,
} from '@lib/firestore/subscribers';
import {
  sendSubscribeAlert,
  sendUnsubscribeAlert,
  sendWelcomeEmail,
} from '@lib/newsletter/notifications';

interface NewsletterResult {
  success: boolean;
  message?: string;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Subscribe an address and send the two emails that follow: a welcome to the reader and a
 * heads-up to the editorial mailbox.
 *
 * The Firestore write is the commitment — the emails are a side effect. If SMTP is
 * unconfigured or the mailbox rejects the message the person is still subscribed and is
 * told so, exactly as the contact form treats its own notification. Anything else would
 * push visitors into re-submitting a form that already worked.
 */
export async function subscribeToNewsletterAction(
  email: string,
  agreedToTerms: boolean,
): Promise<NewsletterResult> {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return { success: false, error: 'Email nevalid' };
  }

  if (!agreedToTerms) {
    return { success: false, error: 'Trebuie să accepți Termenii și Condițiile' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const outcome = await setSubscribed(normalizedEmail, agreedToTerms);

    if (outcome === 'already-active') {
      return { success: true, message: 'Ești deja abonat!' };
    }

    // Both emails are independent of each other and of the caller, so they go out together
    // and neither one's failure can hold up the response.
    const activeCount = await getActiveSubscriberCount();
    await Promise.all([
      sendWelcomeEmail(normalizedEmail),
      sendSubscribeAlert(normalizedEmail, activeCount),
    ]);

    return {
      success: true,
      message:
        outcome === 'reactivated' ? 'Bine ai revenit! Te-ai reabonat.' : 'Te-ai abonat cu succes!',
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error: 'A apărut o eroare. Încearcă din nou mai târziu.' };
  }
}

/**
 * Remove an address, called from the unsubscribe page once its token has been verified.
 *
 * Idempotent by design: clicking an old link a second time reports success rather than an
 * error, because from the reader's point of view "I am not on the list" is the outcome
 * they asked for either way.
 */
export async function unsubscribeFromNewsletterAction(email: string): Promise<NewsletterResult> {
  try {
    const changed = await setUnsubscribed(email);

    if (changed) {
      await sendUnsubscribeAlert(email, await getActiveSubscriberCount());
    }

    return { success: true, message: 'Te-ai dezabonat.' };
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return { success: false, error: 'A apărut o eroare. Încearcă din nou mai târziu.' };
  }
}
