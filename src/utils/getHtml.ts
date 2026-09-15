const BLOCK_CLOSING_TAGS = /<\/(p|div|h[1-6]|li)>/gi;
const ANY_TAG = /<[^>]+>/g;
const IMG_WITHOUT_LOADING = /<img(?![^>]*loading=)/gi;
const WHITESPACE_RUN = /\s+/g;

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

/** Strip all markup from an HTML string, keeping word boundaries between blocks. */
export const getPlainText = (html: string): string => {
  if (!html) return '';
  return html.replace(BLOCK_CLOSING_TAGS, ' ').replace(ANY_TAG, '').trim();
};

/** Plain-text excerpt of an HTML body, collapsed and truncated with an ellipsis. */
export const getExcerpt = (html: string, maxLength: number): string => {
  const text = getPlainText(html).replace(WHITESPACE_RUN, ' ').trim();
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

const LAZY_ATTRIBUTES = '<img loading="lazy" decoding="async"';

const EAGER_ATTRIBUTES = '<img loading="eager" fetchpriority="high" decoding="async"';

/**
 * Add loading hints to the `<img>` tags in editor-produced HTML.
 *
 * By default every body image is lazy — they are below the fold and have no business on
 * the critical path.
 *
 * `eagerFirstImage` promotes the first one. Use it only when the page has no cover
 * image, because then the first body image *is* what the reader sees first and
 * Lighthouse measures it as the LCP element — a lazily loaded LCP is by definition a
 * late one. When there *is* a cover, leave this off: two images both claiming high
 * priority just compete for the same bandwidth and both arrive later.
 */
export const getLazyLoadedHtml = (
  html: string,
  options: { eagerFirstImage?: boolean } = {},
): string => {
  if (!html) return '';
  if (!options.eagerFirstImage) return html.replace(IMG_WITHOUT_LOADING, LAZY_ATTRIBUTES);

  let isFirst = true;

  return html.replace(IMG_WITHOUT_LOADING, () => {
    if (!isFirst) return LAZY_ATTRIBUTES;
    isFirst = false;
    return EAGER_ATTRIBUTES;
  });
};

/** Escape HTML special characters before interpolating user input into markup. */
export const getEscapedHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
