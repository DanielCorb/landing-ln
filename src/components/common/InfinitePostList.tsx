'use client';

import { useCallback, useEffect, useRef, useState, type FC } from 'react';
// models
import { Post, PostListView, PostSort, Rubrica } from '@models/post';
// components
import GlobeSpinner from '@components/icons/GlobeSpinner';
import PostCard from '@components/common/PostCard';
// actions
import { fetchPostsAction } from '@/app/actions/posts';

interface InfinitePostListProps {
  initialPosts: Post[];
  totalPosts: number;
  pageSize: number;
  view: PostListView;
  sort: PostSort;
  dateStart?: string;
  dateEnd?: string;
  rubrica?: Rubrica;
  /** Contributor name the listing is narrowed to, if any. */
  author?: string;
  /** Shown when nothing matches; each listing words this for its own scope. */
  emptyMessage?: string;
}

const DEFAULT_EMPTY_MESSAGE = 'Nu există postări publicate pentru filtrele alese.';

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3';

const LIST_CLASS = 'flex flex-col gap-4';

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '400px',
  threshold: 0,
};

/**
 * Renders the first page server-side and appends further pages as the sentinel scrolls
 * into view. The server action receives the same filters as the page, so sorting and
 * date filtering stay consistent between the initial render and the appended batches.
 *
 * There is no effect resetting the list when the filters change: the parent passes a
 * `key` built from the filters, so React remounts this component with fresh state. That
 * is both simpler and correct — switching between grid and list view (which does not
 * change the data) now keeps everything the reader has already scrolled past.
 */
const InfinitePostList: FC<InfinitePostListProps> = ({
  initialPosts,
  totalPosts,
  pageSize,
  view,
  sort,
  dateStart,
  dateEnd,
  rubrica,
  author,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < totalPosts);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      const { posts: newPosts, total } = await fetchPostsAction({
        page: nextPage,
        pageSize,
        rubrica,
        dateStart,
        dateEnd,
        sort,
        author,
      });

      setPosts((previous) => {
        const merged = [...previous, ...newPosts];
        setHasMore(merged.length < total);
        return merged;
      });
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more posts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [author, dateEnd, dateStart, hasMore, loading, page, pageSize, rubrica, sort]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, OBSERVER_OPTIONS);

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={view === 'grid' ? GRID_CLASS : LIST_CLASS}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant={view} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-12">
          {loading && <GlobeSpinner size={48} label="Se încarcă mai multe postări…" />}
        </div>
      )}
    </>
  );
};

export default InfinitePostList;
