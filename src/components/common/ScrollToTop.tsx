'use client';

import { useEffect, useState, type FC } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

/** Fraction of the viewport the user must scroll before the button appears. */
const VISIBILITY_THRESHOLD = 0.75;

const ScrollToTop: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > window.innerHeight * VISIBILITY_THRESHOLD);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="animate-fade-in fixed bottom-6 right-6 z-[99] rounded-full bg-[#328992] p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-teal-dark"
      aria-label="Înapoi sus"
      id="scroll-to-top"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTop;
