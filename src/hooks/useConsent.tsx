'use client';

import { useCallback, useSyncExternalStore } from 'react';
// models
import { ConsentState, CookiePreferences } from '@models/consent';

/**
 * Cookie consent, backed by localStorage and mirrored into a first-party cookie.
 *
 * localStorage *is* the state here, so the hook subscribes to it through
 * `useSyncExternalStore` rather than copying it into React state from a mount effect.
 * Two consequences worth having: the cookie bar and the preferences modal always agree
 * (they read the same store, not two independent copies), and there is no cascading
 * render on first paint.
 *
 * The document.cookie mirror keeps the same choice available if localStorage is cleared
 * for the origin but cookies remain (or the reverse on restore).
 */

/**
 * Storage keys are versioned.
 *
 * The categories changed meaning when four collapsed into two, so a choice recorded under
 * the old keys cannot be mapped onto the new ones — somebody who accepted "Statistici" but
 * refused "Marketing" expressed something the current model has no way to represent.
 * Rather than guess, the old keys are ignored and those visitors are asked once more. The
 * previous values are deleted when the new answer is stored, so nothing lingers.
 */
const CONSENT_KEY = 'ln_cookie_consent_v2';
const PREFERENCES_KEY = 'ln_cookie_preferences_v2';

const LEGACY_KEYS = ['ln_cookie_consent', 'ln_cookie_preferences'];

/** One year — preference should survive normal browsing without re-prompting. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** Dispatched to reopen the preferences modal after consent was already given. */
export const OPEN_COOKIE_PREFERENCES_EVENT = 'ln-open-cookie-preferences';

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  optional: false,
};

const ALL_PREFERENCES: CookiePreferences = {
  essential: true,
  optional: true,
};

type ConsentValue = 'granted' | 'denied';

interface ConsentSignals {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
  functionality_storage: ConsentValue;
  personalization_storage: ConsentValue;
  security_storage: ConsentValue;
}

/** Minimal shape of the Google Consent Mode data layer, typed instead of `any`. */
type DataLayerEntry = ['consent', 'update', ConsentSignals];

interface ConsentWindow extends Window {
  dataLayer?: DataLayerEntry[];
}

interface ConsentSnapshot {
  consent: ConsentState;
  preferences: CookiePreferences;
}

const UNSET_SNAPSHOT: ConsentSnapshot = { consent: 'unset', preferences: DEFAULT_PREFERENCES };

const listeners = new Set<() => void>();

/**
 * Cached so repeated reads return the identical object.
 * `useSyncExternalStore` compares snapshots by reference and would loop forever on a
 * freshly parsed object every time.
 */
let snapshot: ConsentSnapshot = UNSET_SNAPSHOT;

const getStoredItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getCookieValue = (name: string): string | null => {
  try {
    const prefix = `${name}=`;
    const match = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    if (!match) return null;
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return null;
  }
};

const setCookieValue = (name: string, value: string): void => {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};SameSite=Lax`;
  } catch {
    // Cookie write unavailable — localStorage may still hold the choice.
  }
};

const setStoredSnapshot = (preferences: CookiePreferences): void => {
  const serialized = JSON.stringify(preferences);
  try {
    window.localStorage.setItem(CONSENT_KEY, 'true');
    window.localStorage.setItem(PREFERENCES_KEY, serialized);
    LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage unavailable — fall through to cookie mirror.
  }
  setCookieValue(CONSENT_KEY, 'true');
  setCookieValue(PREFERENCES_KEY, serialized);
};

const getParsedPreferences = (raw: string | null): CookiePreferences => {
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed, essential: true };
  } catch (error) {
    console.error('Error parsing cookie preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

const setSnapshotFromStorage = (): void => {
  let consentFlag = getStoredItem(CONSENT_KEY);
  let preferencesRaw = getStoredItem(PREFERENCES_KEY);

  // Restore from cookie mirror if localStorage was wiped but cookies remain.
  if (consentFlag !== 'true') {
    const cookieConsent = getCookieValue(CONSENT_KEY);
    const cookiePreferences = getCookieValue(PREFERENCES_KEY);
    if (cookieConsent === 'true' && cookiePreferences) {
      consentFlag = 'true';
      preferencesRaw = cookiePreferences;
      try {
        window.localStorage.setItem(CONSENT_KEY, 'true');
        window.localStorage.setItem(PREFERENCES_KEY, cookiePreferences);
      } catch {
        // Keep using cookie-backed values for this session.
      }
    }
  }

  if (consentFlag !== 'true') {
    snapshot = UNSET_SNAPSHOT;
    return;
  }
  snapshot = { consent: 'set', preferences: getParsedPreferences(preferencesRaw) };
};

let hasReadStorage = false;

const subscribe = (onStoreChange: () => void): (() => void) => {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
};

const getSnapshot = (): ConsentSnapshot => {
  if (!hasReadStorage) {
    hasReadStorage = true;
    setSnapshotFromStorage();
  }
  return snapshot;
};

/** The server has no access to localStorage, so it always renders the un-consented UI. */
const getServerSnapshot = (): ConsentSnapshot => UNSET_SNAPSHOT;

const getConsentValue = (enabled: boolean): ConsentValue => (enabled ? 'granted' : 'denied');

/**
 * Publish the choice as Google Consent Mode signals.
 *
 * The three advertising signals and personalisation are hard-denied rather than wired to a
 * toggle: the privacy policy states that no data goes to advertising platforms or any
 * other third party, so there is no setting that could legitimately turn them on. Leaving
 * them switchable would let a future tag read consent the policy never asked for.
 */
const setConsentSignals = (preferences: CookiePreferences): void => {
  const consentWindow = window as ConsentWindow;
  consentWindow.dataLayer = consentWindow.dataLayer || [];
  consentWindow.dataLayer.push([
    'consent',
    'update',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: getConsentValue(preferences.optional),
      functionality_storage: getConsentValue(preferences.essential),
      personalization_storage: 'denied',
      security_storage: 'granted',
    },
  ]);
};

const setConsent = (preferences: CookiePreferences): void => {
  const next: CookiePreferences = { ...preferences, essential: true };
  setStoredSnapshot(next);
  snapshot = { consent: 'set', preferences: next };
  setConsentSignals(next);
  listeners.forEach((listener) => listener());
};

export const useConsent = () => {
  const { consent, preferences } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const acceptAllCookies = useCallback(() => setConsent(ALL_PREFERENCES), []);

  const acceptEssentialCookies = useCallback(() => setConsent(DEFAULT_PREFERENCES), []);

  const savePreferences = useCallback(
    (custom?: CookiePreferences) => setConsent(custom ?? preferences),
    [preferences],
  );

  return { consent, preferences, acceptAllCookies, acceptEssentialCookies, savePreferences };
};
