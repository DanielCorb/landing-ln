import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
// constants
import { CONTRIBUTOR_RUBRICA, RUBRICA_NAMES } from '@constants/rubrici';
import { BASE_URL, POST_ROUTE, RUBRICA_ROUTE } from '@constants/site';
// utils
import { getFootnotes, getHtmlWithNoteIds } from '@utils/getFootnotes';
import { getLazyLoadedHtml } from '@utils/getHtml';
import { getIsoDate, getLongFormattedDate } from '@utils/getFormattedDate';
// lib
import { getPostBySlug, getPublishedPosts } from '@lib/firestore/posts';
import { getSettings } from '@lib/firestore/settings';
import { getBreadcrumbJsonLd, getPostJsonLd } from '@lib/seo/jsonLd';
// components
import FootnoteList from '@components/common/FootnoteList';
import FootnotePopup from '@components/common/FootnotePopup';
import KofiIcon from '@components/icons/KofiIcon';
import RubricaCarousel from '@components/common/RubricaCarousel';

interface PostViewProps {
  slug: string;
}

/** How many sibling posts to pull before filtering the current one out. */
const RELATED_FETCH_SIZE = 7;

/**
 * The body is rendered from TipTap HTML, so the alignment is applied to the paragraphs
 * and list items through child selectors rather than inherited from the wrapper —
 * headings, captions and table cells keep the alignment the design gives them.
 */
const ARTICLE_BODY_CLASS =
  'article-body text-base text-text-primary sm:text-lg [&_li]:text-justify [&_p]:text-justify';

const RELATED_DISPLAY_SIZE = 6;

/** A single post, whichever rubrică it belongs to. */
const PostView: FC<PostViewProps> = async ({ slug }) => {
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    getPublishedPosts({ rubrica: post.rubrica, page: 1, pageSize: RELATED_FETCH_SIZE }),
  ]);

  const otherPosts = related.posts
    .filter((entry) => entry.id !== post.id)
    .slice(0, RELATED_DISPLAY_SIZE);
  const footnotes = getFootnotes(post.body);
  const rubricaName = RUBRICA_NAMES[post.rubrica];

  return (
    <article className="animate-fade-in" id={`post-${post.slug}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPostJsonLd(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: 'Acasă', url: BASE_URL },
              { name: rubricaName, url: `${BASE_URL}${RUBRICA_ROUTE}/${post.rubrica}` },
              { name: post.title, url: `${BASE_URL}${POST_ROUTE}/${post.slug}` },
            ]),
          ),
        }}
      />

      <div className="mx-auto max-w-content px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
        <div className="mb-[40px] grid grid-cols-1 items-start gap-[40px] md:grid-cols-2">
          <div className="flex flex-col justify-start">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 font-semibold text-teal">
              <Link
                href={`${RUBRICA_ROUTE}/${post.rubrica}`}
                className="text-lg transition-all hover:underline sm:text-xl"
              >
                {rubricaName}
              </Link>
              <time dateTime={getIsoDate(post.publishAt)} className="text-lg sm:text-xl">
                {getLongFormattedDate(post.publishAt)}
              </time>
            </div>

            <h1 className="mb-4 font-display text-4xl leading-tight text-text-primary sm:text-5xl md:text-6xl">
              {post.title}
            </h1>

            {/*
             * Signed only on reader contributions. The name links back to the rubrică
             * filtered to that author, which is the same URL the filter there produces.
             */}
            {post.rubrica === CONTRIBUTOR_RUBRICA && post.contributor && (
              <p className="mb-4 text-base text-text-secondary sm:text-lg">
                de{' '}
                <Link
                  href={`${RUBRICA_ROUTE}/${post.rubrica}?author=${encodeURIComponent(post.contributor)}`}
                  className="font-semibold text-teal underline-offset-4 transition-colors hover:underline dark:hover:text-teal-light"
                >
                  {post.contributor}
                </Link>
              </p>
            )}

            {post.lead && (
              <p className="text-justify text-xs font-medium italic leading-relaxed text-teal">
                ({post.lead})
              </p>
            )}
          </div>

          <div className="w-full overflow-hidden rounded-xl bg-teal/10">
            {post.coverImageUrl && (
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                width={1200}
                height={800}
                priority
                fetchPriority="high"
                className="h-auto w-full object-contain object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>

        <div className="w-full">
          <div
            className={ARTICLE_BODY_CLASS}
            dangerouslySetInnerHTML={{
              // Only promote the first body image when there is no cover competing with it.
              __html: getHtmlWithNoteIds(
                getLazyLoadedHtml(post.body, { eagerFirstImage: !post.coverImageUrl }),
              ),
            }}
          />
        </div>

        <FootnoteList footnotes={footnotes} />

        {settings.kofiLink && (
          <div className="mt-16 text-center">
            <h2 className="mb-4 font-display text-xl text-text-primary sm:text-2xl">
              Îți place ce citești?
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-text-secondary">
              Susține publicația Lumea Nouă cu o donație. Contribuția ta ne ajută să continuăm să
              publicăm materiale de calitate.
            </p>
            <a
              href={settings.kofiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-teal px-8 py-4 text-lg font-bold text-white shadow-md transition-transform hover:scale-105"
            >
              <KofiIcon size={26} />
              Susține publicația
            </a>
          </div>
        )}
      </div>

      {otherPosts.length > 0 && (
        <section className="mx-auto mt-8 max-w-content border-t border-border px-4 py-12 sm:px-6 sm:py-16">
          <RubricaCarousel
            posts={otherPosts}
            rubrica={post.rubrica}
            heading={`Mai multe din ${rubricaName}`}
            headingClass="font-display text-2xl uppercase text-text-primary sm:text-3xl"
            moreHref={`${RUBRICA_ROUTE}/${post.rubrica}`}
          />
        </section>
      )}

      <FootnotePopup />
    </article>
  );
};

export default PostView;
