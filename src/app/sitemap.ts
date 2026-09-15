import type { MetadataRoute } from 'next';
// constants
import { RUBRICA_SLUGS } from '@constants/rubrici';
import { BASE_URL, POST_ROUTE, RUBRICA_ROUTE } from '@constants/site';
// lib
import { getAllPublishedPosts } from '@lib/firestore/posts';

const STATIC_ROUTES = [
  '',
  '/arhiva',
  '/despre-noi',
  '/contact',
  '/politica-de-confidentialitate',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const rubricaEntries: MetadataRoute.Sitemap = RUBRICA_SLUGS.map((slug) => ({
    url: `${BASE_URL}${RUBRICA_ROUTE}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}${POST_ROUTE}/${post.slug}`,
    lastModified: post.updatedAt || post.publishAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticEntries, ...rubricaEntries, ...postEntries];
}
