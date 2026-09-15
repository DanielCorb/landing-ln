'use client';

import type { FC } from 'react';
// components
import { useTheme } from '@components/layout/ThemeProvider';

/**
 * Sun/moon switch.
 *
 * Sized at 36 px against the header's 29 px search glyph. The two used to be declared
 * at an identical 32 px and still read as unequal, because this mark only fills about
 * three quarters of its box (the knob plus its rays) while the search mark filled
 * nearly all of it. Matching the *optical* sizes is what makes them look like a pair.
 */

const SIZE = 36;

const LIGHT_TRACK = '#8a8d8d';
const LIGHT_KNOB = '#e8f1f2';

/** Ray triangles, drawn once and reused — they never depend on props or state. */
const RAYS = [
  '0,13 3,11.5 3,14.5',
  '1,8 4.4,7.8 3.2,10.6',
  '3.8,3.8 7,4.8 4.8,7',
  '8,1 10.6,3.2 7.8,4.4',
  '13,0 14.5,3 11.5,3',
];

const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center p-1 transition-opacity duration-200 hover:opacity-80 focus:outline-none"
      aria-label={isDark ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
      id="theme-toggle"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Track */}
        <circle
          cx="16"
          cy="16"
          r="12"
          fill={isDark ? LIGHT_KNOB : LIGHT_TRACK}
          className="transition-colors duration-300 ease-in-out"
        />

        {/* Rays — visible in light mode, retracted in dark mode */}
        <g
          className={`transition-all duration-300 ease-in-out ${
            isDark ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{ transformOrigin: '13px 13px' }}
          fill={isDark ? LIGHT_TRACK : LIGHT_KNOB}
        >
          {RAYS.map((points) => (
            <polygon key={points} points={points} />
          ))}
        </g>

        {/* Knob */}
        <circle
          cx={isDark ? '19' : '13'}
          cy={isDark ? '19' : '13'}
          r="9"
          fill={isDark ? LIGHT_TRACK : LIGHT_KNOB}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </button>
  );
};

export default ThemeToggle;
