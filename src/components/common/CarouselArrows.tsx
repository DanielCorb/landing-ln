'use client';

import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// utils
import { getClassNames } from '@utils/getClassNames';

interface CarouselArrowsProps {
  isAtStart: boolean;
  isAtEnd: boolean;
  onScroll: (direction: 1 | -1) => void;
}

const ARROW_BASE_CLASS = 'rounded-full border p-2 transition-all duration-200';

const ARROW_ENABLED_CLASS = 'border-border text-text-secondary hover:border-teal hover:text-teal';

const ARROW_DISABLED_CLASS = 'cursor-not-allowed border-border/50 text-text-muted opacity-50';

/**
 * Previous/next controls for a `ScrollRow`.
 *
 * Hidden from assistive technology: the row is a plain scroll container, so a screen
 * reader or a keyboard already reaches every card without them.
 *
 * Hidden on touch devices too, and not merely to save room: a swipe already scrolls the
 * row directly, so the buttons add nothing there while crowding the section heading off
 * the side of the screen.
 *
 * The cutoff is `lg:` rather than `sm:` because the viewport width of a phone is not what
 * intuition suggests. A 1080px-wide Android screen at a device pixel ratio of 1.5 reports
 * 720 CSS pixels, comfortably past the 640px `sm:` breakpoint — so the arrows were showing
 * on exactly the devices they were meant to be hidden from. Tablets are touch-driven too,
 * which puts the honest boundary at 1024px.
 */
const CarouselArrows: FC<CarouselArrowsProps> = ({ isAtStart, isAtEnd, onScroll }) => (
  <div className="hidden gap-2 lg:flex" aria-hidden="true">
    <button
      type="button"
      onClick={() => onScroll(-1)}
      disabled={isAtStart}
      tabIndex={-1}
      className={getClassNames(
        ARROW_BASE_CLASS,
        isAtStart ? ARROW_DISABLED_CLASS : ARROW_ENABLED_CLASS,
      )}
      aria-label="Anterior"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
    <button
      type="button"
      onClick={() => onScroll(1)}
      disabled={isAtEnd}
      tabIndex={-1}
      className={getClassNames(
        ARROW_BASE_CLASS,
        isAtEnd ? ARROW_DISABLED_CLASS : ARROW_ENABLED_CLASS,
      )}
      aria-label="Următor"
    >
      <ChevronRight className="h-5 w-5" />
    </button>
  </div>
);

export default CarouselArrows;
