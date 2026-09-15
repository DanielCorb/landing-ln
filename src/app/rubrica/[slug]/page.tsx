import type { Metadata } from 'next';
// constants
import { RUBRICI } from '@constants/rubrici';
import { BASE_URL, RUBRICA_ROUTE } from '@constants/site';
// models
import { PostListView, PostSort } from '@models/post';
// views
import RubricaView from '@views/RubricaView';

// Keep in sync with REVALIDATE_SECONDS in @constants/site - Next.js needs a literal here.
export const revalidate = 300;

interface RubricaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    view?: string;
    dateStart?: string;
    dateEnd?: string;
    author?: string;
  }>;
}

export function generateStaticParams() {
  return RUBRICI.map((rubrica) => ({ slug: rubrica.slug }));
}

export async function generateMetadata({ params }: RubricaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = RUBRICI.find((entry) => entry.slug === slug);
  if (!meta) return { title: 'Rubrică negăsită' };

  const pageUrl = `${BASE_URL}${RUBRICA_ROUTE}/${slug}`;

  return {
    title: meta.name,
    description: meta.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      title: meta.name,
      description: meta.description,
      url: pageUrl,
      locale: 'ro_RO',
    },
    twitter: { card: 'summary', title: meta.name, description: meta.description },
  };
}

export default async function RubricaPage({ params, searchParams }: RubricaPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  return (
    <RubricaView
      slug={slug}
      sort={(query.sort === 'oldest' ? 'oldest' : 'newest') as PostSort}
      view={(query.view === 'list' ? 'list' : 'grid') as PostListView}
      dateStart={query.dateStart}
      dateEnd={query.dateEnd}
      author={query.author}
    />
  );
}
