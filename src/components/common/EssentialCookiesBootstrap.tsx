'use client';

import { useEffect, type FC } from 'react';
// lib
import { ensureEssentialCookies } from '@lib/essentialCookies';

/**
 * Sets the necessary session + country cookies on every visit (GDPR essential).
 * Independent of optional analytics consent.
 */
const EssentialCookiesBootstrap: FC = () => {
  useEffect(() => {
    ensureEssentialCookies();
  }, []);

  return null;
};

export default EssentialCookiesBootstrap;
