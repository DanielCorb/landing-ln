import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// constants
import { RUBRICI } from '@constants/rubrici';
import { RUBRICA_ROUTE } from '@constants/site';
// models
import { Rubrica } from '@models/post';
// components
import { RUBRICA_IMAGES } from '@components/common/RubricaCard';

interface RubricaMoreCardProps {
  rubrica: Rubrica;
}

/** Closing tile of a rubrică carousel, linking to the full rubrică listing. */
const RubricaMoreCard: FC<RubricaMoreCardProps> = ({ rubrica }) => {
  const meta = RUBRICI.find((entry) => entry.slug === rubrica);
  if (!meta) return null;

  return (
    <Link
      href={`${RUBRICA_ROUTE}/${rubrica}`}
      prefetch={false}
      className="card-hover group flex h-full flex-col overflow-hidden border border-border"
    >
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-surface p-3">
        <div className="relative h-full w-full">
          <Image
            src={RUBRICA_IMAGES[rubrica]}
            alt={meta.name}
            fill
            sizes="320px"
            className="object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-6 text-center transition-colors duration-300 group-hover:bg-black/30">
          <h3 className="mb-2 font-display text-2xl font-bold tracking-wide text-white drop-shadow-md">
            Vezi mai multe
          </h3>
          <p className="text-sm font-medium text-offwhite/90">din {meta.name}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center bg-surface p-4 text-center sm:p-5">
        <span className="inline-flex items-center gap-1 font-medium text-teal transition-colors group-hover:text-teal-dark">
          Explorează rubrica →
        </span>
      </div>
    </Link>
  );
};

export default RubricaMoreCard;
