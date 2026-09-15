import type { FC } from 'react';
// models
import { SocialPlatformId } from '@models/social';
// utils
import { getClassNames } from '@utils/getClassNames';

/**
 * One icon set for all four social networks.
 *
 * Everything here is hand-authored as a stroked glyph on the same 24×24 grid, with the
 * same stroke width, the same optical padding and the same round frame. That is what
 * makes Instagram, Facebook, TikTok and Telegram read as equal in size — a guarantee
 * you do not get from mixing packs, and definitely not from the four differently
 * cropped bitmaps this replaces.
 *
 * The frame is part of the component, so the footer and the contact page cannot drift
 * apart: they both render `<SocialIcon />` and get the identical mark.
 */

interface SocialIconProps {
  platform: SocialPlatformId;
  /** Diameter of the round frame, in pixels. */
  size?: number;
  /** Extra classes for the frame — used to switch between the light and teal variants. */
  className?: string;
}

const GLYPHS: Record<SocialPlatformId, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5.4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <path d="M15.1 3.4h-1.6a3.4 3.4 0 0 0-3.4 3.4V20.6" />
      <path d="M8 11.4h6.4" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14.6 3.4v10.3a3.9 3.9 0 1 1-3.3-3.85" />
      <path d="M14.6 3.4c.45 2.45 2.3 4.15 4.8 4.35" />
    </>
  ),
  telegram: (
    <>
      <path d="M21.3 4.3 2.9 11.1a.42.42 0 0 0 .03.79l4.6 1.5 1.75 5.1a.42.42 0 0 0 .74.13l2.48-2.9 4.6 3.36a.42.42 0 0 0 .66-.24z" />
      <path d="m7.53 13.39 13.77-9.09-9.8 11.42" />
    </>
  ),
};

const SocialIcon: FC<SocialIconProps> = ({ platform, size = 36, className }) => {
  return (
    <span
      className={getClassNames(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
      >
        {GLYPHS[platform]}
      </svg>
    </span>
  );
};

export default SocialIcon;
