import type { Metadata } from 'next';
// lib
import { getVerifiedEmail } from '@lib/newsletter/token';
// views
import UnsubscribeView from '@views/UnsubscribeView';

/**
 * Landing page for the "Dezabonează-te" link in a newsletter email.
 *
 * Rendered per request — the token in the query string has to be verified server-side
 * before the address is shown, so there is nothing here to cache. `noindex` because the
 * URL is personal to one subscriber and has no business in a search index.
 */

const TITLE = 'Dezabonare';

const DESCRIPTION = 'Dezabonează-te de la newsletterul Lumea Nouă.';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

interface UnsubscribePageProps {
  searchParams: Promise<{ e?: string; t?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { e, t } = await searchParams;

  return <UnsubscribeView email={getVerifiedEmail(e ?? null, t ?? null)} />;
}
