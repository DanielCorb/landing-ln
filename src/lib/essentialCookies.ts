/**
 * Essential first-party cookies claimed in the privacy policy.
 * These are strictly necessary for the site (session continuity + country hint)
 * and do not require optional analytics consent.
 *
 * Country must NOT be inferred from browser language region (en-US → US is wrong for
 * most readers of a Romanian publication). We default to RO and refine via IP lookup.
 */

const SESSION_COOKIE = 'ln_essential_session';
const COUNTRY_COOKIE = 'ln_essential_country';
const COUNTRY_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const DEFAULT_COUNTRY = 'RO';

const getCookie = (name: string): string | null => {
  try {
    const prefix = `${name}=`;
    const match = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    if (!match) return null;
    return decodeURIComponent(match.slice(prefix.length)) || null;
  } catch {
    return null;
  }
};

const setCookie = (name: string, value: string, maxAgeSeconds?: number): void => {
  try {
    const maxAge =
      typeof maxAgeSeconds === 'number' ? `;max-age=${maxAgeSeconds}` : '';
    document.cookie = `${name}=${encodeURIComponent(value)};path=/${maxAge};SameSite=Lax`;
  } catch {
    /* ignore */
  }
};

const newId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const isCountryCode = (value: string | null | undefined): value is string =>
  !!value && /^[A-Z]{2}$/.test(value);

/** Prefer explicit Romanian locale; never trust en-US style region tags. */
export const guessCountryFromLocale = (): string => {
  try {
    const lang = (
      navigator.language ||
      (navigator as Navigator & { userLanguage?: string }).userLanguage ||
      ''
    ).toString();
    const primary = lang.split(/[-_]/)[0]?.toLowerCase();
    if (primary === 'ro') return 'RO';
    if (primary === 'md') return 'MD';
  } catch {
    /* ignore */
  }
  return DEFAULT_COUNTRY;
};

/** Resolve country from IP (essential — used for content locale, not optional analytics). */
export const resolveCountryFromIp = async (): Promise<string | null> => {
  try {
    const res = await fetch('https://ipwho.is/', { method: 'GET' });
    const data = (await res.json()) as { success?: boolean; country_code?: string };
    if (data && data.success !== false && data.country_code) {
      const code = String(data.country_code).toUpperCase();
      return isCountryCode(code) ? code : null;
    }
  } catch {
    /* ignore */
  }
  return null;
};

export const setEssentialCountry = (country: string): void => {
  if (!isCountryCode(country)) return;
  setCookie(COUNTRY_COOKIE, country, COUNTRY_MAX_AGE);
  try {
    window.dispatchEvent(
      new CustomEvent('ln-essential-country', { detail: { country } }),
    );
  } catch {
    /* ignore */
  }
};

/**
 * Ensures the two essential cookies exist.
 * Country defaults to RO, then is refined asynchronously via IP.
 */
export const ensureEssentialCookies = (): { sessionId: string; country: string } => {
  let sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId || sessionId.length < 8) {
    sessionId = newId();
    // Session cookie (no max-age) — cleared when the browser session ends.
    setCookie(SESSION_COOKIE, sessionId);
  }

  let country = getCookie(COUNTRY_COOKIE);
  // Migrate bad locale-based values (e.g. US from en-US) by re-resolving via IP.
  const needsResolve = !isCountryCode(country) || country === 'US' || country === 'GB';
  if (!isCountryCode(country)) {
    country = guessCountryFromLocale();
    setCookie(COUNTRY_COOKIE, country, COUNTRY_MAX_AGE);
  }

  if (needsResolve && typeof window !== 'undefined') {
    void resolveCountryFromIp().then((ipCountry) => {
      if (ipCountry) setEssentialCountry(ipCountry);
    });
  }

  return { sessionId, country: country! };
};

export const getEssentialCountry = (): string | null => getCookie(COUNTRY_COOKIE);

export const getEssentialSessionId = (): string | null => getCookie(SESSION_COOKIE);
