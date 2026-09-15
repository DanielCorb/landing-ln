import type { FC } from 'react';
import Link from 'next/link';
// constants
import { RUBRICI, RUBRICI_INTRO, RUBRICI_SUBMISSION_NOTE } from '@constants/rubrici';
import { POSTS_BATCH_SIZE, BASE_URL, CONTACT_EMAIL, RUBRICA_ROUTE } from '@constants/site';
// models
import { PostListView, PostSort } from '@models/post';
// lib
import { getPublishedPosts } from '@lib/firestore/posts';
import { getBreadcrumbJsonLd } from '@lib/seo/jsonLd';
// components
import InfinitePostList from '@components/common/InfinitePostList';
import RubricaCard from '@components/common/RubricaCard';
import SortControls from '@components/common/SortControls';

interface ArchiveViewProps {
  sort: PostSort;
  view: PostListView;
  dateStart?: string;
  dateEnd?: string;
}

/** Archive: the three rubrici, then every published post with filters. */
const ArchiveView: FC<ArchiveViewProps> = async ({ sort, view, dateStart, dateEnd }) => {
  const { posts, total } = await getPublishedPosts({
    page: 1,
    pageSize: POSTS_BATCH_SIZE,
    dateStart,
    dateEnd,
    sort,
  });

  return (
    <div className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: 'Acasă', url: BASE_URL },
              { name: 'Arhivă', url: `${BASE_URL}/arhiva` },
            ]),
          ),
        }}
      />

      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <h2 className="mb-2 font-display text-3xl text-text-primary sm:text-4xl">Rubrici</h2>
        <p className="mb-6 max-w-3xl text-text-secondary">{RUBRICI_INTRO}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {RUBRICI.map((rubrica) => (
            <Link key={rubrica.slug} href={`${RUBRICA_ROUTE}/${rubrica.slug}`}>
              {/* Above the fold on this page, so these load eagerly */}
              <RubricaCard rubrica={rubrica.slug} priority />
            </Link>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm text-text-muted">
          {RUBRICI_SUBMISSION_NOTE}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>

      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-display text-3xl text-text-primary sm:text-4xl">Toate postările</h2>
          <SortControls sort={sort} view={view} dateStart={dateStart} dateEnd={dateEnd} />
        </div>

        <InfinitePostList
          key={`${sort}-${dateStart ?? ''}-${dateEnd ?? ''}`}
          initialPosts={posts}
          totalPosts={total}
          pageSize={POSTS_BATCH_SIZE}
          view={view}
          sort={sort}
          dateStart={dateStart}
          dateEnd={dateEnd}
        />
      </section>
    </div>
  );
};

export default ArchiveView;
