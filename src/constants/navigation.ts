// models
import { SocialPlatform } from '@models/social';

export const NAV_ITEMS = [
  { href: '/arhiva', label: 'Arhivă' },
  { href: '/despre-noi', label: 'Despre noi' },
  { href: '/contact', label: 'Contact' },
];

/**
 * One entry, not three.
 *
 * The separate GDPR and cookie pages were folded into the privacy policy — three links to
 * near-identical documents made a reader guess which one held the clause they were after.
 */
export const LEGAL_LINKS = [
  { href: '/politica-de-confidentialitate', label: 'Politica de Confidențialitate și Cookie-uri' },
];

/**
 * The footer link column: the same pages the header offers, followed by the legal one.
 *
 * Composed from the two lists above rather than retyped, so a route renamed in the header
 * cannot leave a dead link sitting in the footer.
 */
export const FOOTER_LINKS = [...NAV_ITEMS, ...LEGAL_LINKS];

/**
 * Single source of truth for the social accounts.
 *
 * Used identically by the footer and by the contact page, so the two can never drift
 * apart in order, icon set or labelling.
 */
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@lumea__noua',
    url: 'https://www.instagram.com/lumea__noua/',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'Lumea Nouă',
    url: 'https://www.facebook.com/profile.php?id=61591579689711',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@lumea__noua',
    url: 'https://www.tiktok.com/@lumea__noua',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    handle: 'Lumea Nouă',
    url: 'https://telegram.me/+piuDH_6ePDU3ZjJk',
  },
];

/** Fallback donation link when the dashboard has not configured one. */
export const DEFAULT_KOFI_LINK = 'https://ko-fi.com/lumeanoua';
