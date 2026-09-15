'use client';

import { useEffect, useRef, useState, type FC } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
// constants
import { POST_ROUTE } from '@constants/site';
// models
import { Post } from '@models/post';
// utils
import { getClassNames } from '@utils/getClassNames';
import { MIN_QUERY_LENGTH } from '@utils/searchByTitle';
// components
import SearchIcon from '@components/icons/SearchIcon';

interface SearchOverlayProps {
  onClose: () => void;
}

/** Shape returned by /api/search — a trimmed-down post, not the whole document. */
type SearchResult = Pick<Post, 'id' | 'title' | 'slug' | 'lead' | 'rubrica'>;

/**
 * Short enough that results feel typed-into rather than waited for, long enough that a
 * fast typist still sends one request per word instead of one per letter.
 */
const DEBOUNCE_MS = 140;

/** Shared empty array, so "query too short" does not hand the list a new one each render. */
const NO_RESULTS: SearchResult[] = [];

const SearchOverlay: FC<SearchOverlayProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * Answers already fetched in this session, keyed by the query that produced them.
   *
   * Deleting a letter, retyping it, or pausing on a prefix on the way to a longer word
   * all land on a query that has been asked before — served from here they cost nothing
   * and repaint on the same frame. A ref, not state: filling it must not re-render.
   */
  const cacheRef = useRef(new Map<string, SearchResult[]>());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  /**
   * Freeze the page underneath while the overlay is up.
   *
   * Without this the wheel falls through to the article behind as soon as the result list
   * hits its end — or immediately, when the list is short — and closing the overlay leaves
   * the reader somewhere they never chose to scroll to. The padding compensates for the
   * scrollbar the lock removes, so the header does not jump sideways as it appears.
   */
  useEffect(() => {
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  // Derived, not stored: a query that is too short simply shows nothing, which avoids
  // clearing state from inside an effect just to hide stale results.
  const trimmedQuery = query.trim();
  const isQueryLongEnough = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const visibleResults = isQueryLongEnough ? results : NO_RESULTS;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return undefined;

    const cached = cacheRef.current.get(trimmed);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data: { posts: SearchResult[] } = await response.json();
          const posts = data.posts ?? [];
          cacheRef.current.set(trimmed, posts);
          setResults(posts);
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error('Search error:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // A new query starts at the top of its own results, not wherever the previous one was
  // scrolled to.
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [visibleResults]);

  const handleSelect = (slug: string) => {
    onClose();
    router.push(`${POST_ROUTE}/${slug}`);
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm"
      id="search-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/*
       * Capped to the viewport and laid out as a column, so the input keeps its place at
       * the top and the results below it are what scrolls.
       */}
      <div
        className="mx-auto flex h-full max-w-2xl flex-col px-4 pb-6 pt-20 sm:pt-32"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="relative flex-shrink-0">
          <div className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-teal text-white shadow-md">
            <SearchIcon size={20} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Caută după titlu..."
            className="w-full rounded-card border border-border bg-surface py-3 pl-14 pr-12 text-base transition-all duration-200 placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal sm:py-4 sm:text-lg"
            id="search-input"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition-colors hover:text-text-primary"
            aria-label="Închide căutarea"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isQueryLongEnough && (
          <p className="mt-3 flex-shrink-0 px-1 text-sm text-text-muted">
            Scrie cel puțin {MIN_QUERY_LENGTH} litere.
          </p>
        )}

        {isQueryLongEnough && visibleResults.length > 0 && (
          <p className="mt-3 flex-shrink-0 px-1 text-sm text-text-muted">
            {visibleResults.length} {visibleResults.length === 1 ? 'rezultat' : 'rezultate'}
          </p>
        )}

        {/*
         * The scroll container. `overscroll-contain` stops the wheel from chaining to the
         * page behind once this list reaches its end.
         */}
        <div
          ref={listRef}
          className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
          id="search-results"
        >
          {/* Only while there is nothing to show yet — a refined query keeps its previous
              results on screen, faded, instead of blanking the list between keystrokes. */}
          {loading && visibleResults.length === 0 && (
            <div className="flex items-center justify-center py-8 text-text-muted">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Se caută...
            </div>
          )}

          {!loading && isQueryLongEnough && visibleResults.length === 0 && (
            <div className="py-8 text-center text-text-muted">
              Niciun rezultat pentru &ldquo;{query}&rdquo;
            </div>
          )}

          <div
            className={getClassNames(
              'space-y-2 transition-opacity duration-150',
              loading && 'opacity-50',
            )}
          >
            {visibleResults.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handleSelect(post.slug)}
                className="group w-full rounded-card border border-border bg-surface p-4 text-left transition-all duration-200 hover:border-teal hover:bg-surface-alt"
              >
                <h3 className="font-display text-lg text-text-primary transition-colors group-hover:text-teal">
                  {post.title}
                </h3>
                {post.lead && (
                  <p className="mt-1 line-clamp-1 text-sm text-text-muted">{post.lead}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
