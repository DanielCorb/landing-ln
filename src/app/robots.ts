import type { MetadataRoute } from 'next';
// constants
import { BASE_URL } from '@constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
