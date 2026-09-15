import type { FC } from 'react';
import Image from 'next/image';
// utils
import { getClassNames } from '@utils/getClassNames';
import globeImg from '@assets/globe.webp';

/**
 * The Lumea Nouă globe, still.
 *
 * Used wherever the globe is decoration rather than a progress indicator — cover
 * fallbacks, mostly. Rendered from the first frame of the source animation with a
 * circular alpha mask, so it drops onto any background without a black square around it.
 *
 * See `GlobeSpinner` for the turning version, and scripts/buildGlobeAssets.mjs for how
 * both are produced.
 */

interface GlobeImageProps {
  /** Rendered size in pixels. */
  size?: number;
  /** Set only when the globe is the largest thing above the fold. */
  priority?: boolean;
  className?: string;
}

const GlobeImage: FC<GlobeImageProps> = ({ size = 96, priority = false, className }) => {
  return (
    <Image
      src={globeImg}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      priority={priority}
      className={getClassNames('select-none', className)}
    />
  );
};

export default GlobeImage;
