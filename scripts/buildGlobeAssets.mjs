/**
 * Build every globe asset both projects ship, from the single source render.
 *
 *   node scripts/buildGlobeAssets.mjs      (or: pnpm globe)
 *
 * Requires ffmpeg on PATH.
 *
 * Source: `assets-source/glob-animatie.mp4` — a 14 MB, 1080×1080 render of one full
 * rotation on a black background. It lives outside `src/` on purpose: it is a *source*
 * asset, never shipped, and nothing imports it.
 *
 * ## Removing the black background
 *
 * By a circular alpha mask, not by colour keying. The continents are very dark green,
 * so keying out black would punch holes straight through Africa. The globe is a perfect
 * circle — measured at centre (539.5, 539.5), radius 527 — so masking on distance from
 * the centre is both exact and safe. The mask carries one pixel of feathering so the rim
 * does not alias.
 *
 * ## Why a sprite sheet rather than an animated WebP
 *
 * The whole frame changes as the globe turns, so there is little inter-frame redundancy
 * to exploit and an alpha channel is expensive. Measured on this clip:
 *
 *   animated WebP  160px 12fps  ->  231 KB
 *   animated WebP  240px 15fps  ->  390 KB
 *   sprite sheet   128px 44fr   ->   55 KB
 *
 * A sprite is one still image, so it compresses like one, and CSS `steps()` gives exact
 * frame timing with a seamless wrap — frame 44 is the same view as frame 0.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DASHBOARD_ROOT = path.join(ROOT, '..', 'dashboard-LN');

const SOURCE = path.join(ROOT, 'assets-source', 'glob-animatie.mp4');

/** The globe's bounding circle inside the 1080×1080 source frame. */
const CROP = 'crop=1054:1054:13:13';

/** Sample every 7th frame: 308 source frames / 7 = 44, i.e. one exact full rotation. */
const SPRITE_STEP = 7;
export const SPRITE_FRAMES = 44;
const SPRITE_FRAME_SIZE = 128;

const STILL_SIZE = 320;
const FAVICON_SIZE = 192;

/** Circular alpha mask for a square frame of `size` px, with a 1 px feathered rim. */
const getAlphaFilter = (size) => {
  const radius = size / 2;
  const centre = radius - 0.5;
  return [
    `scale=${size}:${size}:flags=lanczos`,
    'format=rgba',
    `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip((${radius}-hypot(X-${centre},Y-${centre}))*255,0,255)'`,
  ].join(',');
};

const run = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' });

const report = (label, file) => {
  const kb = Math.round((fs.statSync(file).size / 1024) * 10) / 10;
  console.log(`${label.padEnd(34)} ${String(kb).padStart(7)} KB   ${path.relative(ROOT, file)}`);
};

const buildStill = (target, size, args) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  run([
    '-i',
    SOURCE,
    '-an',
    '-vf',
    `${CROP},${getAlphaFilter(size)}`,
    '-frames:v',
    '1',
    ...args,
    target,
  ]);
  return target;
};

const buildSprite = (target) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  run([
    '-i',
    SOURCE,
    '-an',
    '-vf',
    [
      CROP,
      `select='not(mod(n\\,${SPRITE_STEP}))'`,
      getAlphaFilter(SPRITE_FRAME_SIZE),
      `tile=${SPRITE_FRAMES}x1`,
    ].join(','),
    '-frames:v',
    '1',
    '-c:v',
    'libwebp',
    '-lossless',
    '0',
    '-quality',
    '75',
    target,
  ]);
  return target;
};

if (!fs.existsSync(SOURCE)) {
  console.error(`Source render not found: ${SOURCE}`);
  process.exit(1);
}

console.log('Building globe assets from', path.relative(ROOT, SOURCE), '\n');

// Favicon — first frame, the view with Europe and Africa facing the camera.
const faviconArgs = ['-compression_level', '100'];
report(
  'favicon (landing)',
  buildStill(path.join(ROOT, 'src', 'app', 'icon.png'), FAVICON_SIZE, faviconArgs),
);
report(
  'favicon (dashboard)',
  buildStill(path.join(DASHBOARD_ROOT, 'src', 'app', 'icon.png'), FAVICON_SIZE, faviconArgs),
);

// Still globe — cover fallbacks, and the dashboard sidebar mark.
const stillArgs = ['-c:v', 'libwebp', '-lossless', '0', '-quality', '82'];
report(
  'still globe (landing)',
  buildStill(path.join(ROOT, 'src', 'assets', 'globe.webp'), STILL_SIZE, stillArgs),
);
report(
  'still globe (dashboard)',
  buildStill(path.join(DASHBOARD_ROOT, 'src', 'assets', 'globe.webp'), STILL_SIZE, stillArgs),
);

// Animated globe — loading states.
const spritePath = path.join(ROOT, 'src', 'assets', 'globe-sprite.webp');
report(`sprite (${SPRITE_FRAMES} frames)`, buildSprite(spritePath));
fs.copyFileSync(spritePath, path.join(DASHBOARD_ROOT, 'src', 'assets', 'globe-sprite.webp'));
report('sprite (dashboard copy)', path.join(DASHBOARD_ROOT, 'src', 'assets', 'globe-sprite.webp'));

console.log(
  `\nThe sprite has ${SPRITE_FRAMES} frames — keep GLOBE_SPRITE_FRAMES in @constants/site in sync.`,
);
