import type { FC } from 'react';
import { Mail } from 'lucide-react';
// constants
import { SOCIAL_PLATFORMS } from '@constants/navigation';
import { BASE_URL, CONTACT_EMAIL } from '@constants/site';
// lib
import { getSettings } from '@lib/firestore/settings';
import { getBreadcrumbJsonLd } from '@lib/seo/jsonLd';
// components
import ContactForm from '@components/common/ContactForm';
import SecondaryBanner from '@components/common/SecondaryBanner';
import SocialIcon from '@components/icons/SocialIcon';

const CHANNEL_CARD_CLASS = 'card-hover group flex items-center gap-4 p-4';

/** Circular frame shared with the footer, recoloured for a light surface. */
const CHANNEL_ICON_CLASS = 'bg-teal/10 text-teal group-hover:bg-teal/20';

/**
 * Contact page.
 *
 * The channel list and the form are both `h-full` inside a stretch grid, so on desktop
 * the form ends level with the last channel card instead of stopping short of it.
 *
 * The channel labels show a readable handle from `SOCIAL_PLATFORMS` rather than the tail
 * of the URL — that is what used to surface `profile.php?id=61591579689711` for Facebook
 * and `+piuDH_6ePDU3ZjJk` for Telegram.
 */
const ContactView: FC = async () => {
  const settings = await getSettings();
  const contactEmail = settings.contactEmail || CONTACT_EMAIL;

  return (
    <div className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd([
              { name: 'Acasă', url: BASE_URL },
              { name: 'Contact', url: `${BASE_URL}/contact` },
            ]),
          ),
        }}
      />

      <SecondaryBanner title="Contact" subtitle="Suntem bucuroși să auzim de la tine" />

      <section className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex h-full flex-col gap-6">
            <div>
              <h2 className="mb-3 font-display text-3xl text-text-primary">Canalele noastre</h2>
              <p className="text-justify leading-relaxed text-text-secondary">
                Ne poți contacta prin oricare din canalele de mai jos sau folosind formularul de
                contact.
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <a href={`mailto:${contactEmail}`} id="contact-email" className={CHANNEL_CARD_CLASS}>
                {/* Sized to match SocialIcon exactly: 40 px frame, 22 px glyph */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal transition-colors group-hover:bg-teal/20">
                  <Mail width={22} height={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">Email</p>
                  <p className="truncate text-sm text-text-muted">{contactEmail}</p>
                </div>
              </a>

              {SOCIAL_PLATFORMS.map((platform) => (
                <a
                  key={platform.id}
                  id={`contact-${platform.id}`}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={CHANNEL_CARD_CLASS}
                >
                  <SocialIcon platform={platform.id} size={40} className={CHANNEL_ICON_CLASS} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{platform.label}</p>
                    <p className="truncate text-sm text-text-muted">{platform.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="h-full">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactView;
