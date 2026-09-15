'use client';

import { useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import { ExternalLink, X } from 'lucide-react';
// constants
import {
  ESSENTIAL_COOKIES,
  ESSENTIAL_COOKIES_SUMMARY,
  OPTIONAL_COOKIES,
  OPTIONAL_COOKIES_SUMMARY,
} from '@constants/cookies';
// models
import { CookiePreferences } from '@models/consent';
// utils
import { getClassNames } from '@utils/getClassNames';
// hooks
import { useConsent } from '@hooks/useConsent';

/**
 * Per-category consent.
 *
 * The two cards are the two categories in section 3 of the privacy policy, listing the
 * same cookies word for word — both read `@constants/cookies`, so the dialog cannot drift
 * from the notice it links to.
 */

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_CARD_CLASS = 'rounded-lg border border-border bg-background/50 p-4';

const TRACK_CLASS = 'block h-6 w-11 rounded-full transition-colors';

const COOKIE_LIST_CLASS = 'mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted';

const POLICY_LINK_CLASS =
  'inline-flex items-center gap-1.5 font-medium text-teal underline-offset-4 transition-colors hover:underline dark:hover:text-teal-light';

const CookiePreferencesModal: FC<CookiePreferencesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { preferences, savePreferences } = useConsent();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

  useEffect(() => {
    if (isOpen) setLocalPreferences(preferences);
  }, [isOpen, preferences]);

  const handleSave = () => {
    savePreferences(localPreferences);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const isOptionalOn = localPreferences.optional;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Închide modal"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-fade-in-up relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl text-text-primary sm:text-2xl">
              Preferințe Cookie-uri
            </h3>
            <button
              type="button"
              aria-label="Închide"
              className="p-2 text-text-muted transition-colors hover:text-text-primary"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-5 text-justify text-sm leading-relaxed text-text-secondary">
            Folosim două categorii de cookie-uri. Cele necesare fac site-ul să funcționeze, iar cele
            opționale ne arată cum e citit — și le setăm doar dacă le accepți aici. Nu folosim
            reclame și nu dăm datele tale niciunui terț.
          </p>

          <div className="mb-6 space-y-4">
            <div className={CATEGORY_CARD_CLASS}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <h4 className="font-medium text-text-primary">Necesare</h4>
                <div className="relative shrink-0">
                  <input
                    disabled
                    checked
                    readOnly
                    className="sr-only"
                    id="cookie-essential"
                    type="checkbox"
                  />
                  <label
                    className={getClassNames(TRACK_CLASS, 'cursor-not-allowed bg-teal opacity-80')}
                    htmlFor="cookie-essential"
                  >
                    <span className="sr-only">Cookie-uri necesare (mereu active)</span>
                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                  </label>
                </div>
              </div>
              <p className="text-justify text-sm text-text-muted">{ESSENTIAL_COOKIES_SUMMARY}</p>
              <ul className={COOKIE_LIST_CLASS}>
                {ESSENTIAL_COOKIES.map((cookie) => (
                  <li key={cookie}>{cookie}</li>
                ))}
              </ul>
            </div>

            <div className={CATEGORY_CARD_CLASS}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <h4 className="font-medium text-text-primary">Opționale</h4>
                <div className="relative shrink-0">
                  <input
                    checked={isOptionalOn}
                    className="sr-only"
                    id="cookie-optional"
                    type="checkbox"
                    onChange={() =>
                      setLocalPreferences((previous) => ({
                        ...previous,
                        optional: !previous.optional,
                      }))
                    }
                  />
                  <label
                    className={getClassNames(
                      `${TRACK_CLASS} cursor-pointer`,
                      isOptionalOn ? 'bg-teal' : 'bg-border',
                    )}
                    htmlFor="cookie-optional"
                  >
                    <span className="sr-only">Cookie-uri opționale</span>
                    <span
                      className={getClassNames(
                        'absolute top-1 h-4 w-4 rounded-full transition-all',
                        isOptionalOn
                          ? 'right-1 bg-white'
                          : 'left-1 border border-border bg-surface',
                      )}
                    />
                  </label>
                </div>
              </div>
              <p className="text-justify text-sm text-text-muted">{OPTIONAL_COOKIES_SUMMARY}</p>
              <ul className={COOKIE_LIST_CLASS}>
                {OPTIONAL_COOKIES.map((cookie) => (
                  <li key={cookie}>{cookie}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-5 rounded-lg border border-border bg-background/50 p-3 text-center">
            <Link
              className={POLICY_LINK_CLASS}
              href="/politica-de-confidentialitate"
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
            >
              Citește Politica de Confidențialitate și Cookie-uri
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <p className="mt-1 text-xs text-text-muted">
              Se deschide într-o filă nouă, ca să nu pierzi setările de aici.
            </p>
          </div>

          <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              className="rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              onClick={onClose}
            >
              Anulează
            </button>
            <button
              type="button"
              className="rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-teal-dark"
              onClick={handleSave}
            >
              Salvează Preferințele
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferencesModal;
