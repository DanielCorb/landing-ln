import { FieldValue } from 'firebase-admin/firestore';
// constants
import {
  NEWSLETTER_CURSOR_FIELD,
  NEWSLETTER_DONE_FIELD,
  NEWSLETTER_FAILED_COUNT_FIELD,
  NEWSLETTER_LAST_BATCH_FIELD,
  NEWSLETTER_SENT_COUNT_FIELD,
} from '@constants/email';
import { POSTS_COLLECTION } from '@constants/site';
// lib
import { adminDb } from '@lib/firebase/admin';

/**
 * Where one issue got to, and when it may continue.
 *
 * The newsletter cannot go out in a single pass: the mailbox accepts 50 messages an hour
 * and a Vercel function is killed at 60 seconds, so a list of any size is delivered as a
 * sequence of batches, an hour apart, driven by the `resumeNewsletter` scheduler. That
 * makes the progress record the load-bearing part of the whole flow — it is the only
 * thing that knows a blast is half-finished, and losing it would either strand the rest
 * of the list or mail the first batch a second copy.
 *
 * It lives on the post document rather than in its own collection because every reader
 * already holds that document: the Firestore trigger that starts the blast, the endpoint
 * that sends a batch, and anything later that wants to show an issue still in flight.
 */

export interface NewsletterProgress {
  /** Last address reached, or null before the first batch. */
  cursor: string | null;
  /** True once the list has been exhausted. */
  isDone: boolean;
  /** When the last batch finished, or null before the first one. */
  lastBatchAt: Date | null;
  sentCount: number;
  failedCount: number;
}

export interface BatchOutcome {
  cursor: string | null;
  isDone: boolean;
  sent: number;
  failed: number;
}

const getDate = (value: FirebaseFirestore.Timestamp | null | undefined): Date | null =>
  value ? value.toDate() : null;

const getCount = (value: unknown): number => (typeof value === 'number' ? value : 0);

export const getNewsletterProgress = async (postId: string): Promise<NewsletterProgress | null> => {
  const document = await adminDb.collection(POSTS_COLLECTION).doc(postId).get();
  if (!document.exists) return null;

  const data = document.data() ?? {};

  return {
    cursor: (data[NEWSLETTER_CURSOR_FIELD] as string) || null,
    isDone: data[NEWSLETTER_DONE_FIELD] === true,
    lastBatchAt: getDate(data[NEWSLETTER_LAST_BATCH_FIELD]),
    sentCount: getCount(data[NEWSLETTER_SENT_COUNT_FIELD]),
    failedCount: getCount(data[NEWSLETTER_FAILED_COUNT_FIELD]),
  };
};

/**
 * Record the outcome of a batch and move the cursor forward.
 *
 * Counts are incremented rather than overwritten so the totals survive across batches,
 * and the write happens *after* the messages have left. A crash between sending and this
 * write costs a duplicate batch on the next run, which is recoverable; writing first and
 * crashing would skip those subscribers permanently, which is not.
 */
export const setNewsletterProgress = async (postId: string, batch: BatchOutcome): Promise<void> => {
  await adminDb
    .collection(POSTS_COLLECTION)
    .doc(postId)
    .set(
      {
        [NEWSLETTER_CURSOR_FIELD]: batch.cursor,
        [NEWSLETTER_DONE_FIELD]: batch.isDone,
        [NEWSLETTER_LAST_BATCH_FIELD]: new Date(),
        [NEWSLETTER_SENT_COUNT_FIELD]: FieldValue.increment(batch.sent),
        [NEWSLETTER_FAILED_COUNT_FIELD]: FieldValue.increment(batch.failed),
      },
      { merge: true },
    );
};
