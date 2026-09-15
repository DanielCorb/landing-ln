// constants
import { SOCIAL_PLATFORMS } from '@constants/navigation';
import { BASE_URL, POST_ROUTE, SITE_DESCRIPTION, SITE_NAME } from '@constants/site';
// models
import { Post } from '@models/post';

/**
 * JSON-LD structured data generators.
 *
 * Reference: https://developers.google.com/search/docs/appearance/structured-data
 */

const LOGO_URL = `${BASE_URL}/icon.png`;

/** Organization schema — emitted site-wide from the root layout. */
export const getOrganizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: BASE_URL,
  logo: LOGO_URL,
  sameAs: SOCIAL_PLATFORMS.map((platform) => platform.url),
});

/** WebSite schema with a SearchAction — enables the Google sitelinks search box. */
export const getWebSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  inLanguage: 'ro',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/arhiva?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/** Article schema for a single post, regardless of which rubrică it belongs to. */
export const getPostJsonLd = (post: Post) => {
  const postUrl = `${BASE_URL}${POST_ROUTE}/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.lead || undefined,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    image: post.coverImageUrl
      ? { '@type': 'ImageObject', url: post.coverImageUrl, width: 1200, height: 630 }
      : undefined,
    datePublished: post.publishAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    inLanguage: 'ro',
    isAccessibleForFree: true,
  };
};

/** BreadcrumbList schema — helps Google understand page hierarchy. */
export const getBreadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/** CollectionPage schema — homepage, archive and rubrică listings. */
export const getCollectionPageJsonLd = (options?: {
  name?: string;
  description?: string;
  url?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: options?.name || SITE_NAME,
  description: options?.description || SITE_DESCRIPTION,
  url: options?.url || BASE_URL,
  isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL },
  inLanguage: 'ro',
});
