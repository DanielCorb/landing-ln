import { NextResponse } from 'next/server';
// constants
import {
  getBatchIntervalMinutes,
  getBatchSize,
  getNewsletterSecret,
  getSendConcurrency,
} from '@constants/email';
// lib
import { getIsEmailConfigured, sendMany, type MailMessage } from '@lib/email/transport';
import { getNewPostEmail } from '@lib/email/templates/newPost';
import {
  getNewsletterProgress,
  setNewsletterProgress,
  type NewsletterProgress,
} from '@lib/firestore/newsletterProgress';
import { getPostById } from '@lib/firestore/posts';
import { getActiveSubscriberPage } from '@lib/firestore/subscribers';
import { getOneClickUnsubscribeUrl, getUnsubscribeUrl } from '@lib/newsletter/token';

/**
 * POST /api/newsletter/notify — send **one batch** of the issue announcing a post.
 *
 * Called by the `notifyNewPost` trigger for the first batch and by the `resumeNewsletter`
 * scheduler for every batch after it, never by a browser. The trigger lives in Firebase
 * because a post reaches `published` two different ways — an editor pressing publish, and
 * the `scheduledPublish` job firing — and a Firestore trigger is the one place that sees
 * both. Rendering and sending live here instead, so the templates sit alongside the site
 * they link to.
 *
 * **Why batches.** The cPanel mailbox accepts 50 messages an hour per domain. Handing it
 * more does not queue them, it refuses them, and those subscribers never get that issue.
 * So a blast is a chain: 40 recipients, an hour's pause, 40 more, until the list runs
 * out. The chain's state is the cursor on the post document, and the hour is enforced
 * here rather than trusted to the scheduler's cadence — the cap is a rolling window, so
 * an early run has to be turned away rather than allowed through.
 *
 * The endpoint is deliberately dumb about *when*: it refuses a batch that is too early
 * and lets the caller come back. That keeps the pacing rule in one place, correct no
 * matter who calls or how often.
 */

// Vercel caps a Hobby function at 60s. One batch of 40 over a pooled connection fits
// comfortably; the batch size is what keeps it that way.
export const maxDuration = 60;

export const dynamic = 'force-dynamic';

interface NotifyBody {
  secret?: string;
  postId?: string;
}

/** Minutes until this issue may continue, or 0 when it may go now. */
const getMinutesRemaining = (progress: NewsletterProgress, intervalMinutes: number): number => {
  if (!progress.lastBatchAt) return 0;

  const elapsedMinutes = (Date.now() - progress.lastBatchAt.getTime()) / 60_000;
  return Math.max(0, Math.ceil(intervalMinutes - elapsedMinutes));
};

export async function POST(request: Request) {
  const secret = getNewsletterSecret();

  if (!secret) {
    console.error('Newsletter batch refused: NEWSLETTER_SECRET is not set.');
    return NextResponse.json({ error: 'Newsletter not configured.' }, { status: 503 });
  }

  let body: NotifyBody;

  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: 'Cerere invalidă.' }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!body.postId) {
    return NextResponse.json({ error: 'postId lipsește.' }, { status: 400 });
  }

  if (!getIsEmailConfigured()) {
    console.error('Newsletter batch refused: SMTP is not configured.');
    return NextResponse.json({ error: 'SMTP not configured.' }, { status: 503 });
  }

  try {
    const post = await getPostById(body.postId);

    if (!post) {
      return NextResponse.json({ error: 'Postarea nu există.' }, { status: 404 });
    }

    if (post.status !== 'published') {
      return NextResponse.json(
        { error: `Postarea nu este publicată (status: ${post.status}).` },
        { status: 409 },
      );
    }

    const progress = (await getNewsletterProgress(body.postId)) ?? {
      cursor: null,
      isDone: false,
      lastBatchAt: null,
      sentCount: 0,
      failedCount: 0,
    };

    if (progress.isDone) {
      return NextResponse.json({
        success: true,
        done: true,
        sent: 0,
        failed: 0,
        totalSent: progress.sentCount,
      });
    }

    const minutesRemaining = getMinutesRemaining(progress, getBatchIntervalMinutes());

    if (minutesRemaining > 0) {
      // 425 Too Early: the request is valid and will be, verbatim, later. The scheduler
      // treats this as "not yet" rather than as a failure, so it does not retry harder.
      return NextResponse.json(
        { success: false, tooEarly: true, minutesRemaining, totalSent: progress.sentCount },
        { status: 425 },
      );
    }

    const batchSize = getBatchSize();
    const page = await getActiveSubscriberPage(progress.cursor, batchSize);

    if (page.subscribers.length === 0) {
      await setNewsletterProgress(body.postId, {
        cursor: page.cursor,
        isDone: true,
        sent: 0,
        failed: 0,
      });

      console.info(`Newsletter for "${post.title}" finished: ${progress.sentCount} sent in total.`);

      return NextResponse.json({
        success: true,
        done: true,
        sent: 0,
        failed: 0,
        totalSent: progress.sentCount,
      });
    }

    // Rendered once per recipient because each copy carries that person's own signed
    // unsubscribe link — the layout is identical, the tokens are not.
    const messages: MailMessage[] = page.subscribers.map((subscriber) => {
      const email = getNewPostEmail(post, getUnsubscribeUrl(subscriber.email));

      return {
        to: subscriber.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        unsubscribeUrl: getOneClickUnsubscribeUrl(subscriber.email) ?? undefined,
      };
    });

    const result = await sendMany(messages, getSendConcurrency());

    await setNewsletterProgress(body.postId, {
      cursor: page.cursor,
      isDone: page.isLast,
      sent: result.sent,
      failed: result.failed,
    });

    const totalSent = progress.sentCount + result.sent;

    console.info(
      `Newsletter batch for "${post.title}": ${result.sent} sent, ${result.failed} failed, ` +
        `${totalSent} in total. ${page.isLast ? 'Issue complete.' : 'More to follow next hour.'}`,
    );

    return NextResponse.json({
      success: true,
      postId: post.id,
      done: page.isLast,
      recipients: page.subscribers.length,
      totalSent,
      ...result,
    });
  } catch (error) {
    console.error('Newsletter batch failed:', error);
    return NextResponse.json({ error: 'Eroare la trimiterea newsletterului.' }, { status: 500 });
  }
}
