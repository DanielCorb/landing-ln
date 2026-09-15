import type { FC } from 'react';
// constants
import { GLOBE_SPRITE_FRAMES } from '@constants/site';
// utils
import { getClassNames } from '@utils/getClassNames';
import globeSpriteImg from '@assets/globe-sprite.webp';

/**
 * The Lumea Nouă globe, turning. Used for loading states.
 *
 * ## How it animates
 *
 * The sheet is one wide image holding every frame side by side. It sits inside a square
 * with `overflow: hidden` and is `GLOBE_SPRITE_FRAMES × 100%` wide, so `translateX(-100%)`
 * moves it by exactly the whole strip and `steps(n)` lands on exactly one frame per step.
 *
 * Percentages here are relative to the *sheet*, not the window, which is what makes the
 * arithmetic exact — the equivalent trick with `background-position` does not land on
 * frame boundaries, because percentage background positions are interpolated between the
 * container and image edges rather than translated.
 *
 * The last frame is one step short of a full rotation, so wrapping back to frame 0 is the
 * same size step as every other: the loop has no seam.
 *
 * ## Why a sprite and not an animated WebP
 *
 * The whole frame changes as the globe turns, so an animated WebP has little redundancy
 * to compress and the alpha channel is costly — it measured 231–390 KB against 55 KB for
 * this sheet. See scripts/buildGlobeAssets.mjs.
 */

interface GlobeSpinnerProps {
  /** Rendered size in pixels. The sheet's frames are 128 px, so keep this at or below that. */
  size?: number;
  className?: string;
  /** Announced to screen readers; omit for purely decorative use. */
  label?: string;
}

const SHEET_STYLE = {
  width: `${GLOBE_SPRITE_FRAMES * 100}%`,
  animationTimingFunction: `steps(${GLOBE_SPRITE_FRAMES})`,
  backgroundImage: `url(${globeSpriteImg.src})`,
};

const GlobeSpinner: FC<GlobeSpinnerProps> = ({ size = 48, className, label }) => {
  return (
    <span
      className={getClassNames('globe-spinner', className)}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : 'true'}
    >
      <span className="globe-spinner__sheet" style={SHEET_STYLE} />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
};

export default GlobeSpinner;
