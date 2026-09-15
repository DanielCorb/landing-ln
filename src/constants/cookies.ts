/**
 * The cookie categories, defined once.
 *
 * Both the privacy policy (`@constants/legalPages`, section 3) and the preferences modal
 * read from here. They used to describe different things — the policy listed two
 * categories, the modal offered four, one of them advertising the site does not do — and a
 * consent dialog that contradicts the notice it links to is worse than no dialog: the
 * consent it collects does not cover what the policy says is happening.
 *
 * There are exactly two categories because that is what the site actually sets. Adding a
 * third means adding it to the policy in the same commit.
 */

/** Set regardless of consent; the site does not work without them. */
export const ESSENTIAL_COOKIES = [
  'un cookie de sesiune, care ține minte că ești în mijlocul unei vizite',
  'un cookie care reține țara din care accesezi site-ul, ca să-ți afișăm conținutul corect',
  'înregistrarea de bază a vizitelor, a tag-urilor de trafic și a deschiderii articolelor (pagină + țară, fără timp, scroll sau click-uri)',
] as const;

/** Set only after an explicit opt-in. */
export const OPTIONAL_COOKIES = [
  'măsurarea timpului petrecut pe site și a adâncimii de scroll',
  'înregistrarea click-urilor și a altor interacțiuni detaliate',
] as const;

export const ESSENTIAL_COOKIES_SUMMARY =
  'Fac site-ul să funcționeze și permit statistici de bază despre vizite. Nu pot fi dezactivate.';

export const OPTIONAL_COOKIES_SUMMARY =
  'Adaugă detalii de citire (timp, scroll, click-uri). Le poți refuza fără să pierzi conținutul.';
