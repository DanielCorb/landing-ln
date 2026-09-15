// models
import { Rubrica } from '@models/post';
import { RubricaMeta } from '@models/rubrica';

/**
 * The three rubrici a post can be filed under.
 *
 * This list is the single source of truth for rubrică slugs, names and copy on the
 * public site. It mirrors the identical list in the dashboard.
 */
export const RUBRICI: RubricaMeta[] = [
  {
    slug: 'articole',
    name: 'Articole',
    description:
      'Această rubrică este destinată articolelor elaborate de către echipa redacției Lumea Nouă. Orice articol din această rubrică a fost scris, documentat și aprobat integral de către noi.',
    iconId: 'typewriter',
  },
  {
    slug: 'traduceri',
    name: 'Traduceri',
    description:
      'Această rubrică este dedicată articolelor preluate de la publicații străine. Chiar dacă nu ne aliniem întru totul pe fiecare poziție prezentată în ele, împărțim un interes pentru luptele antiimperialiste și consolidarea democrației populare oriunde în lume.',
    iconId: 'map',
  },
  {
    slug: 'contributiile-cititorilor',
    name: 'Contribuțiile Cititorilor',
    description:
      'Această rubrică marchează articole care ne-au fost trimise de către unii cititori ai publicației. Pentru a fi acceptate pentru publicare, articolele trebuie să se potrivească tematicii publicației, să se alinieze cu pozițiile redacției și să fie bazate pe surse concrete, care sunt citate în text. Redacția poate cere schimbări ale textului în acest sens pe durata procesului de verificare.',
    iconId: 'mailbox',
  },
];

/** Introduces the set of rubrici wherever all three are presented together. */
export const RUBRICI_INTRO = 'Rubricile redacției Lumea Nouă:';

/**
 * Closes the same presentation with the invitation to contribute.
 *
 * Split from the address so the site can render it as a `mailto:` link and the newsletter
 * as an anchor, without the copy being written out twice.
 */
export const RUBRICI_SUBMISSION_NOTE =
  'Puteți propune articole pe orice platformă unde activăm, prin mesaj direct sau la adresa de e-mail:';

/** Quick slug → display name lookup. */
export const RUBRICA_NAMES: Record<Rubrica, string> = {
  articole: 'Articole',
  traduceri: 'Traduceri',
  'contributiile-cititorilor': 'Contribuțiile Cititorilor',
};

/** All valid rubrică slugs. */
export const RUBRICA_SLUGS: Rubrica[] = RUBRICI.map((rubrica) => rubrica.slug);

/** Default rubrică used when a stored post has a missing or unknown value. */
export const DEFAULT_RUBRICA: Rubrica = 'articole';

/**
 * The one rubrică whose posts carry a contributor byline.
 *
 * Everything else is written by the editorial team, so "de {autor}" is rendered — and the
 * author filter offered — only here. Mirrors the same constant in the dashboard.
 */
export const CONTRIBUTOR_RUBRICA: Rubrica = 'contributiile-cititorilor';
