const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const EMPTY_DATE = '—';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "12 iul. 2025" */
export const getFormattedDate = (date: Date | null | undefined): string => {
  if (!date) return EMPTY_DATE;
  return date.toLocaleDateString('ro-RO', SHORT_DATE_OPTIONS);
};

/** "12 iulie 2025" */
export const getLongFormattedDate = (date: Date | null | undefined): string => {
  if (!date) return EMPTY_DATE;
  return date.toLocaleDateString('ro-RO', LONG_DATE_OPTIONS);
};

/** ISO string suitable for a `<time dateTime>` attribute, or undefined. */
export const getIsoDate = (date: Date | null | undefined): string | undefined =>
  date ? date.toISOString() : undefined;

/** "acum 2 ore", "acum 3 zile", falling back to the short date after a week. */
export const getTimeAgo = (date: Date | null | undefined): string => {
  if (!date) return EMPTY_DATE;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / MINUTE_MS);
  const diffHours = Math.floor(diffMs / HOUR_MS);
  const diffDays = Math.floor(diffMs / DAY_MS);

  if (diffMinutes < 1) return 'chiar acum';
  if (diffMinutes < 60) return `acum ${diffMinutes} min`;
  if (diffHours < 24) return `acum ${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}`;
  if (diffDays < 7) return `acum ${diffDays} ${diffDays === 1 ? 'zi' : 'zile'}`;

  return getFormattedDate(date);
};

/**
 * Parse a `yyyy-MM-dd` filter value into a local-time Date pinned to the start or the
 * end of that calendar day.
 *
 * `new Date('2026-07-01')` is parsed as *UTC* midnight, which silently shifts the
 * boundary by the server's offset and made date-range filtering drop posts published
 * on the edge days. Building the date from its parts keeps it in local time.
 */
export const getDayBoundary = (value: string, edge: 'start' | 'end'): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return null;

  if (edge === 'start') date.setHours(0, 0, 0, 0);
  else date.setHours(23, 59, 59, 999);

  return date;
};
