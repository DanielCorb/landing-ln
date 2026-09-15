'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

/**
 * Slider behaviour for a `ScrollRow`: arrow paging, edge state and pointer dragging.
 *
 * The scrolling itself stays native — CSS scroll-snap gives real momentum, rubber-banding
 * and touch dragging for free, which is why Swiper was dropped from this project. What
 * native scrolling does *not* give is a mouse drag: on desktop an `overflow-x` row only
 * responds to the wheel or a scrollbar, and this one hides its scrollbar. So a row without
 * this hook is unnavigable with a mouse, which is the gap the hook fills.
 */

/** Rounding slack, so a scroll that lands a fraction short still counts as "at the end". */
const EDGE_TOLERANCE = 4;

/**
 * How far the pointer must travel before the gesture counts as a drag. Below this a small
 * wobble while clicking a card would otherwise swallow the click and go nowhere.
 */
const DRAG_THRESHOLD = 5;

/** Slightly less than a full viewport, so one card stays visible across an arrow press. */
const PAGE_FRACTION = 0.9;

interface DragState {
  /** Id of the pointer being tracked, or `-1` when no drag is in progress. */
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  /** Whether the pointer passed `DRAG_THRESHOLD` — i.e. this is a drag, not a click. */
  hasMoved: boolean;
}

const IDLE_DRAG: DragState = { pointerId: -1, startX: 0, startScrollLeft: 0, hasMoved: false };

export const useCarousel = () => {
  const rowRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<DragState>(IDLE_DRAG);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const syncEdges = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;

    setIsAtStart(row.scrollLeft <= EDGE_TOLERANCE);
    setIsAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - EDGE_TOLERANCE);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    syncEdges();
    row.addEventListener('scroll', syncEdges, { passive: true });

    // Cards reflow at breakpoints, which changes whether there is anything left to scroll.
    const observer = new ResizeObserver(syncEdges);
    observer.observe(row);

    return () => {
      row.removeEventListener('scroll', syncEdges);
      observer.disconnect();
    };
  }, [syncEdges]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;

    row.scrollBy({ left: direction * row.clientWidth * PAGE_FRACTION, behavior: 'smooth' });
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    // Touch and pen already drag natively, and hijacking them would cost the momentum.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const row = rowRef.current;
    if (!row) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: row.scrollLeft,
      hasMoved: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current;
    const row = rowRef.current;
    if (drag.pointerId !== event.pointerId || !row) return;

    const distance = event.clientX - drag.startX;

    if (!drag.hasMoved) {
      if (Math.abs(distance) < DRAG_THRESHOLD) return;

      drag.hasMoved = true;
      setIsDragging(true);
      // Snapping and smooth scrolling both fight a drag: the row would spring back towards
      // a card on every frame instead of tracking the pointer. Both are restored on release,
      // and restoring the snap is what settles the row on a card afterwards.
      row.style.scrollSnapType = 'none';
      row.style.scrollBehavior = 'auto';
      row.setPointerCapture(event.pointerId);
    }

    row.scrollLeft = drag.startScrollLeft - distance;
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current;
    const row = rowRef.current;
    if (drag.pointerId !== event.pointerId) return;

    if (row && drag.hasMoved) {
      row.style.scrollSnapType = '';
      row.style.scrollBehavior = '';
      if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
    }

    // `hasMoved` deliberately survives until the click that follows this release, which is
    // the one that has to be swallowed. The next pointerdown clears it.
    dragRef.current = { ...drag, pointerId: -1 };
    setIsDragging(false);
  };

  /** Stops a drag that ended over a card from opening that card. */
  const handleClickCapture = (event: ReactMouseEvent<HTMLUListElement>) => {
    if (!dragRef.current.hasMoved) return;

    event.preventDefault();
    event.stopPropagation();
    dragRef.current.hasMoved = false;
  };

  return {
    rowRef,
    isAtStart,
    isAtEnd,
    isDragging,
    scrollByPage,
    dragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onPointerLeave: handlePointerEnd,
      onClickCapture: handleClickCapture,
      // Cards hold images and links, which the browser would otherwise start a native
      // drag-and-drop on, cancelling the scroll gesture halfway through.
      onDragStart: (event: ReactMouseEvent<HTMLUListElement>) => event.preventDefault(),
    },
  };
};
