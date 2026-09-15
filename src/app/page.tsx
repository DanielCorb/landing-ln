import type { Metadata } from 'next';
// constants
import { BASE_URL, SITE_DESCRIPTION } from '@constants/site';
// views
import HomeView from '@views/HomeView';

const TITLE = 'Lumea Nouă — Publicație online independentă';

/**
 * ISR window. The dashboard also pings /api/revalidate the moment a post is published,
 * so this is only the ceiling for how stale the homepage can get if that ping is lost.
 */
// Keep in sync with REVALIDATE_SECONDS in @constants/site — Next.js needs a literal here.
export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    locale: 'ro_RO',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: SITE_DESCRIPTION },
};

export default function HomePage() {
  return <HomeView />;
}
