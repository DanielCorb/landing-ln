'use client';

import { useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
// constants
import { NAV_ITEMS } from '@constants/navigation';
// utils
import { getClassNames } from '@utils/getClassNames';
// components
import KofiIcon from '@components/icons/KofiIcon';
import SearchIcon from '@components/icons/SearchIcon';
import SearchOverlay from '@components/common/SearchOverlay';
import ThemeToggle from '@components/layout/ThemeToggle';
import logoImg from '@assets/logo.png';

interface HeaderProps {
  kofiLink?: string;
}

/**
 * Optical sizing note.
 *
 * Both marks used to be declared at an identical 32 px and still looked unequal,
 * because they fill their boxes differently: the search glyph runs edge to edge while
 * the toggle is a knob with rays around it. These numbers restore the balance — the
 * search mark drops about a tenth, the toggle (36 px, in ThemeToggle) gains about an
 * eighth, which lands them at roughly 25 px and 27 px of actual ink.
 */
const SEARCH_ICON_SIZE = 30;

const NAV_LINK_CLASS =
  'px-4 py-2 text-sm font-medium text-offwhite/85 hover:text-white rounded-btn transition-all duration-200 hover:bg-white/10';

const KOFI_LINK_CLASS =
  'flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black/20 hover:bg-black/30 rounded-btn transition-all duration-200';

const Header: FC<HeaderProps> = ({ kofiLink }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-teal-dark/30 bg-teal selection:bg-black selection:text-white">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="relative flex h-10 w-[140px] items-center transition-opacity hover:opacity-90 min-[360px]:w-[180px] sm:w-[240px]"
              id="header-logo"
            >
              <Image
                src={logoImg}
                alt="Lumea Nouă"
                fill
                sizes="240px"
                className="object-contain object-left"
                priority
              />
            </Link>

            {/* Desktop actions and navigation */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center justify-center p-1 text-offwhite transition-opacity duration-200 hover:opacity-80"
                  aria-label="Caută postări"
                  id="search-toggle"
                >
                  <SearchIcon size={SEARCH_ICON_SIZE} />
                </button>

                <ThemeToggle />
              </div>

              <div className="mx-3 h-7 w-[2px] rounded-full bg-white" />

              <nav className="flex items-center gap-1" id="main-nav">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={NAV_LINK_CLASS}
                    id={`nav-${item.href.slice(1)}`}
                  >
                    {item.label}
                  </Link>
                ))}
                {kofiLink && (
                  <a
                    href={kofiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getClassNames(KOFI_LINK_CLASS, 'ml-2')}
                  >
                    <KofiIcon size={20} />
                    Susține
                  </a>
                )}
              </nav>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center p-1 text-offwhite transition-opacity duration-200 hover:opacity-80"
                aria-label="Caută postări"
              >
                <SearchIcon size={SEARCH_ICON_SIZE} />
              </button>

              <ThemeToggle />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-1 rounded-full p-2 text-offwhite/85 transition-all duration-200 hover:bg-white/10 hover:text-white"
                aria-label={mobileMenuOpen ? 'Închide meniul' : 'Deschide meniul'}
                aria-expanded={mobileMenuOpen}
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            className="animate-fade-in border-t border-white/10 bg-teal-dark/50 md:hidden"
            id="mobile-menu"
          >
            <div className="mx-auto max-w-content space-y-1 px-4 py-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-btn px-4 py-2.5 text-sm font-medium text-offwhite/85 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              {kofiLink && (
                <a
                  href={kofiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getClassNames(KOFI_LINK_CLASS, 'mt-4 justify-center py-3')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <KofiIcon size={20} />
                  Susține
                </a>
              )}
            </div>
          </nav>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
};

export default Header;
