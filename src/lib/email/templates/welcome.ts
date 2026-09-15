// constants
import { EMAIL_COLORS } from '@constants/email';
import { RUBRICI, RUBRICI_INTRO, RUBRICI_SUBMISSION_NOTE } from '@constants/rubrici';
import { BASE_URL, CONTACT_EMAIL, RUBRICA_ROUTE, SITE_NAME } from '@constants/site';
// lib
import { EMAIL_TEXT, getButtonHtml, getEmailLayout } from './layout';

/**
 * Confirmation sent the moment someone subscribes.
 *
 * Beyond being a courtesy this is the reader's first proof that the address works and
 * their only early chance to leave, so the unsubscribe link is as prominent here as in a
 * regular issue — a welcome mail nobody can escape is the fastest route to a spam report.
 */

interface WelcomeEmail {
  subject: string;
  html: string;
  text: string;
}

const getRubricaUrl = (slug: string): string => `${BASE_URL}${RUBRICA_ROUTE}/${slug}`;

/**
 * The three rubrici, each name linking to its own listing.
 *
 * The colour is stated on the anchor because mail clients re-style bare links with their
 * own blue instead of inheriting from the parent, as a browser would.
 */
const getRubriciListHtml = (): string =>
  RUBRICI.map(
    (rubrica) => `
      <tr>
        <td style="padding:0 0 12px;">
          <p style="${EMAIL_TEXT.paragraph} margin:0 0 2px;font-weight:bold;">
            <a href="${getRubricaUrl(rubrica.slug)}" style="color:${EMAIL_COLORS.teal};text-decoration:none;">${rubrica.name}</a>
          </p>
          <p style="${EMAIL_TEXT.muted} margin:0;">${rubrica.description}</p>
        </td>
      </tr>`,
  ).join('');

export const getWelcomeEmail = (unsubscribeUrl: string | null): WelcomeEmail => {
  const bodyHtml = `
    <p style="${EMAIL_TEXT.label}">Bine ai venit</p>
    <h1 style="${EMAIL_TEXT.heading}">Te-ai abonat cu succes</h1>

    <p style="${EMAIL_TEXT.paragraph}">
      Îți mulțumim că te-ai alăturat comunității ${SITE_NAME}. De acum primești un email
      de fiecare dată când publicăm o postare nouă — atât și nimic altceva.
    </p>

    <p style="${EMAIL_TEXT.paragraph} font-weight:bold;">${RUBRICI_INTRO}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${getRubriciListHtml()}
    </table>

    <p style="${EMAIL_TEXT.muted}">
      ${RUBRICI_SUBMISSION_NOTE}
      <a href="mailto:${CONTACT_EMAIL}" style="color:${EMAIL_COLORS.teal};">${CONTACT_EMAIL}</a>
    </p>

    ${getButtonHtml({ label: 'Vezi ultimele postări', url: BASE_URL })}

    <p style="${EMAIL_TEXT.muted}">
      Dacă nu tu ai cerut abonarea, poți ieși imediat din lista noastră folosind linkul de
      mai jos. Nu trebuie să faci nimic altceva.
    </p>`;

  const text = [
    `Te-ai abonat cu succes la newsletterul ${SITE_NAME}.`,
    '',
    'De acum primești un email de fiecare dată când publicăm o postare nouă.',
    '',
    RUBRICI_INTRO,
    ...RUBRICI.flatMap((rubrica) => [
      '',
      `- ${rubrica.name}: ${rubrica.description}`,
      `  ${getRubricaUrl(rubrica.slug)}`,
    ]),
    '',
    `${RUBRICI_SUBMISSION_NOTE} ${CONTACT_EMAIL}`,
    '',
    `Vezi ultimele postări: ${BASE_URL}`,
    unsubscribeUrl ? `\nDezabonare: ${unsubscribeUrl}` : '',
  ].join('\n');

  return {
    subject: `Bine ai venit la ${SITE_NAME}`,
    html: getEmailLayout({
      preheader: `Ești abonat la newsletterul ${SITE_NAME}.`,
      bodyHtml,
      unsubscribeUrl,
    }),
    text,
  };
};
