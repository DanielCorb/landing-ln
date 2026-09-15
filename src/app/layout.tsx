import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
// constants
import { BASE_URL, SITE_DESCRIPTION, SITE_NAME } from '@constants/site';
// lib
import { getSettings } from '@lib/firestore/settings';
import { getOrganizationJsonLd, getWebSiteJsonLd } from '@lib/seo/jsonLd';
// components
import CookieBar from '@components/common/CookieBar';
import DonationPopup from '@components/common/DonationPopup';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import ScrollToTop from '@components/common/ScrollToTop';
import ThemeProvider from '@components/layout/ThemeProvider';
import TrackingProviders from '@components/common/TrackingProviders';
// style
import '@style/globals.css';

/**
 * Fonts are the heaviest thing on this site — heavier than all the JavaScript — so two
 * things matter here.
 *
 * **WOFF2, not TTF.** TTF ships uncompressed; the same outlines in WOFF2 are about a
 * third of the size. Regenerate with `node scripts/convertFontsToWoff2.js` if a face is
 * ever added.
 *
 * **Five faces, not eighteen.** `next/font/local` emits one `<link rel="preload">` per
 * declared face, so every unused weight is a render-blocking request on a phone.
 *
 * `adjustFontFallback` generates a metric-matched fallback, which is what keeps the
 * swap from shifting the layout (CLS).
 */
const poppins = localFont({
  src: [
    { path: '../assets/fonts/Poppins-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/Poppins-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../assets/fonts/Poppins-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/Poppins-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/Poppins-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

/** Applied before first paint so the theme never flashes. */
const THEME_BOOTSTRAP_SCRIPT = `
(function(){try{if(localStorage.getItem('ln-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();
`;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.publicationName || SITE_NAME;

  return {
    metadataBase: new URL(BASE_URL),
    title: { default: siteName, template: `%s — ${siteName}` },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: 'website',
      locale: 'ro_RO',
      siteName,
      title: siteName,
      description: SITE_DESCRIPTION,
      url: BASE_URL,
    },
    twitter: { card: 'summary_large_image', title: siteName, description: SITE_DESCRIPTION },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: { canonical: BASE_URL },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteJsonLd()) }}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${poppins.variable} font-body antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <TrackingProviders />
          <div className="relative flex min-h-screen flex-col">
            <Header kofiLink={settings.kofiLink} />
            <main className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
            <DonationPopup kofiLink={settings.kofiLink} />
            <CookieBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
