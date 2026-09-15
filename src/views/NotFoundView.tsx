import type { FC } from 'react';
import Link from 'next/link';
// components
import GlobeSpinner from '@components/icons/GlobeSpinner';

const PRIMARY_LINK_CLASS =
  'inline-flex items-center justify-center rounded-btn bg-teal px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-teal-dark hover:shadow-lg';

const SECONDARY_LINK_CLASS =
  'inline-flex items-center justify-center rounded-btn border border-border px-6 py-3 font-medium text-text-secondary transition-colors duration-200 hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5';

const NotFoundView: FC = () => {
  return (
    <div className="animate-fade-in flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-32 w-32 items-center justify-center">
          <GlobeSpinner size={128} />
        </div>

        <div className="space-y-4">
          {/* font-bold, not extrabold: weight 800 was the only use of an entire extra
              font face, which every visitor would have had to download. */}
          <h1 className="font-display text-7xl font-bold text-teal">404</h1>
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Pagina nu a fost găsită
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-secondary sm:max-w-sm sm:text-base">
            Se pare că ai ajuns într-un loc neexplorat. Pagina pe care o cauți nu există sau a fost
            mutată.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Link href="/" className={PRIMARY_LINK_CLASS}>
            Acasă
          </Link>
          <Link href="/contact" className={SECONDARY_LINK_CLASS}>
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
