/**
 * Post search, matched against titles and nothing else.
 *
 * This replaces the old `searchKeywords` index outright. That index was a bag of words
 * drawn from the *body*, which made every incidental mention a hit — searching "guvern"
 * ranked a post that says the word twice in paragraph nine alongside one that has it in
 * the headline — and it went stale the moment a title was edited, because it only got
 * rebuilt when someone remembered to run the backfill. Reading the live title instead is
 * both more accurate and impossible to desynchronise: there is nothing to reindex.
 *
 * Matching is conjunctive: every word typed has to land somewhere in the title. A looser
 * rule turns a two-word query into an OR and buries the exact match under near-misses.
 *
 * This file exists twice — landing-ln/src/utils/searchByTitle.ts and
 * dashboard-LN/src/utils/searchByTitle.ts — and the two copies have to stay identical.
 * Both sides are meant to rank the same way, so a change to one belongs in the other.
 */

/** Shortest query that runs a search; below it the caller shows nothing. */
export const MIN_QUERY_LENGTH = 2;

/** Combining diacritical marks, built from a string so the source stays ASCII-only. */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;

/**
 * Lowercase, strip diacritics, reduce everything else to single spaces.
 *
 * NFD splits ă â î ș ț into a base letter plus a combining mark, which the mark class
 * then removes — so "Stângăcia" and "stangacia" normalise to the same string and a query
 * typed on a keyboard without diacritics still finds the post. Quotes, dashes and
 * punctuation collapse to spaces for the same reason: nobody types „ ” by hand.
 */
export const getNormalizedTitle = (value: string): string =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(NON_ALPHANUMERIC, ' ')
    .trim();

/** A title, normalised once and kept split so scoring never re-parses it. */
interface TitleIndexEntry {
  text: string;
  words: string[];
}

/**
 * Normalised titles, memoised by their raw string.
 *
 * Normalising is the only per-post allocation in the hot path, and the same few hundred
 * titles are scored on every keystroke, so caching them turns the search into pure
 * comparisons. Keyed by the raw title rather than by post id: an edited title is a
 * different key, so a rename can never serve a stale entry.
 */
const TITLE_CACHE = new Map<string, TitleIndexEntry>();

/** Bounded so a long-lived server process cannot accumulate one entry per title ever seen. */
const TITLE_CACHE_LIMIT = 5000;

const getTitleIndex = (title: string): TitleIndexEntry => {
  const cached = TITLE_CACHE.get(title);
  if (cached) return cached;

  const text = getNormalizedTitle(title);
  const entry: TitleIndexEntry = { text, words: text ? text.split(' ') : [] };

  if (TITLE_CACHE.size >= TITLE_CACHE_LIMIT) TITLE_CACHE.clear();
  TITLE_CACHE.set(title, entry);

  return entry;
};

/** A query, normalised and pre-split once per search rather than once per post. */
interface TitleQuery {
  /** The normalised query as typed, used for the phrase bonuses. */
  text: string;
  /** Its words, longest first — see `getTitleQuery`. */
  tokens: string[];
}

export const getTitleQuery = (raw: string): TitleQuery | null => {
  const trimmed = (raw || '').trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return null;

  const text = getNormalizedTitle(trimmed);
  if (!text) return null;

  // Longest token first. Every token has to match, so testing the most selective one
  // first makes the majority of titles fail on their very first comparison.
  const tokens = text.split(' ').sort((first, second) => second.length - first.length);

  return { text, tokens };
};

/* Scoring weights. The tiers are far enough apart that a better kind of match always
 * outranks a worse one, and the bonuses only decide order inside a tier. */
const SCORE_WHOLE_TITLE = 400;
const SCORE_TITLE_PREFIX = 240;
const SCORE_PHRASE = 140;
const SCORE_EXACT_WORD = 100;
const SCORE_WORD_PREFIX = 70;
const SCORE_INFIX = 34;
const SCORE_FUZZY = 16;

/** Words nearer the front of a title carry more of its meaning. */
const POSITION_BONUS = 12;

/** How much of the matched word the typed token actually covers, 0…this. */
const COVERAGE_BONUS = 20;

/** Below this length a typo correction would match half the archive, so it is not offered. */
const FUZZY_MIN_TOKEN_LENGTH = 4;
const FUZZY_SHORT_TOKEN_LENGTH = 6;
const FUZZY_DISTANCE_PENALTY = 5;

/**
 * Separates the two result tiers.
 *
 * Larger than any score a query can reach, so every literal match sorts above every
 * typo-corrected one no matter how many words the fuzzy result happens to share.
 */
const LITERAL_TIER = 100_000;

/**
 * How many edits turn `token` into `word` — or into any prefix of `word` — giving up as
 * soon as the answer is known to exceed `maxDistance`.
 *
 * Two deliberate departures from textbook Levenshtein, both because of how people
 * actually mistype:
 *
 *  - swapping two neighbouring letters costs one edit, not two. "guvren" for "guvern" is
 *    the commonest typo there is, and at two edits it sat outside any threshold tight
 *    enough to be useful elsewhere;
 *  - the word only has to match from its start. Half a word is a normal thing to type,
 *    and a typo inside half a word is normal too — measured against the whole word,
 *    "guvren" could never reach "guvernul", it fails on length before a letter is read.
 *
 * Three rolling rows instead of the full matrix, plus a per-row minimum that lets a
 * hopeless pair bail after a few columns. This runs against every word of every title
 * that survives the literal pass, so it is the one place worth hand-tuning.
 */
