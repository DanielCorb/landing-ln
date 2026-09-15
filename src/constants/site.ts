export const SITE_NAME = 'Lumea Nouă';

export const SITE_DESCRIPTION =
  'Lumea Nouă este o publicație online independentă cu articole, traduceri și contribuțiile cititorilor. Descoperă perspectivele și ideile care contează.';

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') || 'https://lumeanoua.com';

/**
 * Public contact address.
 *
 * The dashboard can override it in `settings/general.contactEmail`; this is the value used
 * where reading settings is not worth a round trip — the newsletter, the rubrici blurb.
 */
export const CONTACT_EMAIL = 'contact@lumeanoua.com';

/** Firestore collection holding posts. Physically still named `articles` — see @models/post. */
export const POSTS_COLLECTION = 'articles';

/** Firestore document holding site-wide settings. */
export const SETTINGS_DOC = 'settings/general';

/** Firestore collection holding contact-form submissions. */
export const CONTACTS_COLLECTION = 'Contacts';

/** Firestore collection holding newsletter subscribers. */
export const SUBSCRIBERS_COLLECTION = 'subscribers';

/**
 * How many posts one infinite-scroll batch loads, in the archive and in every rubrică
 * listing alike.
 *
 * 21 rather than a round 20 because the listing grid is three columns wide from `lg` up,
 * so a batch fills exactly seven rows and never leaves a ragged last line mid-scroll.
 */
export const POSTS_BATCH_SIZE = 21;

/** How many posts feed the "Ultimele publicații" carousel. */
export const RECENT_POSTS_COUNT = 10;

/** How many posts feed each rubrică carousel on the homepage. */
export const HOMEPAGE_RUBRICA_COUNT = 6;

/**
 * ISR window, in seconds, for post-driven pages.
 *
 * Documented here for reference only — Next.js requires `export const revalidate` to be
 * a literal it can read statically, so each page repeats the number rather than
 * importing this. Keep them in sync.
 */
export const REVALIDATE_SECONDS = 300;

/**
 * Number of frames in `@assets/globe-sprite.webp`.
 *
 * Must match `SPRITE_FRAMES` in scripts/buildGlobeAssets.mjs — it drives both the sheet
 * width and the `steps()` timing, so a mismatch shows up as a stuttering globe.
 */
export const GLOBE_SPRITE_FRAMES = 44;

/** Public route prefix for a single post. */
export const POST_ROUTE = '/postare';

/** Public route prefix for a rubrică listing. */
export const RUBRICA_ROUTE = '/rubrica';
