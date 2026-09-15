import type { FC } from 'react';
// models
import { RubricaMeta } from '@models/rubrica';
// utils
import { getClassNames } from '@utils/getClassNames';

/** Line-art mark for each of the three rubrici. */

interface RubricaIconProps {
  iconId: RubricaMeta['iconId'];
  className?: string;
}

const GLYPHS: Record<RubricaMeta['iconId'], React.ReactNode> = {
  typewriter: (
    <>
      <rect x="4" y="14" width="16" height="6" rx="1" />
      <rect x="6" y="4" width="12" height="10" rx="1" />
      <path d="M8 7h8M8 10h6" />
      <circle cx="12" cy="17" r="1.5" />
    </>
  ),
  map: (
    <>
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z" />
      <path d="M8 2v16M16 6v16" />
    </>
  ),
  mailbox: (
    <>
      <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.5 0 4 2 4 4.5z" />
      <path d="M6.5 5C4 5 2 7 2 9.5V10h7v-.5C9 7 7.5 5 6.5 5Z" />
      <path d="M15 5v5h7" />
    </>
  ),
};

const RubricaIcon: FC<RubricaIconProps> = ({ iconId, className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={getClassNames('shrink-0', className)}
      aria-hidden="true"
    >
      {GLYPHS[iconId]}
    </svg>
  );
};

export default RubricaIcon;
