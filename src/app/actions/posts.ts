'use server';

// models
import { PublishedPostsQuery, PublishedPostsResult } from '@models/post';
// lib
import { getPublishedPosts } from '@lib/firestore/posts';

/**
 * Fetch a further page of posts for the infinite list.
 *
 * Takes the full filter set — rubrică, date range *and* sort — so appended batches are
 * ordered exactly like the server-rendered first page.
 */
export async function fetchPostsAction(query: PublishedPostsQuery): Promise<PublishedPostsResult> {
  return getPublishedPosts(query);
}
