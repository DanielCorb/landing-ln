'use client';

import type { FC } from 'react';
// hooks
import { OPEN_COOKIE_PREFERENCES_EVENT } from '@hooks/useConsent';

/**
 * Re-opens the cookie preferences modal from the privacy policy.
 *
 * CookieBar listens for `OPEN_COOKIE_PREFERENCES_EVENT` so the bar can stay hidden
 * after consent while still allowing a later change of mind.
 */
const ManageCookiesButton: FC = () => {
  const handleClick = () => {
    window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
  };

  return (
    <div className="border-t border-border pt-10">
      <p className="mb-8 text-base leading-relaxed text-text-secondary sm:text-lg">
        Poți schimba oricând ce cookie-uri opționale accepți. Alegerea se salvează în
        browser-ul tău.
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-lg bg-teal px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-teal-dark"
      >
        Modifică preferințele cookie-uri
      </button>
    </div>
  );
};

export default ManageCookiesButton;
