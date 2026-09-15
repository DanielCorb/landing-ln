const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const MARKDOWN_BOLD = /\*\*([^*]+)\*\*/g;
const MARKDOWN_ITALIC = /\*([^*]+)\*/g;
const FOOTNOTE_ATTRIBUTE = /data-content="([^"]*)"/g;

/**
 * Opening tag of a footnote marker. `[^>]*` is safe here because the note text is stored
 * HTML-escaped, so no attribute value can contain a raw `>`.
 */
const FOOTNOTE_SPAN = /<span([^>]*\bclass="tiptap-footnote"[^>]*)>/g;

const LINK_REPLACEMENT =
  '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal hover:underline dark:text-teal-light font-medium">$1</a>';

const HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
};

/** Render the tiny markdown subset the editor allows inside a footnote. */
export const getParsedFootnoteHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(MARKDOWN_LINK, LINK_REPLACEMENT)
    .replace(MARKDOWN_BOLD, '<strong>$1</strong>')
    .replace(MARKDOWN_ITALIC, '<em>$1</em>');
};

/**
 * Ids pairing a marker in the text with its entry in the notes list, so the two can link
 * to each other. Both are numbered by the marker's position in the document, which is
 * also what `getFootnotes` orders by and what the CSS counter on the marker prints.
 */
export const getNoteRefId = (position: number): string => `nota-ref-${position}`;

export const getNoteId = (position: number): string => `nota-${position}`;

/**
 * Give every footnote marker an id, so the notes list at the bottom can link back to the
 * exact place in the text the note was taken from.
 *
 * Done on the stored HTML rather than in the editor: the markers are written by the
 * dashboard and the numbering only means anything once a whole post is assembled, so the
 * ids belong to the rendering rather than to the saved content.
 */
export const getHtmlWithNoteIds = (html: string): string => {
  if (!html) return '';

  let position = 0;
  return html.replace(FOOTNOTE_SPAN, (_whole, attributes: string) => {
    position += 1;
    return `<span${attributes} id="${getNoteRefId(position)}">`;
  });
};

/** Collect the footnote texts embedded as `data-content` attributes in post HTML. */
export const getFootnotes = (html: string): string[] => {
  if (!html) return [];

  const footnotes: string[] = [];
  let match = FOOTNOTE_ATTRIBUTE.exec(html);

  while (match !== null) {
    const content = match[1].replace(
      /&quot;|&amp;|&lt;|&gt;|&#39;/g,
      (entity) => HTML_ENTITIES[entity] ?? entity,
    );
    if (content.trim()) footnotes.push(content);
    match = FOOTNOTE_ATTRIBUTE.exec(html);
  }

  FOOTNOTE_ATTRIBUTE.lastIndex = 0;
  return footnotes;
};
