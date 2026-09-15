import type { FC } from 'react';
// constants
import { LAST_UPDATED, PRIVACY_POLICY, type LegalBlock } from '@constants/legalPages';
// components
import SecondaryBanner from '@components/common/SecondaryBanner';
import ManageCookiesButton from '@components/common/ManageCookiesButton';

/**
 * The privacy and cookie policy.
 *
 * Blocks carry authored HTML — links and `<strong>` only — so `dangerouslySetInnerHTML` is
 * the mechanism, not a risk: nothing here originates outside `@constants/legalPages`.
 *
 * Link styling is applied from the container with arbitrary variants rather than on each
 * anchor, because the anchors live inside those HTML strings and cannot carry classes of
 * their own.
 */

const LINK_CLASS =
  '[&_a:hover]:text-teal-dark [&_a]:font-medium [&_a]:text-teal [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors dark:[&_a:hover]:text-teal-light';

const PROSE_CLASS = `space-y-4 text-base leading-relaxed text-text-secondary [&_p]:text-justify sm:text-lg ${LINK_CLASS}`;

const getBlockHtml = (block: LegalBlock, index: number) => {
  if (block.type === 'list') {
    return (
      <ul key={index} className="list-disc space-y-2 pl-6 text-left">
        {block.items.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    );
  }

  return <p key={index} dangerouslySetInnerHTML={{ __html: block.html }} />;
};

const LegalPageView: FC = () => {
  return (
    <div className="animate-fade-in">
      {/* The banner carries the document's <h1>, so the body starts at <h2>. */}
      <SecondaryBanner
        title={PRIVACY_POLICY.title}
        titleClass="animate-fade-in-up mx-auto max-w-4xl font-display text-3xl tracking-wide text-offwhite sm:text-4xl md:text-5xl"
      />

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <header className={`${PROSE_CLASS} border-b border-border pb-8`}>
            {PRIVACY_POLICY.intro.map(getBlockHtml)}
            <p className="!text-left text-sm text-text-muted">Ultima actualizare: {LAST_UPDATED}</p>
          </header>

          <div className="space-y-10 pt-10">
            {PRIVACY_POLICY.sections.map((section) => (
              <section key={section.heading} className="scroll-mt-24">
                <h2 className="mb-4 font-display text-2xl text-text-primary sm:text-3xl">
                  {section.heading}
                </h2>
                <div className={PROSE_CLASS}>{section.blocks.map(getBlockHtml)}</div>
              </section>
            ))}
          </div>

          <ManageCookiesButton />
        </article>
      </section>
    </div>
  );
};

export default LegalPageView;
