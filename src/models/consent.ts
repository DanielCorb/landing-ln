export type ConsentState = 'unset' | 'set';

/**
 * Cookie consent, in the two categories the privacy policy describes.
 *
 * An earlier version had four — `analytics`, `marketing` and `preferences` alongside
 * `essential` — which promised visitors a finer-grained choice than the site could
 * actually honour, and offered an advertising category for advertising that does not
 * exist. See `@constants/cookies` for what each one covers.
 */
export interface CookiePreferences {
  /** Always true — the site cannot function without them. */
  essential: boolean;
  /** Measurement of how the site is read. Off until the visitor turns it on. */
  optional: boolean;
}
