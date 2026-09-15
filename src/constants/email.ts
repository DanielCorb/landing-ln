/**
 * Newsletter and transactional email configuration.
 *
 * Everything that varies between environments lives in `.env` — this file only holds the
 * values that are part of the design (brand colours, copy, safe defaults) and the helpers
 * that read the environment.
 */

/**
 * Firestore fields on `articles/{postId}` that track one issue's delivery.
 *
 * The blast is not a single event but a sequence of hourly batches, so the post document
 * carries the whole progress record. Keeping it on the post rather than in a separate
 * collection means the "has this been announced?" check and the "where did we get to?"
 * check read the same document the trigger already has in hand.
 *
 * `newsletterSentAt` predates the batching and now marks the moment the *first* batch was
 * claimed. It is still the field that stops an edit to a live post from re-announcing it.
 */
export const NEWSLETTER_SENT_FIELD = 'newsletterSentAt';

/** Address of the last subscriber this issue reached. Absent = no batch has run yet. */
export const NEWSLETTER_CURSOR_FIELD = 'newsletterCursor';

/** False while batches remain, true once the list is exhausted. */
export const NEWSLETTER_DONE_FIELD = 'newsletterDone';

/** When the last batch finished — the clock the hourly gap is measured against. */
export const NEWSLETTER_LAST_BATCH_FIELD = 'newsletterLastBatchAt';

/** Running totals across every batch of this issue. */
export const NEWSLETTER_SENT_COUNT_FIELD = 'newsletterSentCount';
export const NEWSLETTER_FAILED_COUNT_FIELD = 'newsletterFailedCount';

/** Public route that handles an unsubscribe link click. */
export const UNSUBSCRIBE_ROUTE = '/dezabonare';

/** Subscriber lifecycle. Documents written before this field existed count as active. */
export const SUBSCRIBER_ACTIVE = 'active';
export const SUBSCRIBER_UNSUBSCRIBED = 'unsubscribed';

/**
 * Brand palette, duplicated from tailwind.config.ts as literal hex values.
 *
 * Email clients get a single HTML document with no stylesheet and no CSS variables, so
 * every colour has to be inlined as a literal. Keep these in sync with the Tailwind
 * config if the brand ever changes.
 */
export const EMAIL_COLORS = {
  teal: '#328992',
  tealDark: '#12454A',
  grayTeal: '#699AA0',
  offwhite: '#E8F1F2',
  text: '#1A1D1E',
  muted: '#6B7280',
  border: '#DCE7E9',
  pageBackground: '#F4F8F9',
} as const;

/** Widest an email body should render. Beyond ~600px clients start scrolling sideways. */
export const EMAIL_MAX_WIDTH = 600;

/** How much of the post lead the blast shows before the "read more" button. */
export const EMAIL_LEAD_LENGTH = 320;

/**
 * How many messages are handed to the SMTP server at once.
 *
 * The mailbox is throttled per hour, and opening one connection per subscriber trips
 * that throttle far faster than the volume itself does. The transporter pools
 * connections and this caps how many are in flight, so a batch is a steady trickle
 * rather than a burst.
 */
export const DEFAULT_SEND_CONCURRENCY = 4;

/**
 * How many subscribers one batch covers.
 *
 * The cPanel mailbox allows 50 messages an hour **per domain**, and that budget is shared
 * with everything else the site sends — welcome emails, contact notifications, subscribe
 * and unsubscribe alerts. 40 leaves room for those; a blast that used the whole 50 would
 * push a reader's welcome email into the rejected pile.
 *
 * Going over does not queue, it fails: the server answers with a temporary error and
 * those subscribers simply never receive that issue. Hence a conservative default and the
 * hourly pacing in `NEWSLETTER_BATCH_INTERVAL_MINUTES`.
 */
export const DEFAULT_BATCH_SIZE = 40;

/**
 * Minimum gap between two batches of the same issue, in minutes.
 *
 * The hourly cap is a *rolling* window, not a clock-aligned bucket: 40 messages at 10:50
 * and 40 more at 11:05 is 80 within a quarter of an hour, and the second batch is
 * refused. The gap is therefore enforced here, from the timestamp of the last batch,
 * rather than assumed from how often the scheduler happens to fire.
 */
export const DEFAULT_BATCH_INTERVAL_MINUTES = 60;

const getEnv = (name: string): string | null => {
  const value = process.env[name]?.trim();
  return value ? value : null;
};

/** SMTP credentials, or null when the mailbox is not configured yet. */
export const getSmtpConfig = () => {
  const host = getEnv('SMTP_HOST');
  const user = getEnv('SMTP_USER');
  const password = getEnv('SMTP_PASSWORD');

  if (!host || !user || !password) return null;

  const port = Number(getEnv('SMTP_PORT') ?? 465);

  return {
    host,
    port,
    // Port 465 is implicit TLS; 587 upgrades with STARTTLS after connecting. Getting this
    // backwards is the usual cause of a connection that hangs and then times out.
    secure: getEnv('SMTP_SECURE') ? getEnv('SMTP_SECURE') === 'true' : port === 465,
    user,
    password,
  };
};

/** The `From:` header. Must be a mailbox on the SMTP domain or the server refuses it. */
export const getFromAddress = (): string =>
  getEnv('NEWSLETTER_FROM_EMAIL') ?? getEnv('SMTP_USER') ?? 'newsletter@localhost';

/**
 * Environment fallback for internal notifications.
 *
 * The real source is `settings/general.notificationEmail`, editable in the dashboard —
 * see @lib/email/recipients. This only covers the window before that field is filled in,
 * and the case where the settings document cannot be read.
 */
export const getAdminAddress = (): string | null =>
  getEnv('NEWSLETTER_ADMIN_EMAIL') ?? getEnv('CONTACT_RECEIVER_EMAIL');

/** Secret behind unsubscribe tokens and the blast endpoint. */
export const getNewsletterSecret = (): string | null => getEnv('NEWSLETTER_SECRET');

/**
 * Read a positive integer from the environment, ignoring anything that is not one.
 *
 * A typo in `.env` — an empty value, a stray comment, `40 messages` — parses to `NaN` or
 * to zero, and either would be catastrophic here: a batch size of zero sends nothing and
 * never advances the cursor, so the issue stalls forever with no error anywhere.
 */
const getPositiveInt = (name: string, fallback: number): number => {
  const value = Number(getEnv(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const getSendConcurrency = (): number =>
  getPositiveInt('NEWSLETTER_SEND_CONCURRENCY', DEFAULT_SEND_CONCURRENCY);

/** Subscribers covered by one batch. See DEFAULT_BATCH_SIZE for why it is below the cap. */
export const getBatchSize = (): number =>
  getPositiveInt('NEWSLETTER_BATCH_SIZE', DEFAULT_BATCH_SIZE);

/** Minimum minutes between two batches of the same issue. */
export const getBatchIntervalMinutes = (): number =>
  getPositiveInt('NEWSLETTER_BATCH_INTERVAL_MINUTES', DEFAULT_BATCH_INTERVAL_MINUTES);
