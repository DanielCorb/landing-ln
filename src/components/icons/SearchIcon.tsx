import type { FC } from 'react';

/**
 * Header search glyph.
 *
 * Replaces a 470 KB "SVG" that was really a base64 PNG shipped on every page and then
 * scaled down to 32 px. Being a real vector it also stays crisp and inherits colour.
 *
 * The mark is drawn edge to edge inside the 24-unit box (~82% fill), so the `size`
 * prop is effectively the optical size — which is what lets the header line it up
 * against the theme toggle by eye rather than by bounding box.
 */

interface SearchIconProps {
  /** Rendered size in pixels. */
  size?: number;
  className?: string;
}

const SearchIcon: FC<SearchIconProps> = ({ size = 24, className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.6" />
      <path d="m15.5 15.5 6.1 6.1" />
    </svg>
  );
};

export default SearchIcon;
