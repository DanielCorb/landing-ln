'use client';

import { useEffect, useState, type FC } from 'react';
import { X } from 'lucide-react';
// constants
import { DEFAULT_KOFI_LINK } from '@constants/navigation';
// components
import GlobeSpinner from '@components/icons/GlobeSpinner';
import KofiIcon from '@components/icons/KofiIcon';

interface DonationPopupProps {
  kofiLink?: string;
}

const SEEN_STORAGE_KEY = 'hasSeenDonationPopup';

const DELAY_MS = 10_000;

const DonationPopup: FC<DonationPopupProps> = ({ kofiLink }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let hasSeen: string | null = null;
    try {
      hasSeen = window.localStorage.getItem(SEEN_STORAGE_KEY);
    } catch {
      return undefined;
    }

    if (hasSeen) return undefined;

    const timer = setTimeout(() => setIsOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(SEEN_STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable — the popup will show again next session.
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={dismiss}
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-in-up relative w-full max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full border border-border bg-background p-2 text-text-muted transition-colors hover:text-text-primary"
          aria-label="Închide"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-6 flex justify-center">
          <GlobeSpinner size={112} />
        </div>

        <h3 className="mb-3 font-display text-2xl text-text-primary sm:text-3xl">
          Susține Lumea Nouă!
        </h3>
        <p className="mb-8 leading-relaxed text-text-secondary">
          Munca noastră este susținută de cititori ca tine. Dacă îți place ce citești, ajută-ne cu o
          donație să continuăm!
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg border border-border px-6 py-2.5 font-medium text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5"
          >
            Poate mai târziu
          </button>
          <a
            href={kofiLink || DEFAULT_KOFI_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-8 py-2.5 font-medium text-white shadow-lg transition-all hover:shadow-xl"
          >
            <span>Donează acum</span>
            <KofiIcon size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DonationPopup;
