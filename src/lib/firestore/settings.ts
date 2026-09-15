import { cache } from 'react';
// constants
import { SETTINGS_DOC, SITE_NAME } from '@constants/site';
// models
import { SiteSettings } from '@models/settings';
// lib
import { adminDb } from '@lib/firebase/admin';

const DEFAULT_SETTINGS: SiteSettings = {
  publicationName: SITE_NAME,
  logoUrl: '',
  socialLinks: [],
  seoDefaults: {
    metaTitle: SITE_NAME,
    metaDescription: 'Publicație online',
    faviconUrl: '',
  },
};

const SURROUNDING_QUOTES = /^["']|["']$/g;

/**
 * Site settings from `settings/general`.
 *
 * Memoized per request — the root layout reads it for `generateMetadata` *and* for the
 * header, and several pages read it again; without this that is one Firestore round
 * trip each, on the critical path of every single page render.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const document = await adminDb.doc(SETTINGS_DOC).get();
  if (!document.exists) return DEFAULT_SETTINGS;

  const data = document.data() ?? {};

  return {
    publicationName: data.publicationName || DEFAULT_SETTINGS.publicationName,
    logoUrl: data.logoUrl || '',
    socialLinks: data.socialLinks || [],
    seoDefaults: data.seoDefaults || DEFAULT_SETTINGS.seoDefaults,
    contactEmail: data.contactEmail,
    notificationEmail: data.notificationEmail,
    aboutPageContent: data.aboutPageContent,
    kofiLink: data.kofiLink
      ? String(data.kofiLink).replace(SURROUNDING_QUOTES, '').trim()
      : undefined,
  };
});
