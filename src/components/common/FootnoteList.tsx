import type { FC } from 'react';
// utils
import { getNoteId, getNoteRefId, getParsedFootnoteHtml } from '@utils/getFootnotes';

interface FootnoteListProps {
  /** Note texts in the order their markers appear in the body. */
  footnotes: string[];
  /** Heading level, so a post can nest this under its own structure. */
  headingLevel?: 'h2' | 'h3';
}

/**
 * The notes gathered at the foot of a post.
 *
 * Numbered explicitly rather than with `list-decimal`, because the number is the link
 * back to the marker it belongs to and a CSS-generated one cannot be clicked. The
 * position it prints is the same one the marker's own counter shows, so the two always
 * read as a matching pair.
 */
const FootnoteList: FC<FootnoteListProps> = ({ footnotes, headingLevel = 'h2' }) => {
  if (footnotes.length === 0) return null;

  const Heading = headingLevel;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <Heading className="mb-6 font-display text-xl uppercase text-text-primary sm:text-2xl">
        Note de subsol:
      </Heading>

      <ol className="space-y-3 text-sm text-text-secondary sm:text-base">
        {footnotes.map((footnote, index) => {
          const position = index + 1;

          return (
            <li
              key={`${position}-${footnote.slice(0, 24)}`}
              id={getNoteId(position)}
              // Clears the sticky header when the marker links down to this note.
              className="flex scroll-mt-24 gap-2"
            >
              <a
                href={`#${getNoteRefId(position)}`}
                className="shrink-0 font-semibold text-teal underline-offset-2 transition-colors hover:underline dark:hover:text-teal-light"
                aria-label={`Înapoi la nota ${position} din text`}
              >
                {position}.
              </a>
              {/*
               * Most notes are a bare source URL, which is one unbreakable token: without
               * a break rule it runs straight off the side of a phone. `anywhere` rather
               * than `break-word` because this is a flex child, and only `anywhere` also
               * shrinks the item's min-content width to match.
               */}
              <span
                className="min-w-0 flex-1 text-justify [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: getParsedFootnoteHtml(footnote) }}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default FootnoteList;
