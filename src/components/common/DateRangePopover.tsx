'use client';

import type { FC } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { ro } from 'date-fns/locale';
// style
import 'react-day-picker/style.css';

/**
 * The calendar itself, split out so it can be loaded on demand.
 *
 * `react-day-picker` brings a 38 KB stylesheet. While it was imported from the always-
 * rendered filter component, that stylesheet was part of the archive and rubrică route
 * chunks and landed after the first paint — worth a 0.25 CLS on both pages, which was
 * the single largest layout shift on the site. Nobody sees a calendar until they click,
 * so nobody should pay for it before then.
 */

interface DateRangePopoverProps {
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onApply: () => void;
  onClear: () => void;
}

const FIRST_SELECTABLE_MONTH = new Date(2010, 0);

const getLastSelectableMonth = (): Date => new Date(new Date().getFullYear() + 2, 11);

const DateRangePopover: FC<DateRangePopoverProps> = ({
  range,
  onRangeChange,
  onApply,
  onClear,
}) => (
  <>
    <DayPicker
      mode="range"
      selected={range}
      onSelect={onRangeChange}
      locale={ro}
      captionLayout="dropdown"
      startMonth={FIRST_SELECTABLE_MONTH}
      endMonth={getLastSelectableMonth()}
    />
    <div className="mt-2 flex justify-between gap-4">
      <button
        type="button"
        onClick={onClear}
        className="px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        Șterge
      </button>
      <button
        type="button"
        onClick={onApply}
        className="rounded-btn bg-teal px-4 py-2 text-sm text-white transition-colors hover:bg-teal-light"
      >
        Aplică
      </button>
    </div>
  </>
);

export default DateRangePopover;
