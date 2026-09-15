import type { FC } from 'react';
import Image, { type StaticImageData } from 'next/image';

interface SecondaryBannerProps {
  title: string;
  subtitle?: string;
  titleImage?: StaticImageData;
  /**
   * Typography for the heading, replacing the default.
   *
   * The default size suits the one- and two-word titles the banner was built for. A long
   * one — the privacy policy's, for instance — runs to three lines at `text-7xl` and turns
   * the banner into most of the first screen.
   */
  titleClass?: string;
}

const DECORATIVE_GRADIENT = {
  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)`,
};

/**
 * Teal banner for secondary pages. The height is fixed by padding rather than by the
 * content, so swapping a text heading for a title image does not shift the page.
 */
const DEFAULT_TITLE_CLASS =
  'animate-fade-in-up font-display text-5xl tracking-wide text-offwhite sm:text-6xl md:text-7xl';

const SecondaryBanner: FC<SecondaryBannerProps> = ({
  title,
  subtitle,
  titleImage,
  titleClass = DEFAULT_TITLE_CLASS,
}) => {
  return (
    <section className="relative overflow-hidden bg-teal" id="page-banner">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-0 top-0 h-full w-full" style={DECORATIVE_GRADIENT} />
      </div>

      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto max-w-content px-4 py-16 text-center sm:px-6 sm:py-20 md:py-24">
        {titleImage ? (
          <>
            <h1 className="sr-only">{title}</h1>
            <div className="animate-fade-in-up flex h-24 justify-center sm:h-32 md:h-40">
              <Image
                src={titleImage}
                alt={title}
                sizes="(max-width: 640px) 60vw, 420px"
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </>
        ) : (
          <h1 className={titleClass}>{title}</h1>
        )}
        {subtitle && (
          <p className="animate-fade-in mx-auto mt-4 max-w-2xl text-lg text-offwhite/70">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default SecondaryBanner;
