'use client';

import { useCallback, type FC } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, LayoutGrid, List } from 'lucide-react';
// models
import { PostListView, PostSort } from '@models/post';
// utils
import { getClassNames } from '@utils/getClassNames';
// components
import DateRangeFilter from '@components/common/DateRangeFilter';

interface SortControlsProps {
  sort?: PostSort;
  view?: PostListView;
  dateStart?: string;
  dateEnd?: string;
}

const ICON_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-btn border border-border p-2 text-sm text-text-secondary transition-all duration-200 hover:border-teal hover:text-teal';

const VIEW_BUTTON_CLASS = 'p-2 transition-all duration-200';

const VIEW_ACTIVE_CLASS = 'bg-teal text-white';

const VIEW_INACTIVE_CLASS = 'text-text-secondary hover:bg-surface-alt hover:text-teal';

/** Sort direction, date range and layout toggles, all driven by URL search params. */
const SortControls: FC<SortControlsProps> = ({
  sort = 'newest',
  view = 'grid',
  dateStart,
  dateEnd,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === '') params.delete(key);
        else params.set(key, value);
      }

      // Any filter change invalidates the current page offset.
      params.delete('page');

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex items-center gap-2" id="sort-controls">
      {/* Keyed on the params so a URL change remounts the picker with the new range */}
      <DateRangeFilter
        key={`${dateStart ?? ''}-${dateEnd ?? ''}`}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onApply={(nextStart, nextEnd) => updateParams({ dateStart: nextStart, dateEnd: nextEnd })}
      />

      <button
        type="button"
        onClick={() => updateParams({ sort: sort === 'newest' ? 'oldest' : 'newest' })}
        className={ICON_BUTTON_CLASS}
        aria-label={
          sort === 'newest' ? 'Sortează de la vechi la nou' : 'Sortează de la nou la vechi'
        }
        title="Sortează"
      >
        {sort === 'newest' ? (
          <ArrowDownWideNarrow className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <ArrowUpWideNarrow className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>

      <div className="flex overflow-hidden rounded-btn border border-border">
        <button
          type="button"
          onClick={() => updateParams({ view: 'grid' })}
          className={getClassNames(
            VIEW_BUTTON_CLASS,
            view === 'grid' ? VIEW_ACTIVE_CLASS : VIEW_INACTIVE_CLASS,
          )}
          aria-label="Afișare grilă"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => updateParams({ view: 'list' })}
          className={getClassNames(
            VIEW_BUTTON_CLASS,
            view === 'list' ? VIEW_ACTIVE_CLASS : VIEW_INACTIVE_CLASS,
          )}
          aria-label="Afișare listă"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SortControls;
