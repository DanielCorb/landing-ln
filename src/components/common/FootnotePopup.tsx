'use client';

import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { X } from 'lucide-react';
// utils
import { getParsedFootnoteHtml } from '@utils/getFootnotes';

interface PopupState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const HIDDEN: PopupState = { visible: false, content: '', x: 0, y: 0 };

const MAX_WIDTH = 360;
const VIEWPORT_MARGIN = 10;
const ESTIMATED_HEIGHT = 100;
const HORIZONTAL_NUDGE = 32;

/**
 * Click-to-open popup for the footnote markers embedded in post bodies.
 *
 * The listener is attached once and never re-attached: it reads the current visibility
 * from a ref, so typing or scrolling does not churn document-level event handlers.
 */
const FootnotePopup: FC = () => {
  const [popup, setPopup] = useState<PopupState>(HIDDEN);
  const popupRef = useRef<HTMLDivElement>(null);

  // HIDDEN is a stable module-level object, so hiding an already hidden popup sets the
  // exact same reference and React bails out of the re-render on its own.
  const hide = useCallback(() => setPopup(HIDDEN), []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (popupRef.current?.contains(target)) return;

      const marker = target.closest('.tiptap-footnote');
      if (!(marker instanceof HTMLElement)) {
        hide();
        return;
      }

      const content = marker.getAttribute('data-content');
      if (!content) return;

      event.preventDefault();
      const rect = marker.getBoundingClientRect();

      let x = rect.left - HORIZONTAL_NUDGE;
      if (x + MAX_WIDTH > window.innerWidth) x = window.innerWidth - MAX_WIDTH - VIEWPORT_MARGIN;
      if (x < VIEWPORT_MARGIN) x = VIEWPORT_MARGIN;

      let y = rect.bottom + VIEWPORT_MARGIN;
      if (y + ESTIMATED_HEIGHT > window.innerHeight) {
        y = rect.top - VIEWPORT_MARGIN - ESTIMATED_HEIGHT;
      }

      setPopup({ visible: true, content, x, y });
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('scroll', hide, { passive: true });

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('scroll', hide);
    };
  }, [hide]);

  if (!popup.visible) return null;

  return (
    <div
      ref={popupRef}
      className="animate-fade-in fixed z-[100] rounded-card border border-border bg-surface p-4 text-sm text-text-primary shadow-2xl"
      style={{ left: popup.x, top: popup.y, maxWidth: MAX_WIDTH, width: 'max-content' }}
    >
      <button
        type="button"
        onClick={hide}
        className="absolute right-2 top-2 rounded-full bg-surface-alt/50 p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text-primary"
        aria-label="Închide"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div
        className="max-h-[6.5em] overflow-y-auto pr-6 text-justify leading-relaxed [overflow-wrap:anywhere]"
        dangerouslySetInnerHTML={{ __html: getParsedFootnoteHtml(popup.content) }}
      />
    </div>
  );
};

export default FootnotePopup;
