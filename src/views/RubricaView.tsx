import type { FC } from 'react';
import { notFound } from 'next/navigation';
// constants
import { CONTRIBUTOR_RUBRICA, RUBRICI } from '@constants/rubrici';
import { BASE_URL, POSTS_BATCH_SIZE, RUBRICA_ROUTE } from '@constants/site';
// models
import { PostListView, PostSort, Rubrica } from '@models/post';
// lib
import { getContributors, getPublishedPosts } from '@lib/firestore/posts';
import { getBreadcrumbJsonLd, getCollectionPageJsonLd } from '@lib/seo/jsonLd';
// components
import AuthorFilter from '@components/common/AuthorFilter';
import InfinitePostList from '@components/common/InfinitePostList';
import RubricaBadge from '@components/common/RubricaBadge';
import SecondaryBanner from '@components/common/SecondaryBanner';
import SortControls from '@components/common/SortControls';
import articoleTitleImg from '@assets/rubrica-articole-scris.png';
import contributiiTitleImg from '@assets/rubrica-contr-scris.png';
import traduceriTitleImg from '@assets/rubrica-trans-scris.png';

interface RubricaViewProps {
  slug: string;
  sort: PostSort;
  view: PostListView;
  dateStart?: string;
  dateEnd?: string;
  /** Contributor name from `?author=`; ignored outside the contributions rubrică. */
  author?: string;
}

const TITLE_IMAGES = {
  articole: articoleTitleImg,
  traduceri: traduceriTitleImg,
  'contributiile-cititorilor': contributiiTitleImg,
};

/**
 * Listing for a single rubrică.
 *
 * The date range and the sort direction are read here and passed straight into the
 * query. They used to be rendered by `SortControls` but ignored by the page, so picking
 * a period on a rubrică page changed the URL and nothing else.
 *
 * Only the first batch is rendered here; `InfinitePostList` appends the rest as the
 * reader scrolls, the same way the archive does.
 */
const RubricaView: FC<RubricaViewProps> = async ({
  slug,
  sort,
  view,
  dateStart,
  dateEnd,
  author,
}) => {
  const meta = RUBRICI.find((entry) => entry.slug === slug);
  if (!meta) notFound();

  const rubrica = meta.slug as Rubrica;
  // Only contributions are signed, so an `?author=` on any other rubrică is ignored
  // rather than silently emptying the listing.
  const activeAuthor = rubrica === CONTRIBUTOR_RUBRICA ? author : undefined;

  const [{ posts, total }, authors] = await Promise.all([
    getPublishedPosts({
      rubrica,
      page: 1,
      pageSize: POSTS_BATCH_SIZE,
      sort,
      dateStart,
      dateEnd,
      author: activeAuthor,
    }),
    rubrica === CONTRIBUTOR_RUBRICA ? getContributors(rubrica) : Promise.resolve([]),
  ]);

  const rubricaUrl = `${BASE_URL}${RUBRICA_ROUTE}/${rubrica}`;

  return (
    <div className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: 'Acasă', url: BASE_URL },
              { name: meta.name, url: rubricaUrl },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageJsonLd({
              name: meta.name,
              description: meta.description,
              url: rubricaUrl,
            }),
          ),
        }}
      />

      <SecondaryBanner
        title={meta.name}
        subtitle={meta.description}
        titleImage={TITLE_IMAGES[rubrica]}
      />

      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <RubricaBadge rubrica={rubrica} size="lg" />
            <span className="text-sm text-text-muted">
              {total} {total === 1 ? 'postare' : 'postări'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AuthorFilter authors={authors} selected={activeAuthor} />
            <SortControls sort={sort} view={view} dateStart={dateStart} dateEnd={dateEnd} />
          </div>
        </div>

        <InfinitePostList
          key={`${sort}-${dateStart ?? ''}-${dateEnd ?? ''}-${activeAuthor ?? ''}`}
          initialPosts={posts}
          totalPosts={total}
          pageSize={POSTS_BATCH_SIZE}
          view={view}
          sort={sort}
          dateStart={dateStart}
          dateEnd={dateEnd}
          rubrica={rubrica}
          author={activeAuthor}
          emptyMessage={
            activeAuthor
              ? `Nu există postări publicate de ${activeAuthor} pentru filtrele alese.`
              : 'Nu există postări publicate în această rubrică pentru filtrele alese.'
          }
        />
      </section>
    </div>
  );
};

export default RubricaView;
