import type { Metadata } from 'next';
// constants
import { BASE_URL } from '@constants/site';
// models
import { PostListView, PostSort } from '@models/post';
// views
import ArchiveView from '@views/ArchiveView';

const TITLE = 'Arhivă';

const DESCRIPTION = 'Explorează toate postările și rubricile publicației Lumea Nouă.';

// Keep in sync with REVALIDATE_SECONDS in @constants/site — Next.js needs a literal here.
export const revalidate = 300;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/arhiva` },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/arhiva`,
    locale: 'ro_RO',
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

interface ArhivaPageProps {
  searchParams: Promise<{
    sort?: string;
    view?: string;
    dateStart?: string;
    dateEnd?: string;
  }>;
}

export default async function ArhivaPage({ searchParams }: ArhivaPageProps) {
  const params = await searchParams;

  return (
    <ArchiveView
      sort={(params.sort === 'oldest' ? 'oldest' : 'newest') as PostSort}
      view={(params.view === 'list' ? 'list' : 'grid') as PostListView}
      dateStart={params.dateStart}
      dateEnd={params.dateEnd}
    />
  );
}
