'use client';

import { useCallback, type FC } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, PenLine } from 'lucide-react';

interface AuthorFilterProps {
  /** Names to offer, already ordered. */
  authors: string[];
  /** The name currently filtered on, or `undefined` for all of them. */
  selected?: string;
}

const ALL_AUTHORS = '';

/**
 * Author picker for the contributions rubrică, driven by the `author` search param —
 * the same URL the byline under a post links to, so both routes lead to one shared,
 * shareable address.
 *
 * Styled as a native `<select>` behind a custom frame rather than a bespoke dropdown:
 * it sits next to `SortControls`, matches its border and hover, and keeps the platform
 * behaviour on touch devices for free.
 */
const AuthorFilter: FC<AuthorFilterProps> = ({ authors, selected }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectAuthor = useCallback(
    (author: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (author === ALL_AUTHORS) params.delete('author');
      else params.set('author', author);

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router, searchParams],
  );

  if (authors.length === 0) return null;

  return (
    <div className="relative inline-flex items-center" id="author-filter">
      <PenLine
        className="pointer-events-none absolute left-3 h-4 w-4 text-text-muted"
        strokeWidth={1.5}
      />
      <select
        value={selected ?? ALL_AUTHORS}
        onChange={(event) => selectAuthor(event.target.value)}
        aria-label="Filtrează după autor"
        className="appearance-none rounded-btn border border-border bg-surface py-2 pl-9 pr-9 text-sm text-text-secondary transition-all duration-200 hover:border-teal hover:text-teal focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
      >
        <option value={ALL_AUTHORS}>Toți autorii</option>
        {authors.map((author) => (
          <option key={author} value={author}>
            {author}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 h-4 w-4 text-text-muted"
        strokeWidth={1.5}
      />
    </div>
  );
};

export default AuthorFilter;
