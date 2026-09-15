'use client';

import type { FC } from 'react';
// models
import { Post } from '@models/post';
// hooks
import { useCarousel } from '@hooks/useCarousel';
// utils
import { getClassNames } from '@utils/getClassNames';
// components
import CarouselArrows from '@components/common/CarouselArrows';
import PostCard from '@components/common/PostCard';
import ScrollRow, { SCROLL_ITEM_CLASS } from '@components/common/ScrollRow';

interface PostCarouselProps {
  posts: Post[];
  title?: string;
}

const ITEM_CLASS = getClassNames(SCROLL_ITEM_CLASS, 'w-[220px] sm:w-[250px]');

/**
 * Horizontal row of posts with arrow controls and pointer dragging.
 *
 * The scrolling is native (see `ScrollRow`); `useCarousel` adds the paging, the edge
 * state the arrows disable themselves on, and the mouse drag. That is everything Swiper
 * was doing here, minus 81 KB of JS.
 */
const PostCarousel: FC<PostCarouselProps> = ({ posts, title }) => {
  const { rowRef, isAtStart, isAtEnd, isDragging, scrollByPage, dragProps } = useCarousel();

  if (posts.length === 0) return null;

  return (
    <div className="relative" id="post-carousel">
      {title && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="min-w-0 break-words font-display text-3xl text-text-primary sm:text-4xl">
            {title}
          </h2>
          <CarouselArrows isAtStart={isAtStart} isAtEnd={isAtEnd} onScroll={scrollByPage} />
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
            <PostCard post={post} variant="grid" size="sm" />
          </li>
        ))}
      </ScrollRow>
    </div>
  );
};

export default PostCarousel;
