// constants
import { EMAIL_COLORS, EMAIL_LEAD_LENGTH } from '@constants/email';
import { CONTRIBUTOR_RUBRICA, RUBRICA_NAMES } from '@constants/rubrici';
import { BASE_URL, POST_ROUTE, RUBRICA_ROUTE, SITE_NAME } from '@constants/site';
// models
import { Post } from '@models/post';
// utils
import { getFormattedDate } from '@utils/getFormattedDate';
import { getEscapedHtml, getExcerpt } from '@utils/getHtml';
// lib
import { EMAIL_TEXT, FONT_STACK, getButtonHtml, getEmailLayout } from './layout';

/**
 * The issue that goes out when a post is published.
 *
 * Deliberately a *teaser* — cover, rubrică, title, lead, button — and not the article
 * itself. Two reasons. The body is editor-produced HTML with footnote markup that
 * `FootnoteList` resolves at render time on the site; pasted into an email those become
 * dangling superscripts with nothing to link to. And Gmail silently clips any message
 * over ~102KB behind a "[Mesaj trunchiat]" link, which is exactly where a full article
 * with inline images lands.
 */

interface NewPostEmail {
  subject: string;
  html: string;
  text: string;
}

const getPostUrl = (post: Post): string => `${BASE_URL}${POST_ROUTE}/${post.slug}`;

const getRubricaUrl = (post: Post): string => `${BASE_URL}${RUBRICA_ROUTE}/${post.rubrica}`;

/**
 * The contributor's own listing — the rubrică page pre-filtered to their name.
 *
 * Built to match the byline link in `PostView` exactly, `author` search param and
 * `encodeURIComponent` included, so the address in an email and the one on the site are
 * the same shareable URL rather than two routes that happen to look alike.
 */
const getAuthorUrl = (contributor: string): string =>
  `${BASE_URL}${RUBRICA_ROUTE}/${CONTRIBUTOR_RUBRICA}?author=${encodeURIComponent(contributor)}`;

/**
 * Anchor with the colour and underline stated inline.
 *
 * Mail clients do not inherit link styling the way a browser does — Gmail and Outlook
 * both re-style bare `<a>` tags with their own blue, so every link here has to carry its
 * own colour or the email ends up with three different accent tones.
 */
const getLinkHtml = (url: string, label: string, style: string): string =>
  `<a href="${url}" style="${style}">${getEscapedHtml(label)}</a>`;

/**
 * Cover image, when there is one.
 *
 * `coverImageUrl` is already a public Firebase Storage URL, so it needs no rehosting.
 * Width is fixed in an attribute as well as in CSS because Outlook ignores the style.
 */
const getCoverHtml = (post: Post): string => {
  if (!post.coverImageUrl) return '';

  return `
    <tr>
      <td style="padding:0 0 24px;">
        <a href="${getPostUrl(post)}">
          <img src="${post.coverImageUrl}" alt="${getEscapedHtml(post.title)}" width="536"
               style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:8px;" />
        </a>
      </td>
    </tr>`;
};

const AUTHOR_LINK_STYLE = `color:${EMAIL_COLORS.teal};text-decoration:underline;font-weight:bold;`;

const getBylineHtml = (post: Post): string => {
  const date = post.publishAt ? getFormattedDate(post.publishAt) : '';

  // Only the contributions rubrică carries a byline; everything else is written by the
  // editorial team, so there is no author page to point at.
  const contributor =
    post.rubrica === CONTRIBUTOR_RUBRICA && post.contributor
      ? ` &middot; de ${getLinkHtml(getAuthorUrl(post.contributor), post.contributor, AUTHOR_LINK_STYLE)}`
      : '';

  if (!date && !contributor) return '';

  return `<p style="${EMAIL_TEXT.muted} margin:0 0 18px;">${date}${contributor}</p>`;
};

export const getNewPostEmail = (post: Post, unsubscribeUrl: string | null): NewPostEmail => {
  const url = getPostUrl(post);
  const lead = post.lead || getExcerpt(post.body, EMAIL_LEAD_LENGTH);

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${getCoverHtml(post)}
      <tr>
        <td>
          <p style="${EMAIL_TEXT.label}">
            ${getLinkHtml(getRubricaUrl(post), RUBRICA_NAMES[post.rubrica], `color:${EMAIL_COLORS.teal};text-decoration:none;`)}
          </p>

          <h1 style="${EMAIL_TEXT.heading}">
            <a href="${url}" style="color:${EMAIL_COLORS.text};text-decoration:none;">
              ${getEscapedHtml(post.title)}
            </a>
          </h1>

          ${getBylineHtml(post)}

          <p style="${EMAIL_TEXT.paragraph} text-align:justify;">${getEscapedHtml(lead)}</p>

          ${getButtonHtml({ label: 'Citește articolul', url })}

          <p style="margin:0 0 8px;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${EMAIL_COLORS.muted};">
            Dacă butonul nu funcționează, copiază acest link în browser:<br />
            <a href="${url}" style="color:${EMAIL_COLORS.teal};word-break:break-all;">${url}</a>
          </p>
        </td>
      </tr>
    </table>`;

  const hasContributor = post.rubrica === CONTRIBUTOR_RUBRICA && post.contributor;

  // The plain-text part gets the same destinations spelled out: a reader whose client
  // strips HTML should not lose the links, only their formatting.
  const text = [
    `${RUBRICA_NAMES[post.rubrica]} — ${SITE_NAME}`,
    '',
    post.title,
    post.publishAt ? getFormattedDate(post.publishAt) : '',
    hasContributor ? `de ${post.contributor}` : '',
    '',
    lead,
    '',
    `Citește articolul: ${url}`,
    `Toate postările din rubrică: ${getRubricaUrl(post)}`,
    hasContributor ? `Toate textele autorului: ${getAuthorUrl(post.contributor as string)}` : '',
    unsubscribeUrl ? `\nDezabonare: ${unsubscribeUrl}` : '',
  ]
    .filter((line, index, all) => line !== '' || all[index - 1] !== '')
    .join('\n');

  return {
    subject: post.title,
    html: getEmailLayout({
      preheader: lead.slice(0, 140),
      bodyHtml,
      unsubscribeUrl,
    }),
    text,
  };
};
