'use client';

import { useEffect, useRef, useState, type FC } from 'react';
import dynamic from 'next/dynamic';
import { Calendar1 } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
// utils
import { getClassNames } from '@utils/getClassNames';

/**
 * The calendar — and, more importantly, `react-day-picker`'s 38 KB stylesheet — is
 * fetched the first time the picker is opened rather than shipped with the page. It
 * used to be part of the route chunk and applied after the first paint, which was worth
 * a 0.25 CLS on both the archive and the rubrică pages.
 *
 * The trigger button below stays server-rendered and never changes size, so nothing
 * moves when the calendar eventually arrives.
 */
const DateRangePopover = dynamic(() => import('@components/common/DateRangePopover'), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse rounded-lg bg-surface-alt" />,
});

interface DateRangeFilterProps {
  dateStart?: string;
  dateEnd?: string;
  onApply: (dateStart: string, dateEnd: string) => void;
}

const PARAM_FORMAT = 'yyyy-MM-dd';
const LABEL_FORMAT = 'd MMM yyyy';

const TRIGGER_BASE_CLASS =
  'inline-flex items-center gap-2 rounded-btn border px-3 py-2 text-sm transition-all duration-200';

const POPOVER_CLASS =
  'animate-scale-in fixed left-1/2 top-1/2 z-[70] flex w-[calc(100vw-2rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-auto sm:translate-x-0 sm:translate-y-0 sm:animate-none';

const getRangeFromParams = (dateStart?: string, dateEnd?: string): DateRange | undefined => {
  if (!dateStart) return undefined;
  return { from: new Date(dateStart), to: dateEnd ? new Date(dateEnd) : undefined };
};

/**
 * Date-range picker driving the `dateStart` / `dateEnd` search params.
 *
 * The draft selection is seeded from the URL once, at mount. It is not re-synced from
 * an effect: `SortControls` gives this component a `key` derived from the two params,
 * so a change in the URL remounts it with the new values already in place.
 */
const DateRangeFilter: FC<DateRangeFilterProps> = ({ dateStart, dateEnd, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(() =>
    getRangeFromParams(dateStart, dateEnd),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApply = () => {
    setIsOpen(false);
    if (!range?.from) {
      onApply('', '');
      return;
    }
    onApply(format(range.from, PARAM_FORMAT), range.to ? format(range.to, PARAM_FORMAT) : '');
  };

  const handleClear = () => {
    setRange(undefined);
    setIsOpen(false);
    onApply('', '');
  };

  const label = dateStart
    ? `${format(new Date(dateStart), LABEL_FORMAT, { locale: ro })}${
        dateEnd ? ` - ${format(new Date(dateEnd), LABEL_FORMAT, { locale: ro })}` : ''
      }`
    : 'Filtrează date';

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={getClassNames(
          TRIGGER_BASE_CLASS,
          dateStart || isOpen
            ? 'border-teal bg-surface-alt text-teal'
            : 'border-border text-text-secondary hover:border-teal hover:text-teal',
        )}
        aria-label="Filtrează după perioadă"
        aria-expanded={isOpen}
        title="Filtrează după perioadă"
      >
        <Calendar1 className="h-4 w-4" strokeWidth={1.5} />
        <span className="hidden whitespace-nowrap font-medium sm:inline">{label}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="animate-fade-in fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className={POPOVER_CLASS}>
            <DateRangePopover
              range={range}
              onRangeChange={setRange}
              onApply={handleApply}
              onClear={handleClear}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangeFilter;
