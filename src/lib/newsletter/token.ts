import { createHmac, timingSafeEqual } from 'crypto';
// constants
import { getNewsletterSecret, UNSUBSCRIBE_ROUTE } from '@constants/email';
import { BASE_URL } from '@constants/site';

/**
 * Unsubscribe links, signed rather than stored.
 *
 * The token is an HMAC of the subscriber's address, so it can be recomputed on demand and
 * verified without a database lookup, and nothing has to be written when an email goes
 * out. Two properties matter here:
 *
 *   - **Unforgeable.** Without the secret nobody can derive a valid token, so a link
 *     cannot be used to unsubscribe an arbitrary address someone happens to guess.
 *   - **Non-expiring.** Emails outlive any sensible expiry window — a reader may open one
 *     a year later — and a dead unsubscribe link is exactly what makes people report a
 *     newsletter as spam instead.
 *
 * The address travels base64url-encoded rather than raw so a `+` in it survives the query
 * string, where it would otherwise decode to a space.
 */

const TOKEN_LENGTH = 32;

const getEncodedEmail = (email: string): string => Buffer.from(email, 'utf8').toString('base64url');

const getDecodedEmail = (encoded: string): string | null => {
  try {
    const email = Buffer.from(encoded, 'base64url').toString('utf8');
    return email.includes('@') ? email : null;
  } catch {
    return null;
  }
};

/** Signature for an address, or null when no secret is configured. */
export const getUnsubscribeToken = (email: string): string | null => {
  const secret = getNewsletterSecret();
  if (!secret) return null;

  return createHmac('sha256', secret)
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, TOKEN_LENGTH);
};

/**
 * Constant-time check that `token` belongs to `email`.
 *
 * Compared with `timingSafeEqual` so the response time cannot be used to brute-force a
 * signature byte by byte.
 */
export const getIsValidToken = (email: string, token: string): boolean => {
  const expected = getUnsubscribeToken(email);
  if (!expected || token.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};

/** Absolute link for the visible "Dezabonează-te" button in an email. */
export const getUnsubscribeUrl = (email: string): string | null => {
  const token = getUnsubscribeToken(email);
  if (!token) return null;

  return `${BASE_URL}${UNSUBSCRIBE_ROUTE}?e=${getEncodedEmail(email)}&t=${token}`;
};

/**
 * Endpoint behind the `List-Unsubscribe` header.
 *
 * Separate from the visible link because mail clients POST to it without a human present:
 * it must act immediately and answer with a status code, not with a confirmation page.
 */
export const getOneClickUnsubscribeUrl = (email: string): string | null => {
  const token = getUnsubscribeToken(email);
  if (!token) return null;

  return `${BASE_URL}/api/newsletter/unsubscribe?e=${getEncodedEmail(email)}&t=${token}`;
};

/** Resolve `?e=&t=` back to a verified address, or null when the pair does not check out. */
export const getVerifiedEmail = (encoded: string | null, token: string | null): string | null => {
  if (!encoded || !token) return null;

  const email = getDecodedEmail(encoded);
  if (!email) return null;

  const normalized = email.trim().toLowerCase();
  return getIsValidToken(normalized, token) ? normalized : null;
};
