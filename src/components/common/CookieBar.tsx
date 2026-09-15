'use client';

import { useEffect, useState, type FC } from 'react';
import Link from 'next/link';
// hooks
import { OPEN_COOKIE_PREFERENCES_EVENT, useConsent } from '@hooks/useConsent';
// components
import CookiePreferencesModal from '@components/common/CookiePreferencesModal';

const GHOST_BUTTON_CLASS =
  'w-full rounded-lg border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 sm:w-auto';

const PRIMARY_BUTTON_CLASS =
  'w-full rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-teal shadow-md transition-all hover:bg-offwhite sm:w-auto';

const CookieBar: FC = () => {
  const { consent, acceptAllCookies, acceptEssentialCookies } = useConsent();
  const [showModal, setShowModal] = useState(false);
  // Server always sees consent as unset; wait for the client store before showing the bar
  // so a saved choice never flashes the banner again after reload.
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const openPreferences = () => setShowModal(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  const handlePreferencesSaved = () => {
    setShowModal(false);
    // Give the tracker a tick to persist+flush the outbox before reload.
    window.setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const showBanner = hasMounted && consent === 'unset';

  return (
    <>
      {showBanner ? (
        <div className="animate-fade-in-up pointer-events-none fixed inset-x-0 bottom-6 z-[1100] flex justify-center px-4">
          <div className="pointer-events-auto flex w-full max-w-content flex-col items-start justify-between gap-6 rounded-xl border-none bg-teal px-6 py-5 text-offwhite shadow-2xl selection:bg-white selection:text-teal lg:flex-row lg:items-center">
            {/* The copy and its link share one line, so the alignment sits on the block that
                wraps them — an inline <p> would ignore it. */}
            <div className="flex-1 text-justify">
              <p className="mb-1 text-base font-medium text-white">Respectăm intimitatea ta</p>
              {/* Matches section 3 of the privacy policy. The previous copy promised
                  "conținut personalizat sau reclame" — advertising the site does not run and
                  the policy explicitly rules out, which would have made this an invitation to
                  consent to something that never happens. */}
              <p className="inline text-sm text-offwhite/90">
                Folosim cookie-uri necesare, ca site-ul să funcționeze, și cookie-uri opționale, ca să
                înțelegem cum e citit. Nu folosim reclame și nu dăm datele tale niciunui terț.
              </p>
              <Link
                className="ml-2 inline-flex text-sm font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80"
                href="/politica-de-confidentialitate"
                prefetch={false}
              >
                Politica de Confidențialitate și Cookie-uri
              </Link>
            </div>

            <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:flex-row lg:w-auto">
              <button type="button" className={GHOST_BUTTON_CLASS} onClick={() => setShowModal(true)}>
                Setări
              </button>
              <button type="button" className={GHOST_BUTTON_CLASS} onClick={acceptEssentialCookies}>
                Doar Necesare
              </button>
              <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={acceptAllCookies}>
                Acceptă Tot
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CookiePreferencesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handlePreferencesSaved}
      />
    </>
  );
};

export default CookieBar;
