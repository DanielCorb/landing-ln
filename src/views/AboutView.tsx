import type { FC } from 'react';
// constants
import { BASE_URL } from '@constants/site';
// utils
import { getFootnotes, getHtmlWithNoteIds } from '@utils/getFootnotes';
import { getLazyLoadedHtml } from '@utils/getHtml';
// lib
import { getSettings } from '@lib/firestore/settings';
import { getBreadcrumbJsonLd } from '@lib/seo/jsonLd';
// components
import FootnoteList from '@components/common/FootnoteList';
import FootnotePopup from '@components/common/FootnotePopup';
import SecondaryBanner from '@components/common/SecondaryBanner';

/**
 * Same treatment as a post body: the alignment targets the paragraphs and list items
 * inside the rendered TipTap HTML, so headings and captions are left alone.
 */
const ABOUT_BODY_CLASS =
  'article-body text-base text-text-primary sm:text-lg [&_li]:text-justify [&_p]:text-justify';

/** About page — body comes from the dashboard's "Despre Noi" rich text field. */
const AboutView: FC = async () => {
  const settings = await getSettings();
  const content = settings.aboutPageContent || '';
  const footnotes = getFootnotes(content);

  return (
    <div className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: 'Acasă', url: BASE_URL },
              { name: 'Despre noi', url: `${BASE_URL}/despre-noi` },
            ]),
          ),
        }}
      />

      <SecondaryBanner title="Despre noi" subtitle="Publicația Lumea Nouă" />

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {content ? (
          <div
            className={ABOUT_BODY_CLASS}
            // No cover on this page, so the first image is the one the reader sees first.
            dangerouslySetInnerHTML={{
              __html: getHtmlWithNoteIds(getLazyLoadedHtml(content, { eagerFirstImage: true })),
            }}
          />
        ) : (
          <p className="text-justify text-text-muted">
            Conținutul acestei pagini urmează să fie completat.
          </p>
        )}

        <FootnoteList footnotes={footnotes} headingLevel="h3" />
      </section>

      <FootnotePopup />
    </div>
  );
};

export default AboutView;
