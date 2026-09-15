import type { FC } from 'react';
// constants
import { RUBRICI } from '@constants/rubrici';
// models
import { Rubrica } from '@models/post';
// utils
import { getClassNames } from '@utils/getClassNames';
// components
import RubricaIcon from '@components/icons/RubricaIcon';

interface RubricaBadgeProps {
  rubrica: Rubrica;
  size?: 'sm' | 'md' | 'lg';
  /** Show the rubrică mark alongside the name */
  showIcon?: boolean;
}

const SIZE_CLASSES = {
  sm: { container: 'px-2 py-0.5 gap-1', text: 'text-xs', icon: 'w-3.5 h-3.5' },
  md: { container: 'px-3 py-1 gap-1.5', text: 'text-sm', icon: 'w-4 h-4' },
  lg: { container: 'px-4 py-1.5 gap-2', text: 'text-base', icon: 'w-5 h-5' },
};

/**
 * `shrink-0` and `whitespace-nowrap` are deliberate: inside the narrow meta row of a
 * card on a phone the badge would otherwise be compressed and its label clipped —
 * "Contribuțiile Cititorilor" is long enough to trigger it every time.
 */
const BASE_CLASS =
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-teal/20 bg-teal/10 font-medium text-teal';

const RubricaBadge: FC<RubricaBadgeProps> = ({ rubrica, size = 'sm', showIcon = false }) => {
  const meta = RUBRICI.find((entry) => entry.slug === rubrica);
  if (!meta) return null;

  const sizeClass = SIZE_CLASSES[size];

  return (
    <span className={getClassNames(BASE_CLASS, sizeClass.container)}>
      {showIcon && <RubricaIcon iconId={meta.iconId} className={sizeClass.icon} />}
      <span className={sizeClass.text}>{meta.name}</span>
    </span>
  );
};

export default RubricaBadge;
