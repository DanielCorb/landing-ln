import { FieldPath } from 'firebase-admin/firestore';
// constants
import { SUBSCRIBER_ACTIVE, SUBSCRIBER_UNSUBSCRIBED } from '@constants/email';
import { SUBSCRIBERS_COLLECTION } from '@constants/site';
// models
import { Subscriber, SubscriberStatus } from '@models/newsletter';
// lib
import { adminDb } from '@lib/firebase/admin';

/**
 * Server-side reads and writes for the subscriber list.
 *
 * Firestore is the single source of truth. The newsletter is delivered over the domain's
 * own SMTP mailbox rather than through an email platform, so there is no second copy of
 * the list anywhere and nothing to keep in sync — an unsubscribe is one write here and it
 * is immediately true everywhere.
 */

const getStatus = (value: unknown): SubscriberStatus =>
  value === SUBSCRIBER_UNSUBSCRIBED ? SUBSCRIBER_UNSUBSCRIBED : SUBSCRIBER_ACTIVE;

const getDate = (value: FirebaseFirestore.Timestamp | null | undefined): Date | null =>
  value ? value.toDate() : null;

const getSubscriberFromDocument = (document: FirebaseFirestore.DocumentSnapshot): Subscriber => {
  const data = document.data() ?? {};

  return {
    email: data.email || document.id,
    // Rows written before the status field existed have no value; those people opted in
    // and never left, so a missing status has to read as active or the first blast after
    // this shipped would skip the entire existing list.
    status: getStatus(data.status),
    agreedToTerms: Boolean(data.agreedToTerms),
    subscribedAt: getDate(data.subscribedAt),
    unsubscribedAt: getDate(data.unsubscribedAt),
  };
};

/**
 * Everyone who should receive the next issue.
 *
 * Filtered in memory rather than with `where('status', '==', 'active')` precisely because
 * of the legacy rows above: a server-side equality filter cannot match a field that is
 * absent, so those documents would silently drop out of every query.
 */
export const getActiveSubscribers = async (): Promise<Subscriber[]> => {
  const snapshot = await adminDb.collection(SUBSCRIBERS_COLLECTION).get();

  return snapshot.docs
    .map(getSubscriberFromDocument)
    .filter((subscriber) => subscriber.status === SUBSCRIBER_ACTIVE && subscriber.email);
};

export const getActiveSubscriberCount = async (): Promise<number> =>
  (await getActiveSubscribers()).length;

/** How many documents one Firestore page pulls while looking for active subscribers. */
const SCAN_PAGE_SIZE = 200;

export interface SubscriberPage {
  subscribers: Subscriber[];
  /** Address to resume from next time, or null when the list is exhausted. */
  cursor: string | null;
  /** True when nothing follows this page — the issue is fully delivered. */
  isLast: boolean;
}

/**
 * The next `limit` active subscribers after `cursor`, in document-id order.
 *
 * A newsletter goes out in hourly batches, so each one has to resume exactly where the
 * previous stopped. The cursor is the last address reached rather than an offset or a
 * stored list of recipients: document ids *are* the lowercased addresses, so ordering by
 * id is stable, and `startAfter` skips what is already done without re-reading it. People
 * subscribing mid-blast sort into their alphabetical place and are picked up by a later
 * batch if they land after the cursor — which is the harmless direction to be wrong in.
 *
 * The scan over-fetches because the active filter cannot be pushed into the query (see
 * `getActiveSubscribers` for why) and unsubscribed rows would otherwise eat into the
 * batch. It keeps pulling pages until the batch is full or the collection runs out.
 */
export const getActiveSubscriberPage = async (
  cursor: string | null,
  limit: number,
): Promise<SubscriberPage> => {
  const collection = adminDb.collection(SUBSCRIBERS_COLLECTION);

  // Document id and subscriber travel together: the id is what `startAfter` understands,
  // while `subscriber.email` falls back to a stored field that legacy rows may spell in a
  // different case. Resuming from the field would silently re-send to, or skip, those.
  const found: { id: string; subscriber: Subscriber }[] = [];

  let start = cursor;
  let isExhausted = false;

  // One past the batch, so we learn whether anyone follows without waiting for the next
  // interval to find out. Stopping exactly at `limit` would leave every issue needing a
  // final empty batch an hour later just to be marked finished.
  while (found.length <= limit && !isExhausted) {
    let query = collection.orderBy(FieldPath.documentId()).limit(SCAN_PAGE_SIZE);
    if (start) query = query.startAfter(start);

    const snapshot = await query.get();

    if (snapshot.size < SCAN_PAGE_SIZE) isExhausted = true;
    if (snapshot.empty) break;

    for (const document of snapshot.docs) {
      start = document.id;

      const subscriber = getSubscriberFromDocument(document);
      if (subscriber.status !== SUBSCRIBER_ACTIVE || !subscriber.email) continue;

      found.push({ id: document.id, subscriber });
      if (found.length > limit) break;
    }
  }

  const isLast = found.length <= limit;
  const batch = found.slice(0, limit);

  return {
    subscribers: batch.map((entry) => entry.subscriber),
    // The last document actually being mailed — never the lookahead, and never whatever
    // document the scan happened to stop on. Either would skip the subscriber sitting
    // between the two on the following batch.
    cursor: batch.length > 0 ? batch[batch.length - 1].id : cursor,
    isLast,
  };
};

export type SubscribeOutcome = 'created' | 'reactivated' | 'already-active';

/**
 * Add an address, or bring a previously unsubscribed one back.
 *
 * The outcome is what the caller uses to decide whether to send a welcome email, so a
 * repeat submission by someone already on the list stays silent instead of mailing them
 * the same greeting again.
 */
export const setSubscribed = async (
  email: string,
  agreedToTerms: boolean,
): Promise<SubscribeOutcome> => {
  const reference = adminDb.collection(SUBSCRIBERS_COLLECTION).doc(email);
  const document = await reference.get();

  if (document.exists && getStatus(document.data()?.status) === SUBSCRIBER_ACTIVE) {
    return 'already-active';
  }

  const isReactivation = document.exists;

  await reference.set(
    {
      email,
      agreedToTerms,
      status: SUBSCRIBER_ACTIVE,
      subscribedAt: new Date(),
      unsubscribedAt: null,
    },
    { merge: true },
  );

  return isReactivation ? 'reactivated' : 'created';
};

/**
 * Mark an address as gone. Returns false when it was already unsubscribed or unknown.
 *
 * The row is kept rather than deleted: it records that consent was given and then
 * withdrawn, and it stops a stale link or a re-import from quietly signing the person
 * back up. `NewsletterView` in the dashboard is where it can be erased for good.
 */
export const setUnsubscribed = async (email: string): Promise<boolean> => {
  const reference = adminDb.collection(SUBSCRIBERS_COLLECTION).doc(email);
  const document = await reference.get();

  if (!document.exists) return false;
  if (getStatus(document.data()?.status) === SUBSCRIBER_UNSUBSCRIBED) return false;

  await reference.set(
    { status: SUBSCRIBER_UNSUBSCRIBED, unsubscribedAt: new Date() },
    { merge: true },
  );

  return true;
};
