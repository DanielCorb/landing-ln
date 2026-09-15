import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// constants
import { FOOTER_LINKS, SOCIAL_PLATFORMS } from '@constants/navigation';
// components
import SocialIcon from '@components/icons/SocialIcon';
import logo2Img from '@assets/logo-2.png';

/**
 * The social row renders the shared `SocialIcon` set, framed exactly like the one on
 * the contact page. Both surfaces read the same `SOCIAL_PLATFORMS` list, so the order,
 * the icons and the labels cannot drift apart.
 */
const SOCIAL_ICON_CLASS = 'bg-white/15 text-white hover:bg-white/25';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative z-[999] bg-[#328992] text-white selection:bg-black selection:text-white"
      id="footer"
    >
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 min-[400px]:flex-row min-[400px]:items-end">
          {/* Mobile top row / desktop left side */}
          <div className="flex w-full flex-row justify-between gap-2 min-[400px]:w-auto min-[400px]:flex-col">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="relative flex h-full w-[120px] items-center transition-opacity hover:opacity-90 min-[400px]:h-[116px] min-[400px]:w-full"
              >
                <Image
                  src={logo2Img}
                  alt="Lumea Nouă"
                  fill
                  sizes="180px"
                  className="object-contain object-left"
                />
              </Link>
              <p className="ml-1 text-[10px] font-medium text-white/90 min-[400px]:text-xs">
                © Lumea Nouă {currentYear}
              </p>
            </div>

            {/* Page + legal links — mobile */}
            <div className="flex flex-col items-end gap-1.5 min-[400px]:hidden">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="text-end text-md font-medium text-white transition-colors duration-200 hover:text-white/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: page + legal links and social */}
          <div className="flex w-full flex-col items-end gap-6 min-[400px]:w-auto">
            <div className="hidden flex-col items-end gap-1.5 min-[400px]:flex text-right">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="text-[15px] font-medium text-white transition-colors duration-200 hover:text-white/80"
                  id={`footer-${link.href.slice(1)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex w-full items-center justify-between gap-2 min-[400px]:mt-0 min-[400px]:w-auto min-[400px]:justify-end min-[400px]:gap-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.label}
                  id={`footer-${platform.id}`}
                  className="transition-opacity hover:opacity-90"
                >
                  <SocialIcon platform={platform.id} size={40} className={SOCIAL_ICON_CLASS} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
