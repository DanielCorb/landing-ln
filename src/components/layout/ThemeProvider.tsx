'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type FC,
  type ReactNode,
} from 'react';

/**
 * Dark/light mode.
 *
 * The `dark` class on `<html>` is the single source of truth, and the blocking inline
 * script in the root layout puts it there before first paint. This provider therefore
 * *reads* that class through `useSyncExternalStore` instead of mirroring it into state
 * from a mount effect — no cascading render, and no window where React and the DOM
 * disagree.
 *
 * Children also render on the very first pass, including on the server. An earlier
 * version returned `null` until it had mounted, which meant the server sent a document
 * with an empty body and the browser had to download and execute the whole client
 * bundle before a single pixel of content existed — the single largest contributor to
 * the 15.8 s mobile LCP.
 */

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'ln-theme';

const DEFAULT_THEME: Theme = 'light';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Components subscribed to the theme, notified whenever the class is toggled. */
const listeners = new Set<() => void>();

const subscribe = (onStoreChange: () => void): (() => void) => {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
};

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

/** The server cannot know the visitor's preference; the inline script fixes it up. */
const getServerSnapshot = (): Theme => DEFAULT_THEME;

const setStoredTheme = (theme: Theme): void => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / storage disabled — the theme still applies for this session.
  }
};

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    setStoredTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export default ThemeProvider;
