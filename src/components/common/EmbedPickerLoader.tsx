'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Loads the dashboard embed/selector-picker script only when opened from the
 * dashboard preview (`?ln_embed_picker=1`). Invisible on normal visits.
 *
 * Dashboard origin is read from the query (`ln_dashboard`) first so the picker
 * works without landing .env, then falls back to env vars.
 */
export default function EmbedPickerLoader() {
  const searchParams = useSearchParams();
  const enabled = searchParams.get('ln_embed_picker') === '1';
  const dashboardFromQuery = searchParams.get('ln_dashboard');

  useEffect(() => {
    if (!enabled) return;

    const fromQuery = (dashboardFromQuery || '').replace(/\/+$/, '');
    const fromEnv = (
      process.env.NEXT_PUBLIC_LN_API_BASE ||
      process.env.NEXT_PUBLIC_DASHBOARD_URL ||
      ''
    ).replace(/\/+$/, '');
    const apiBase = fromQuery || fromEnv;

    if (!apiBase) {
      console.warn(
        '[embed] Missing dashboard origin. Open the preview from the dashboard Tracking page, or set NEXT_PUBLIC_DASHBOARD_URL.',
      );
      return;
    }

    const existing = document.querySelector('script[data-ln-embed]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = `${apiBase}/api/embed/script`;
    script.async = true;
    script.dataset.lnEmbed = '1';
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [enabled, dashboardFromQuery]);

  return null;
}
