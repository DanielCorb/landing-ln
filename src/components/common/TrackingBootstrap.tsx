'use client';

import { useEffect } from 'react';
// hooks
import { useConsent } from '@hooks/useConsent';

function isEmbedPreview(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ln_embed_picker') === '1') return true;
    const w = window as Window & { __LN_EMBED_PICKER__?: boolean };
    if (w.__LN_EMBED_PICKER__) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function resolveConfig() {
  const ingestKey = process.env.NEXT_PUBLIC_LN_INGEST_KEY;
  const dataKey = process.env.NEXT_PUBLIC_LN_DATA_KEY;
  const apiBase = (process.env.NEXT_PUBLIC_LN_API_BASE || '').replace(/\/+$/, '');
  return { ingestKey, dataKey, apiBase };
}

type LnTrackingConfig = {
  LN_INGEST_KEY: string;
  LN_DATA_KEY: string;
  LN_API_BASE: string;
  consentOptional: boolean;
  consentDecided: boolean;
};

function publishConsent(optional: boolean, decided: boolean) {
  const w = window as Window & { __LN_TRACKING__?: LnTrackingConfig };
  if (!w.__LN_TRACKING__) return;
  w.__LN_TRACKING__.consentOptional = optional;
  w.__LN_TRACKING__.consentDecided = decided;
  window.dispatchEvent(
    new CustomEvent('ln-consent-changed', {
      detail: { optional, decided },
    }),
  );
}

function ensureTrackerLoaded(config: {
  ingestKey: string;
  dataKey: string;
  apiBase: string;
  consentOptional: boolean;
  consentDecided: boolean;
}) {
  const w = window as Window & { __LN_TRACKING__?: LnTrackingConfig };
  w.__LN_TRACKING__ = {
    LN_INGEST_KEY: config.ingestKey,
    LN_DATA_KEY: config.dataKey,
    LN_API_BASE: config.apiBase,
    consentOptional: config.consentOptional,
    consentDecided: config.consentDecided,
  };

  if (document.querySelector('script[data-ln-tracker]')) return;

  const script = document.createElement('script');
  script.type = 'module';
  script.dataset.lnTracker = '1';
  script.src = '/tracker.js';
  script.onerror = () => {
    console.warn(
      '[tracking] /tracker.js missing — download it from the dashboard Tracking page and place it in landing-ln/public/tracker.js',
    );
  };
  document.head.appendChild(script);
}

/**
 * Always loads the tracker for essential session/country/article-open tracking.
 * Optional consent only gates behavioral metrics (time, scroll, clicks, tags).
 */
export default function TrackingBootstrap() {
  const { preferences, consent } = useConsent();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isEmbedPreview()) return;

    const { ingestKey, dataKey, apiBase } = resolveConfig();
    if (!ingestKey || !apiBase) return;
    if (!dataKey || dataKey.length < 8) return;

    const decided = consent === 'set';
    const optional = decided && preferences.optional;

    ensureTrackerLoaded({
      ingestKey,
      dataKey,
      apiBase,
      consentOptional: optional,
      consentDecided: decided,
    });
    publishConsent(optional, decided);
  }, [consent, preferences.optional]);

  return null;
}
