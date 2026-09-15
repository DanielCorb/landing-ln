/**
 * Build the web fonts the site ships: subset the Poppins TTFs and emit WOFF2.
 *
 *   node scripts/buildFonts.mjs
 *
 * Two separate wins, both large:
 *
 * 1. **Subsetting.** Poppins ships with a full Devanagari glyph set alongside Latin.
 *    A Romanian publication needs none of it, and it is the bulk of every file.
 * 2. **WOFF2.** TTF is uncompressed; WOFF2 is the same outlines with Brotli-class
 *    compression built into the format.
 *
 * Together these took the five faces from 428 KB over the wire to 54 KB, which matters
 * because fonts were the single heaviest resource category on the site — heavier than
 * all the JavaScript combined.
 *
 * The kept range is deliberately wider than "the characters currently on the site":
 * post content is written by editors and must not fall back to a system font because
 * someone pasted a French quote or an em dash.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const FONT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'assets',
  'fonts',
);

/** Faces referenced by src/app/layout.tsx. Keep the two lists in sync. */
const FACES = [
  'Poppins-Regular',
  'Poppins-Italic',
  'Poppins-Medium',
  'Poppins-SemiBold',
  'Poppins-Bold',
];

/**
 * Unicode ranges to keep.
 *
 * Latin through Latin Extended-B covers Romanian in full — ă (U+0103) and â/î sit in
 * Latin-1/Extended-A, while ș (U+0219) and ț (U+021B) are in Extended-B, which is
 * exactly why the range does not stop at U+017F.
 */
const KEPT_RANGES = [
  [0x0020, 0x024f], // Latin, Latin-1 Supplement, Latin Extended-A and -B
  [0x02b0, 0x02ff], // Spacing modifier letters
  [0x2000, 0x206f], // General punctuation: – — ' ' " " … •
  [0x20a0, 0x20bf], // Currency symbols, incl. €
  [0x2122, 0x2122], // ™
  [0x2190, 0x21ff], // Arrows — → is used in the "Vezi toate →" links
  [0x2212, 0x2212], // Minus sign
];

const getKeptCharacters = () => {
  let characters = '';
  for (const [start, end] of KEPT_RANGES) {
    for (let code = start; code <= end; code += 1) characters += String.fromCodePoint(code);
  }
  return characters;
};

/**
 * The dashboard uses the exact same five faces, so it gets the exact same files rather
 * than its own copy of the pipeline. Its TTF sources are not kept — this is the only
 * place fonts are built.
 */
const DASHBOARD_FONT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'dashboard-LN',
  'src',
  'assets',
  'fonts',
);

const text = getKeptCharacters();
let totalBefore = 0;
let totalAfter = 0;

fs.mkdirSync(DASHBOARD_FONT_DIR, { recursive: true });

for (const face of FACES) {
  const source = path.join(FONT_DIR, `${face}.ttf`);
  const target = path.join(FONT_DIR, `${face}.woff2`);

  if (!fs.existsSync(source)) {
    console.warn(`skip ${face}: ${source} not found`);
    continue;
  }

  const input = fs.readFileSync(source);
  const output = await subsetFont(input, text, { targetFormat: 'woff2' });
  fs.writeFileSync(target, output);
  fs.writeFileSync(path.join(DASHBOARD_FONT_DIR, `${face}.woff2`), output);

  totalBefore += input.length;
  totalAfter += output.length;

  const saved = Math.round((1 - output.length / input.length) * 100);
  console.log(
    `${face.padEnd(20)} ${String(Math.round(input.length / 1024)).padStart(4)} KB -> ` +
      `${String(Math.round(output.length / 1024)).padStart(3)} KB  (-${saved}%)`,
  );
}

console.log(
  `\nTOTAL                ${Math.round(totalBefore / 1024)} KB -> ${Math.round(totalAfter / 1024)} KB`,
);
console.log('Written to landing-ln and dashboard-LN.');
