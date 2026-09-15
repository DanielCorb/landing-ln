import { cache } from 'react';
// constants
import { DEFAULT_RUBRICA } from '@constants/rubrici';
import { POSTS_COLLECTION } from '@constants/site';
// models
import { Post, PostSort, PublishedPostsQuery, PublishedPostsResult, Rubrica } from '@models/post';
// utils
import { getDayBoundary } from '@utils/getFormattedDate';
import { searchByTitle } from '@utils/searchByTitle';
// lib
import { adminDb } from '@lib/firebase/admin';

/**
 * Server-side reads for posts, via the Firebase Admin SDK.
 *
 * Firestore is queried with a single-field `where` so no composite index is required;
 * filtering, sorting and pagination happen in memory. To keep that affordable, the
 * full published set is fetched exactly **once per request** through React's `cache`,
 * instead of once per section as it used to be — the homepage alone did four full
 * collection scans per render.
 */

type PostDocument = FirebaseFirestore.DocumentSnapshot;

const getDate = (value: FirebaseFirestore.Timestamp | null | undefined): Date | null =>
  value ? value.toDate() : null;

const getPostFromDocument = (document: PostDocument): Post => {
  const data = document.data() ?? {};

  return {
    id: document.id,
    title: data.title || '',
    slug: data.slug || '',
    lead: data.lead || '',
    body: data.body || '',
    coverImageUrl: data.coverImageUrl || null,
    rubrica: (data.rubrica as Rubrica) || DEFAULT_RUBRICA,
    status: data.status || 'draft',
    publishAt: getDate(data.publishAt),
    createdAt: getDate(data.createdAt) || new Date(),
    updatedAt: getDate(data.updatedAt) || new Date(),
    authorId: data.authorId || '',
    contributor: data.contributor || null,
  };
};

/**
 * Contributor names that currently have at least one live post, alphabetically.
 *
 * Derived from the posts themselves so the filter never offers an author whose only
 * piece is unpublished, and so nothing has to be maintained alongside them.
 */
export const getContributors = async (rubrica: Rubrica): Promise<string[]> => {
  const posts = await getAllPublishedPosts();

  const names = new Set(
    posts
      .filter((post) => post.rubrica === rubrica && post.contributor)
      .map((post) => post.contributor as string),
  );

  return [...names].sort((first, second) => first.localeCompare(second, 'ro'));
};

const getSortedByDate = (posts: Post[], sort: PostSort): Post[] =>
  [...posts].sort((a, b) => {
    const timeA = a.publishAt?.getTime() ?? 0;
    const timeB = b.publishAt?.getTime() ?? 0;
    return sort === 'oldest' ? timeA - timeB : timeB - timeA;
  });

/**
 * Every post that is live right now, newest first.
 *
 * Memoized per request: the homepage, the archive and the sitemap can all call this
 * and only one Firestore round trip happens. The cache is dropped between requests,
 * so ISR revalidation still picks up newly published posts.
 */
export const getAllPublishedPosts = cache(async (): Promise<Post[]> => {
  const snapshot = await adminDb
    .collection(POSTS_COLLECTION)
    .where('status', 'in', ['published', 'scheduled'])
    .get();

  const now = Date.now();
  const posts = snapshot.docs
    .map(getPostFromDocument)
    .filter((post) => post.publishAt !== null && post.publishAt.getTime() <= now);

  return getSortedByDate(posts, 'newest');
});

/** Paginated published posts, optionally narrowed by rubrică and/or publish date. */
export const getPublishedPosts = async (
  query: PublishedPostsQuery = {},
): Promise<PublishedPostsResult> => {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;

  let posts = await getAllPublishedPosts();

  if (query.rubrica) {
    posts = posts.filter((post) => post.rubrica === query.rubrica);
  }

  if (query.author) {
    posts = posts.filter((post) => post.contributor === query.author);
  }

  if (query.dateStart) {
    const start = getDayBoundary(query.dateStart, 'start');
    if (start) posts = posts.filter((post) => post.publishAt !== null && post.publishAt >= start);
  }

  if (query.dateEnd) {
    const end = getDayBoundary(query.dateEnd, 'end');
    if (end) posts = posts.filter((post) => post.publishAt !== null && post.publishAt <= end);
  }

  // Sort the *whole* filtered set before slicing, so "cele mai vechi" really means the
  // oldest posts overall and not just the current page reversed.
  const sorted = getSortedByDate(posts, query.sort ?? 'newest');

  return {
    posts: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
  };
};

/** A single live post by slug, or null when it does not exist / is not live yet. */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const posts = await getAllPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};

/**
 * A single post by document id, read straight from Firestore.
 *
 * Unlike every other reader here this one bypasses `getAllPublishedPosts`, and therefore
 * its "publishAt is in the past" filter. The newsletter blast runs the instant a post
 * flips to `published`, where the scheduled timestamp can still be a few seconds ahead of
 * the clock — going through the cached list would intermittently find nothing and drop
 * the issue. Callers are responsible for checking `status` themselves.
 */
export const getPostById = async (id: string): Promise<Post | null> => {
  const document = await adminDb.collection(POSTS_COLLECTION).doc(id).get();
  return document.exists ? getPostFromDocument(document) : null;
};

/** The most recently published post — drives the homepage hero. */
export const getLatestPost = async (): Promise<Post | null> => {
  const posts = await getAllPublishedPosts();
  return posts[0] ?? null;
};

/** The N most recently published posts — drives the homepage carousel. */
export const getRecentPosts = async (count: number): Promise<Post[]> => {
  const posts = await getAllPublishedPosts();
  return posts.slice(0, count);
};

/** Paginated posts inside a single rubrică. */
export const getPostsByRubrica = async (
  rubrica: Rubrica,
  page: number,
  pageSize: number,
  sort: PostSort = 'newest',
): Promise<PublishedPostsResult> => getPublishedPosts({ rubrica, page, pageSize, sort });

/**
 * Live posts whose *title* matches the query, best match first and none of them dropped.
 *
 * The ranking lives in `searchByTitle`; all this adds is the set to rank. That set comes
 * from the same per-request cache the rest of the page uses, so a search costs no extra
 * Firestore read on a page that has already listed posts.
 */
export const searchPosts = async (searchQuery: string): Promise<Post[]> => {
  const posts = await getAllPublishedPosts();
  return searchByTitle(posts, searchQuery);
};
