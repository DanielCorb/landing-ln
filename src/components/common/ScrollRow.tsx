'use client';

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
// utils
import { getClassNames } from '@utils/getClassNames';

/**
 * Horizontally scrollable row, built on native CSS scroll-snap.
 *
 * This replaces Swiper, which cost 81 KB of JavaScript (25 KB over the wire) to do what
 * two CSS properties do natively — for carousels that sit below the fold on a phone and
 * were therefore pure startup cost. Native scrolling also gets real momentum and
 * rubber-banding on touch, which the JS version only approximated.
 *
 * The negative margin plus matching padding let the row bleed to the screen edges on
 * mobile while its first card still lines up with the page gutter.
 */

/** Pointer handlers and the rest of the `<ul>` surface come from `useCarousel`. */
type ScrollRowProps = ComponentPropsWithoutRef<'ul'>;

const CONTAINER_CLASS =
  '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

const ScrollRow = forwardRef<HTMLUListElement, ScrollRowProps>(
  ({ children, className, ...rest }, ref) => (
    <ul ref={ref} className={getClassNames(CONTAINER_CLASS, className)} {...rest}>
      {children}
    </ul>
  ),
);

ScrollRow.displayName = 'ScrollRow';

/** One card inside a `ScrollRow`. */
export const SCROLL_ITEM_CLASS = 'flex shrink-0 snap-start flex-col';

export default ScrollRow;
