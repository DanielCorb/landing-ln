import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// constants
import { RUBRICA_NAMES } from '@constants/rubrici';
import {
  BASE_URL,
  HOMEPAGE_RUBRICA_COUNT,
  POST_ROUTE,
  RECENT_POSTS_COUNT,
  RUBRICA_ROUTE,
} from '@constants/site';
// models
import { Rubrica } from '@models/post';
// utils
import { getFormattedDate, getIsoDate } from '@utils/getFormattedDate';
import { getExcerpt } from '@utils/getHtml';
// lib
import { getLatestPost, getPublishedPosts, getRecentPosts } from '@lib/firestore/posts';
import { getBreadcrumbJsonLd, getCollectionPageJsonLd } from '@lib/seo/jsonLd';
// components
import GlobeImage from '@components/icons/GlobeImage';
import NewsletterWidget from '@components/common/NewsletterWidget';
import PostCarousel from '@components/common/PostCarousel';
import RubricaBadge from '@components/common/RubricaBadge';
import RubricaCarousel from '@components/common/RubricaCarousel';

/** Rubrici that get their own carousel on the homepage, in display order. */
const FEATURED_RUBRICI: Rubrica[] = ['articole', 'traduceri', 'contributiile-cititorilor'];

const HERO_LEAD_LENGTH = 240;

/**
 * Hero card.
 *
 * On phones the text sits in normal flow below the cover. From `sm:` up the two are
 * stacked in a single grid cell so the text reads as an overlay — but, unlike absolute
 * positioning, the text still contributes its height to the row. That matters because
 * the lead is shown in full: a long one used to grow taller than the fixed 16:9 cover
 * and, since the card clips its overflow, the rubrică badge and the date at the top were
 * the first things cut off. Here the card grows instead and the cover stretches to match.
 *
 * Note this is one DOM node with responsive classes rather than two variants: a second
 * copy would put the cover image in the document twice, and browsers fetch images even
 * inside a `display:none` subtree.
 */
const HERO_CARD_CLASS =
  'group block overflow-hidden rounded-card border border-border bg-surface sm:grid sm:border-0';

/** Stretches to the row when the text is the taller of the two; `object-cover` absorbs it. */
const HERO_COVER_CLASS = 'relative aspect-[16/9] w-full bg-[#328992] sm:[grid-area:1/1]';

/**
 * `relative` is load-bearing, not decorative: the cover shares this grid cell and is
 * itself positioned, and a positioned element paints over a static one no matter the DOM
 * order. Without it the text renders *underneath* the image and the hero looks empty.
 */
const HERO_TEXT_CLASS = 'relative p-5 sm:[grid-area:1/1] sm:self-end sm:p-8';

const HERO_TITLE_CLASS =
  'mb-3 line-clamp-3 font-display text-3xl text-text-primary transition-colors duration-300 sm:line-clamp-2 sm:text-4xl sm:text-offwhite sm:group-hover:text-teal-light md:text-5xl';

const HERO_LEAD_CLASS = 'text-justify text-sm text-text-secondary sm:text-base sm:text-offwhite/80';

const HERO_DATE_CLASS = 'text-xs text-text-muted sm:text-offwhite/70';
const HomeView: FC = async () => {
  const [hero, recentPosts, rubricaSections] = await Promise.all([
    getLatestPost(),
    getRecentPosts(RECENT_POSTS_COUNT),
    Promise.all(
      FEATURED_RUBRICI.map((rubrica) =>
        getPublishedPosts({ page: 1, pageSize: HOMEPAGE_RUBRICA_COUNT, rubrica }).then(
          (result) => ({ rubrica, posts: result.posts }),
        ),
      ),
    ),
  ]);

  return (
    <div className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getCollectionPageJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd([{ name: 'Acasă', url: BASE_URL }])),
        }}
      />

      {/* Hero + newsletter */}
      <section className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            {hero ? (
              <Link href={`${POST_ROUTE}/${hero.slug}`} className={HERO_CARD_CLASS} id="hero-post">
                <div className={HERO_COVER_CLASS}>
                  {hero.coverImageUrl ? (
                    <Image
                      src={hero.coverImageUrl}
                      alt={hero.title}
                      fill
                      priority
                      fetchPriority="high"
                      className="object-cover transition-transform duration-700 sm:group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 70vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <GlobeImage size={140} priority />
                    </div>
                  )}
                  {/* Contrast wash — only needed where the text sits on top of the image */}
                  <div className="absolute inset-0 hidden bg-gradient-to-t from-black/80 via-black/25 to-transparent sm:block" />
                </div>

                <div className={HERO_TEXT_CLASS}>
                  <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <RubricaBadge rubrica={hero.rubrica} size="sm" />
                    <time dateTime={getIsoDate(hero.publishAt)} className={HERO_DATE_CLASS}>
                      {getFormattedDate(hero.publishAt)}
                    </time>
                  </div>
                  <h1 className={HERO_TITLE_CLASS}>{hero.title}</h1>
                  <p className={HERO_LEAD_CLASS}>
                    {hero.lead || getExcerpt(hero.body, HERO_LEAD_LENGTH)}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-card border border-border bg-surface">
                <p className="text-text-muted">Nicio postare publicată încă.</p>
              </div>
            )}
          </div>

          <div className="w-full flex-shrink-0 lg:w-80">
            <NewsletterWidget />
          </div>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="relative mt-8 overflow-hidden bg-surface py-10 shadow-sm sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-teal/5" />
          <div className="relative z-10 mx-auto max-w-content px-4 sm:px-6">
            <PostCarousel posts={recentPosts} title="Ultimele publicații" />
          </div>
        </section>
      )}

      {rubricaSections.map(
        (section) =>
          section.posts.length > 0 && (
            <section
              key={section.rubrica}
              className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12"
            >
              <RubricaCarousel
                posts={section.posts}
                rubrica={section.rubrica}
                heading={RUBRICA_NAMES[section.rubrica]}
                headingClass="font-display text-3xl text-text-primary sm:text-4xl"
                moreHref={`${RUBRICA_ROUTE}/${section.rubrica}`}
              />
            </section>
          ),
      )}
    </div>
  );
};

export default HomeView;
