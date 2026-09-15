import type { Metadata } from 'next';
// constants
import { RUBRICA_NAMES } from '@constants/rubrici';
import { BASE_URL, POST_ROUTE, SITE_NAME } from '@constants/site';
// utils
import { getExcerpt } from '@utils/getHtml';
// lib
import { getAllPublishedPosts, getPostBySlug } from '@lib/firestore/posts';
import { getSettings } from '@lib/firestore/settings';
// views
import PostView from '@views/PostView';

/**
 * Canonical route for a post, whichever rubrică it belongs to.
 *
 * The old `/articol/:slug` route redirects here permanently (see next.config.ts) — the
 * route name used to imply that every post was an "articol", when "articole" is only
 * one of the three rubrici.
 */

const DESCRIPTION_LENGTH = 160;

// Keep in sync with REVALIDATE_SECONDS in @constants/site - Next.js needs a literal here.
export const revalidate = 300;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()]);
  if (!post) return { title: 'Postare negăsită' };

  const postUrl = `${BASE_URL}${POST_ROUTE}/${post.slug}`;
  const description = post.lead || getExcerpt(post.body, DESCRIPTION_LENGTH) || undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: postUrl },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: postUrl,
      siteName: settings.publicationName || SITE_NAME,
      locale: 'ro_RO',
      images: post.coverImageUrl
        ? [{ url: post.coverImageUrl, alt: post.title, width: 1200, height: 630 }]
        : undefined,
      publishedTime: post.publishAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      section: RUBRICA_NAMES[post.rubrica],
      authors: [SITE_NAME],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return <PostView slug={slug} />;
}
