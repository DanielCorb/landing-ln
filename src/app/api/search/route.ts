import { NextResponse } from 'next/server';
// utils
import { MIN_QUERY_LENGTH } from '@utils/searchByTitle';
// lib
import { searchPosts } from '@lib/firestore/posts';

/**
 * GET /api/search?q=… — post search for the header overlay.
 *
 * Returns a trimmed projection rather than whole documents: the overlay renders a title
 * and a lead, and post bodies are large.
 *
 * Every match is returned, not a first page of them. The overlay scrolls its own list, so
 * a broad word like "guvern" shows everything it found instead of an arbitrary ten — and
 * since matching is title-only the payload stays small even when the count is high.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ posts: [] });
  }

  try {
    const posts = await searchPosts(query);

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        lead: post.lead,
        rubrica: post.rubrica,
      })),
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
