import { NextResponse } from 'next/server';
// constants
import { UNSUBSCRIBE_ROUTE } from '@constants/email';
import { BASE_URL } from '@constants/site';
// lib
import { getActiveSubscriberCount, setUnsubscribed } from '@lib/firestore/subscribers';
import { getVerifiedEmail } from '@lib/newsletter/token';
import { sendUnsubscribeAlert } from '@lib/newsletter/notifications';

/**
 * One-click unsubscribe, the endpoint named in the `List-Unsubscribe` header.
 *
 * Gmail and Yahoo require bulk senders to expose this, and they check that it works:
 * a list that only offers a link buried in the footer gets throttled or filtered. The mail
 * client POSTs here on its own — no browser, no session, nobody watching — so the handler
 * must act immediately and answer with a status code rather than a page.
 *
 * The GET arm exists only for clients that ignore `List-Unsubscribe-Post` and follow the
 * URL as a plain link. It deliberately does *not* unsubscribe: link scanners fetch URLs
 * that nobody clicked. It redirects to the confirmation page instead.
 */

const getEmailFromRequest = (request: Request): string | null => {
  const { searchParams } = new URL(request.url);
  return getVerifiedEmail(searchParams.get('e'), searchParams.get('t'));
};

export async function POST(request: Request) {
  const email = getEmailFromRequest(request);

  if (!email) {
    return NextResponse.json({ error: 'Link invalid.' }, { status: 400 });
  }

  try {
    const changed = await setUnsubscribed(email);

    if (changed) {
      await sendUnsubscribeAlert(email, await getActiveSubscriberCount());
    }

    // Already-unsubscribed is success too: the mail client asked for an end state, not for
    // a transition, and reporting an error would make it retry a request that is done.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('One-click unsubscribe failed:', error);
    return NextResponse.json({ error: 'Eroare internă.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return NextResponse.redirect(`${BASE_URL}${UNSUBSCRIBE_ROUTE}${search}`);
}
