'use client';

import type { FC } from 'react';
import Link from 'next/link';
// models
import { Post, Rubrica } from '@models/post';
// hooks
import { useCarousel } from '@hooks/useCarousel';
// utils
import { getClassNames } from '@utils/getClassNames';
// components
import CarouselArrows from '@components/common/CarouselArrows';
import PostCard from '@components/common/PostCard';
import RubricaMoreCard from '@components/common/RubricaMoreCard';
import ScrollRow, { SCROLL_ITEM_CLASS } from '@components/common/ScrollRow';

interface RubricaCarouselProps {
  posts: Post[];
  rubrica: Rubrica;
  /** Section heading; omit both this and `moreHref` to render the row bare. */
  heading?: string;
  /**
   * Typography for the heading. Passed as a class name rather than as ready-made JSX
   * because this is a client component and its callers are server ones: an element
   * crossing that boundary is serialised as a list entry, which React then asks for a
   * `key` it cannot have. Plain strings cross cleanly.
   */
  headingClass?: string;
  /** Destination of the "see all" link shown next to the arrows. */
  moreHref?: string;
}

const ITEM_CLASS = getClassNames(SCROLL_ITEM_CLASS, 'w-[280px] sm:w-[320px]');

/**
 * Smaller on phones: with the arrows gone this link sits directly beside the rubrică
 * heading, and at `text-sm` it competed with it for the same line.
 */
const MORE_LINK_CLASS =
  'whitespace-nowrap text-xs font-medium text-teal transition-colors hover:text-teal-dark dark:hover:text-teal-light sm:text-sm';

/** Row of posts from one rubrică, closed off by a "see more" tile. */
const RubricaCarousel: FC<RubricaCarouselProps> = ({
  posts,
  rubrica,
  heading,
  headingClass,
  moreHref,
}) => {
  const { rowRef, isAtStart, isAtEnd, isDragging, scrollByPage, dragProps } = useCarousel();

  if (posts.length === 0) return null;

  return (
    <div className="relative">
      {(heading || moreHref) && (
        // Wraps rather than overflows: a long rubrică name and the "see all" link cannot
        // both fit on one line of a phone, and the row used to run off the side instead.
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {heading && (
            <h2 className={getClassNames('min-w-0 break-words', headingClass)}>{heading}</h2>
          )}
          <div className="flex flex-shrink-0 items-center gap-3">
            <CarouselArrows isAtStart={isAtStart} isAtEnd={isAtEnd} onScroll={scrollByPage} />
            {moreHref && (
              <Link href={moreHref} className={MORE_LINK_CLASS}>
                Vezi toate →
              </Link>
            )}
          </div>
        </div>
      )}

      <ScrollRow
        ref={rowRef}
        className={getClassNames(
          '-mb-4',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        )}
        {...dragProps}
      >
        {posts.map((post) => (
          <li key={post.id} className={ITEM_CLASS}>
            <PostCard post={post} variant="grid" />
          </li>
        ))}
        <li className={ITEM_CLASS}>
          <RubricaMoreCard rubrica={rubrica} />
        </li>
      </ScrollRow>
    </div>
  );
};

export default RubricaCarousel;
