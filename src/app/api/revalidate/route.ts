import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * POST /api/revalidate — cache-busting webhook called by the dashboard.
 *
 * The dashboard sends the concrete routes a change affects (the post itself, its
 * rubrică, the archive) *and* we always revalidate the root layout, so the homepage
 * picks up a newly published post immediately instead of waiting out its ISR window.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface RevalidateBody {
  secret?: string;
  /** A single path, kept for backwards compatibility with older dashboard builds. */
  path?: string;
  /** Every path affected by the change. */
  paths?: string[];
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RevalidateBody;

    if (!process.env.REVALIDATE_SECRET || body.secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const paths = new Set<string>(body.paths ?? []);
    if (body.path) paths.add(body.path);

    for (const path of paths) {
      revalidatePath(path);
    }

    // Catch-all: refreshes the homepage and anything else rendered under the root layout.
    revalidatePath('/', 'layout');

    return NextResponse.json(
      { revalidated: true, paths: [...paths], now: Date.now() },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('Revalidate API error:', error);
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
