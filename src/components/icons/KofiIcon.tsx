import type { FC } from 'react';

/**
 * The Ko-fi cup.
 *
 * Single source for the donation mark. The site previously drew two different cups —
 * one in the header, another in the donation popup — and neither put the handle where
 * Ko-fi does. This one has a body, a handle on the right, a heart and steam, and every
 * donation surface renders it.
 */

interface KofiIconProps {
  /** Rendered size in pixels. */
  size?: number;
  className?: string;
}

const KofiIcon: FC<KofiIconProps> = ({ size = 24, className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Cup body */}
      <path
        d="M3.4 8.2h11.9v6.1a4.4 4.4 0 0 1-4.4 4.4H7.8a4.4 4.4 0 0 1-4.4-4.4z"
        fill="currentColor"
      />
      {/* Handle, on the right — where Ko-fi puts it */}
      <path
        d="M15.3 9.9h1.5a2.6 2.6 0 0 1 0 5.2h-1.5"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      {/* Heart inside the cup */}
      <path
        d="M9.35 15.25 6.9 12.9a1.55 1.55 0 0 1 2.19-2.19l.26.26.26-.26a1.55 1.55 0 0 1 2.19 2.19z"
        fill="#FF5E5B"
      />
      {/* Steam */}
      <path
        d="M6.6 5.6c0-.8.8-1 .8-1.8M9.4 5.6c0-.8.8-1 .8-1.8M12.2 5.6c0-.8.8-1 .8-1.8"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default KofiIcon;
