import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// constants
import { CONTRIBUTOR_RUBRICA } from '@constants/rubrici';
import { POST_ROUTE } from '@constants/site';
// models
import { Post, PostListView } from '@models/post';
// utils
import { getClassNames } from '@utils/getClassNames';
import { getFormattedDate, getIsoDate } from '@utils/getFormattedDate';
// components
import GlobeImage from '@components/icons/GlobeImage';
import RubricaBadge from '@components/common/RubricaBadge';

interface PostCardProps {
  post: Post;
  /** 'grid' renders a card, 'list' renders a horizontal row */
  variant?: PostListView;
  size?: 'sm' | 'default';
}

const MAX_LEAD_LENGTH = 300;

/**
 * The meta row (rubrică + date) is `flex-wrap` with a floor on its height. On a phone,
 * a long rubrică name next to the date used to be squeezed into a single unbreakable
 * line and clipped; letting it wrap and reserving the space costs nothing on desktop.
 */
const META_ROW_CLASS = 'flex min-h-[1.5rem] flex-wrap items-center gap-x-2 gap-y-1';

/**
 * Post pages are statically rendered, so Next would eagerly prefetch the full payload of
 * every card in the viewport. On the homepage that meant roughly half a megabyte of
 * speculative RSC downloads competing with the fonts and the cover image on a phone.
 * The pages themselves are static and load fast on click, so the trade is worth it.
 */
const PREFETCH = false;

const PostCard: FC<PostCardProps> = ({ post, variant = 'grid', size = 'default' }) => {
  const isSmall = size === 'sm';
  const lead =
    post.lead.length > MAX_LEAD_LENGTH ? `${post.lead.slice(0, MAX_LEAD_LENGTH)}…` : post.lead;

  const meta = (
    <div className={getClassNames(META_ROW_CLASS, variant === 'list' ? 'mb-1.5' : 'mb-2')}>
      <RubricaBadge rubrica={post.rubrica} size="sm" />
      <time dateTime={getIsoDate(post.publishAt)} className="text-xs text-text-muted">
        {getFormattedDate(post.publishAt)}
      </time>
      {/* Only reader contributions are signed; everything else is the editorial team's. */}
      {post.rubrica === CONTRIBUTOR_RUBRICA && post.contributor && (
        <span className="text-xs font-medium italic text-teal">de {post.contributor}</span>
      )}
    </div>
  );

  if (variant === 'list') {
    return (
      <Link
        href={`${POST_ROUTE}/${post.slug}`}
        prefetch={PREFETCH}
        className="card-hover group flex gap-4 p-4 sm:gap-6"
        id={`post-${post.slug}`}
      >
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#328992] sm:h-48 sm:w-48">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 128px, 192px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <GlobeImage size={72} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-start pt-1">
          {meta}
          <h3
            className={getClassNames(
              'mb-1 line-clamp-2 break-words font-display text-text-primary transition-colors duration-200 group-hover:text-teal',
              isSmall ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
            )}
          >
            {post.title}
          </h3>
          <p className="hidden text-base text-text-secondary line-clamp-4 sm:block">
            <span className="font-semibold text-teal">{lead}</span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`${POST_ROUTE}/${post.slug}`}
      prefetch={PREFETCH}
      className="card-hover group flex h-full flex-col overflow-hidden"
      id={`post-${post.slug}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#328992]">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GlobeImage size={96} />
          </div>
        )}
      </div>

      <div className={getClassNames('flex flex-1 flex-col', isSmall ? 'p-3' : 'p-4 sm:p-5')}>
        {meta}
        <h3
          className={getClassNames(
            'mb-2 line-clamp-2 break-words font-display text-text-primary transition-colors duration-200 group-hover:text-teal',
            isSmall ? 'text-lg' : 'text-xl sm:text-2xl',
          )}
        >
          {post.title}
        </h3>
        <p className="flex-1 text-sm text-text-secondary line-clamp-3">
          <span className="font-semibold text-teal">{lead}</span>
        </p>
      </div>
    </Link>
  );
};

export default PostCard;