const getBoundedDistance = (token: string, word: string, maxDistance: number): number => {
  const beyond = maxDistance + 1;

  // A word shorter than the token by more than the budget can never be reached. A longer
  // one always can, since only its opening has to match.
  if (word.length + maxDistance < token.length) return beyond;
  if (token === word) return 0;

  let beforePrevious: number[] = [];
  let previous: number[] = [];
  let current: number[] = [];

  for (let column = 0; column <= word.length; column += 1) previous[column] = column;

  for (let row = 1; row <= token.length; row += 1) {
    current[0] = row;
    let rowMinimum = row;

    const code = token.charCodeAt(row - 1);
    const previousCode = row > 1 ? token.charCodeAt(row - 2) : -1;

    for (let column = 1; column <= word.length; column += 1) {
      const wordCode = word.charCodeAt(column - 1);

      let value = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + (code === wordCode ? 0 : 1),
      );

      // The two letters are each other's neighbour, the wrong way round.
      if (
        row > 1 &&
        column > 1 &&
        code === word.charCodeAt(column - 2) &&
        previousCode === wordCode
      ) {
        const transposition = beforePrevious[column - 2] + 1;
        if (transposition < value) value = transposition;
      }

      current[column] = value;
      if (value < rowMinimum) rowMinimum = value;
    }

    if (rowMinimum > maxDistance) return beyond;

    // Rotate the three rows. `current` becomes the oldest one, every cell of which is
    // written before it is read again.
    const spare = beforePrevious;
    beforePrevious = previous;
    previous = current;
    current = spare;
  }

  // The last row holds the cost against every prefix of the word; the cheapest one wins.
  let best = beyond;
  for (let column = 0; column <= word.length; column += 1) {
    if (previous[column] < best) best = previous[column];
  }

  return best;
};

interface TokenMatch {
  score: number;
  isFuzzy: boolean;
}

const getTokenMatch = (entry: TitleIndexEntry, token: string): TokenMatch | null => {
  // Tokens never contain a space, so one `includes` on the whole title rules out an exact,
  // prefix *and* infix match at once — the per-word loop below only ever runs for titles
  // that really do contain the token.
  if (entry.text.includes(token)) {
    let best = 0;

    for (let index = 0; index < entry.words.length; index += 1) {
      const word = entry.words[index];

      let base = 0;
      if (word === token) base = SCORE_EXACT_WORD;
      else if (word.startsWith(token)) base = SCORE_WORD_PREFIX;
      else if (word.includes(token)) base = SCORE_INFIX;
      else continue;

      const score =
        base +
        Math.max(0, POSITION_BONUS - index) +
        Math.round((COVERAGE_BONUS * token.length) / word.length);

      if (score > best) best = score;
    }

    if (best > 0) return { score: best, isFuzzy: false };
  }

  if (token.length < FUZZY_MIN_TOKEN_LENGTH) return null;

  const maxDistance = token.length <= FUZZY_SHORT_TOKEN_LENGTH ? 1 : 2;
  let bestDistance = maxDistance + 1;
  let bestIndex = 0;

  for (let index = 0; index < entry.words.length; index += 1) {
    const distance = getBoundedDistance(token, entry.words[index], maxDistance);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  if (bestDistance > maxDistance) return null;

  return {
    score: Math.max(
      1,
      SCORE_FUZZY - bestDistance * FUZZY_DISTANCE_PENALTY + Math.max(0, POSITION_BONUS - bestIndex),
    ),
    isFuzzy: true,
  };
};

/** How well one title answers the query; 0 when it does not answer it at all. */
const getTitleScore = (title: string, query: TitleQuery): number => {
  const entry = getTitleIndex(title);
  if (!entry.text) return 0;

  let total = 0;
  let isFuzzy = false;

  for (const token of query.tokens) {
    const match = getTokenMatch(entry, token);
    if (!match) return 0;

    total += match.score;
    if (match.isFuzzy) isFuzzy = true;
  }

  // The words can all be present and still be scattered; these reward the query surviving
  // intact, in order, as near the front of the title as possible.
  if (entry.text === query.text) total += SCORE_WHOLE_TITLE;
  else if (entry.text.startsWith(`${query.text} `)) total += SCORE_TITLE_PREFIX;
  else if (entry.text.includes(query.text)) total += SCORE_PHRASE;

  // A short title that is mostly the query answers it better than a long one that merely
  // contains it somewhere.
  total += Math.round((COVERAGE_BONUS * query.text.length) / entry.text.length);

  return isFuzzy ? total : total + LITERAL_TIER;
};

/**
 * Every item whose title matches `rawQuery`, best match first.
 *
 * Nothing is truncated — the callers scroll the list instead, so a broad word still shows
 * everything it found rather than an arbitrary first ten.
 *
 * Equal scores keep the order they came in, and both callers pass their list newest
 * first, so equally good matches read newest first too.
 */
export const searchByTitle = <T extends { title: string }>(
  items: readonly T[],
  rawQuery: string,
): T[] => {
  const query = getTitleQuery(rawQuery);
  if (!query) return [];

  const matches: { item: T; score: number; position: number }[] = [];

  for (let position = 0; position < items.length; position += 1) {
    const item = items[position];
    const score = getTitleScore(item.title, query);
    if (score > 0) matches.push({ item, score, position });
  }

  matches.sort((first, second) =>
    second.score === first.score ? first.position - second.position : second.score - first.score,
  );

  return matches.map((match) => match.item);
};
