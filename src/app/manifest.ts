import type { MetadataRoute } from 'next';
// constants
import { SITE_DESCRIPTION, SITE_NAME } from '@constants/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#E8F1F2',
    theme_color: '#328992',
    /**
     * No `icons` array on purpose.
     *
     * Next already emits `<link rel="icon">` for `app/icon.png`, with its own
     * cache-busting query. Listing the same file here under its bare path made browsers
     * fetch it a second time under a different URL — 24 KB duplicated on every page load,
     * which is the same mistake the old 262 KB favicon made, just smaller. The site has no
     * service worker and is not installable, so nothing is lost by leaving it out.
     */
    icons: [],
  };
}
