import type { Metadata } from 'next';
// constants
import { PRIVACY_POLICY } from '@constants/legalPages';
import { BASE_URL } from '@constants/site';
// views
import LegalPageView from '@views/LegalPageView';

/**
 * The site's only legal page — privacy and cookies in one document.
 *
 * Indexable, unlike the placeholder version it replaces: this is now real information a
 * reader may well arrive at from a search, and a privacy notice that search engines are
 * told to ignore is harder to find exactly when someone needs it.
 */

const PAGE_URL = `${BASE_URL}${PRIVACY_POLICY.slug}`;

export const metadata: Metadata = {
  title: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.metaDescription,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    title: PRIVACY_POLICY.title,
    description: PRIVACY_POLICY.metaDescription,
    url: PAGE_URL,
    locale: 'ro_RO',
  },
  twitter: {
    card: 'summary',
    title: PRIVACY_POLICY.title,
    description: PRIVACY_POLICY.metaDescription,
  },
};

export default function PoliticaDeConfidentialitatePage() {
  return <LegalPageView />;
}
