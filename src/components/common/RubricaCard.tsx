import type { FC } from 'react';
import Image, { type StaticImageData } from 'next/image';
// constants
import { RUBRICI } from '@constants/rubrici';
// models
import { Rubrica } from '@models/post';
import articoleImg from '@assets/rubrica-articole.png';
import contributiiImg from '@assets/rubrica-contr.png';
import traduceriImg from '@assets/rubrica-trans.png';

interface RubricaCardProps {
  rubrica: Rubrica;
  /**
   * Set for the cards at the top of the archive. They sit above the fold there, and
   * Lighthouse measured one of them as the LCP element — lazily loaded, i.e. late.
   */
  priority?: boolean;
}

export const RUBRICA_IMAGES: Record<Rubrica, StaticImageData> = {
  articole: articoleImg,
  traduceri: traduceriImg,
  'contributiile-cititorilor': contributiiImg,
};

/** Large rubrică tile used on the archive page to link into a rubrică listing. */
const RubricaCard: FC<RubricaCardProps> = ({ rubrica, priority = false }) => {
  const meta = RUBRICI.find((entry) => entry.slug === rubrica);
  if (!meta) return null;

  return (
    <div className="card-hover group flex h-full flex-col overflow-hidden text-center">
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b border-border bg-surface p-3">
        <div className="relative h-full w-full">
          <Image
            src={RUBRICA_IMAGES[rubrica]}
            alt={meta.name}
            fill
            sizes="(max-width: 640px) 90vw, 33vw"
            priority={priority}
            // Decorative hand-drawn illustrations on a flat background: they survive
            // heavier compression than the default 75 without a visible difference, and
            // they are the heaviest thing on the archive page.
            quality={60}
            className="object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 bg-surface p-5 sm:p-6">
        <h3 className="font-display text-xl text-text-primary transition-colors group-hover:text-teal">
          {meta.name}
        </h3>
        {/* Clamped, not shortened: the full text is on the rubrică page. Three lines rather
            than two because the descriptions run to a paragraph and one line cut a blurb
            mid-sentence. Every card clamps at the same height, so the grid stays even. */}
        <p className="mt-1 line-clamp-3 text-sm text-text-muted">{meta.description}</p>
      </div>
    </div>
  );
};

export default RubricaCard;
