import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '*.firebasestorage.app' },
    ],
    // Cover images are stable once uploaded, so let the CDN keep the optimised
    // variants for a month instead of re-encoding them on every ISR refresh.
    minimumCacheTTL: 2_592_000,
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      {
        // A post is a *postare*; "articole" is one of the three rubrici. The old route
        // implied every post was an article, so it now redirects to the canonical one.
        source: '/articol/:slug',
        destination: '/postare/:slug',
        permanent: true,
      },
      // The GDPR and cookie notices are now sections of the single privacy policy. These
      // two routes were linked from the footer and from the cookie banner, so they exist
      // in inboxes and in browser histories — they redirect rather than 404.
      {
        source: '/gdpr',
        destination: '/politica-de-confidentialitate',
        permanent: true,
      },
      {
        source: '/cookies',
        destination: '/politica-de-confidentialitate',
        permanent: true,
      },
    ];
  },

  // Allow the dashboard Tracking preview iframe to embed the site for the selector picker.
  async headers() {
    const dashboard = (process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.NEXT_PUBLIC_LN_API_BASE || '')
      .replace(/\/+$/, '');
    const ancestors = ["'self'", 'http://localhost:3001', 'http://127.0.0.1:3001'];
    if (dashboard) ancestors.push(dashboard);
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${ancestors.join(' ')}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
