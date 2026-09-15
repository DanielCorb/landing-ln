import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `prebuild` — refuse to build on a configuration that cannot work.
 *
 * Every failure this catches is one that is otherwise **silent in production**: a missing
 * SMTP password means welcome emails quietly become no-ops, and a `NEWSLETTER_SECRET` that
 * does not match the one in the Cloud Functions means every newsletter is rejected with a
 * 401 that nobody sees unless they go reading logs. The site keeps serving pages either
 * way, which is exactly what makes those mistakes expensive — they are discovered weeks
 * later, by a reader who never got the issue.
 *
 * Two severities. **Errors** stop the build: the configuration is contradictory, or a
 * value is a leftover placeholder. **Warnings** let it through: the feature is switched
 * off, which is a legitimate state locally and in a preview.
 *
 * A third case sits between them, and where it lands depends on who is building. A
 * half-configured mailbox — host set, password missing — is fatal on Vercel, because that
 * build becomes the live site and every email it tries to send will fail. Locally it is
 * only a warning: this build ships nowhere (Vercel builds from the git push, not from your
 * machine), so refusing to compile would cost you a check and protect nothing. `ciOnly`
 * marks those.
 *
 * Cross-repo checks only run on a machine that has both projects side by side. On Vercel
 * the dashboard's files are not there, so those checks are skipped rather than guessed at.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DASHBOARD = resolve(ROOT, '..', 'dashboard-LN');

/**
 * Hourly send cap of the mailbox, per domain.
 *
 * Not read from anywhere — it is a property of the hosting plan, not of this repo. It
 * exists here so a batch size that would be silently refused by the mail server is caught
 * before the first issue goes out instead of after.
 */
const MAILBOX_HOURLY_CAP = 50;

/**
 * Values that mean "nobody filled this in yet".
 *
 * `pune_aici` is here because the env files handed over for the Vercel and Netlify import
 * screens carry that marker where a value could not be generated. Imported verbatim it
 * looks perfectly set — the build passes, and every SMTP login then fails with a password
 * that is a sentence. Catching the marker turns a silent runtime failure into a refused
 * build, which is the entire point of this script.
 */
const PLACEHOLDERS = [
  'change_me',
  'your_',
  'your-domain',
  'test-newsletter-secret',
  'lumea-noua-secret',
  'example.com',
  'serverNNN',
  'pune_aici',
];

const CI_VARIABLES = ['CI', 'VERCEL', 'NETLIFY', 'GITHUB_ACTIONS'];

/** True when this build is the one that becomes the live site. */
const IS_CI = CI_VARIABLES.some((name) => Boolean(process.env[name]));

const errors = [];
const warnings = [];

const addError = (message) => errors.push(message);
const addWarning = (message) => warnings.push(message);

/**
 * Fatal where the build ships, advisory where it does not.
 *
 * For things that break at *runtime* rather than at build time: on Vercel the result is a
 * live site that silently fails, which is worth refusing; on a laptop it is a build nobody
 * will deploy, so a loud warning is the honest response.
 */
const addShippingIssue = (message) =>
  IS_CI
    ? addError(message)
    : addWarning(`${message}\n   (doar avertisment local — pe Vercel oprește buildul)`);

/** Parse a .env file into a plain object. Quotes stripped, comments and blanks ignored. */
const getFileEnv = (path) => {
  if (!existsSync(path)) return null;

  const result = {};

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const value = match[2].trim();
    const unquoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
        ? value.slice(1, -1)
        : value;

    result[match[1]] = unquoted;
  }

  return result;
};

const fileEnv = getFileEnv(resolve(ROOT, '.env')) ?? {};

/**
 * A variable's effective value.
 *
 * The real process environment wins: on Vercel there is no `.env` at all and everything
 * arrives that way, while locally Next.js loads the file into the same place. Checking
 * both means one script covers both situations.
 */
const get = (name) => {
  const value = process.env[name] ?? fileEnv[name];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const getIsPlaceholder = (value) =>
  PLACEHOLDERS.some((needle) => value.toLowerCase().includes(needle));

const requireVars = (names, why) => {
  for (const name of names) {
    const value = get(name);
    if (!value) addError(`${name} lipsește — ${why}`);
    else if (getIsPlaceholder(value)) addError(`${name} încă are o valoare de exemplu (${value})`);
  }
};

const getPositiveInt = (name) => {
  const raw = get(name);
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    addError(`${name} trebuie să fie un întreg pozitiv, nu "${raw}"`);
    return null;
  }

  return value;
};

// ── Ce nu poate lipsi ────────────────────────────────────────────────────────
requireVars(['NEXT_PUBLIC_BASE_URL'], 'linkurile din emailuri ar duce în gol');
requireVars(
  ['FIREBASE_ADMIN_PROJECT_ID', 'FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_ADMIN_PRIVATE_KEY'],
  'site-ul nu poate citi din Firestore',
);

const baseUrl = get('NEXT_PUBLIC_BASE_URL');
if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
  addError(`NEXT_PUBLIC_BASE_URL trebuie să înceapă cu http:// sau https:// (acum: ${baseUrl})`);
}

// ── SMTP: sau tot grupul, sau niciunul ───────────────────────────────────────
const smtpHost = get('SMTP_HOST');

if (!smtpHost) {
  addWarning(
    'SMTP_HOST e gol — trimiterea e dezactivată și fiecare email devine un no-op logat. ' +
      'Intenționat în local; în producție înseamnă că nu pleacă nimic.',
  );
} else {
  const missing = ['SMTP_USER', 'SMTP_PASSWORD'].filter((name) => !get(name));

  if (missing.length > 0) {
    addShippingIssue(
      `SMTP_HOST e setat (${smtpHost}) dar ${missing.join(' și ')} ${
        missing.length > 1 ? 'lipsesc' : 'lipsește'
      } — conexiunea va fi refuzată la fiecare trimitere. Completează, sau golește ` +
        'SMTP_HOST ca să dezactivezi trimiterea explicit.',
    );
  }

  const password = get('SMTP_PASSWORD');
  if (password && getIsPlaceholder(password)) {
    addShippingIssue('SMTP_PASSWORD încă are valoarea de exemplu');
  }

  const user = get('SMTP_USER');
  if (user && !user.includes('@')) {
    addWarning(
      `SMTP_USER e "${user}" — mailboxurile cPanel cer adresa completă, nu doar partea ` +
        'dinaintea lui @',
    );
  }

  if (!get('NEWSLETTER_FROM_EMAIL')) {
    addWarning(
      'NEWSLETTER_FROM_EMAIL lipsește — expeditorul cade pe SMTP_USER, care merge, dar ' +
        'cititorii văd adresa brută în loc de „Lumea Nouă <…>"',
    );
  }
}

// ── Eșalonarea ───────────────────────────────────────────────────────────────
const batchSize = getPositiveInt('NEWSLETTER_BATCH_SIZE');
getPositiveInt('NEWSLETTER_BATCH_INTERVAL_MINUTES');
getPositiveInt('NEWSLETTER_SEND_CONCURRENCY');

if (batchSize && batchSize >= MAILBOX_HOURLY_CAP) {
  addError(
    `NEWSLETTER_BATCH_SIZE este ${batchSize}, iar mailboxul acceptă ${MAILBOX_HOURLY_CAP} pe ` +
      'oră pe domeniu — plafon împărțit cu emailurile de bun venit și cu notificările de ' +
      'contact. Coboară-l (40 e valoarea de referință) sau abonații de la coadă vor fi ' +
      'refuzați fără ca cineva să afle.',
  );
}

// ── Secretele ────────────────────────────────────────────────────────────────
for (const name of ['NEWSLETTER_SECRET', 'REVALIDATE_SECRET']) {
  const value = get(name);

  if (!value) {
    addWarning(
      name === 'NEWSLETTER_SECRET'
        ? 'NEWSLETTER_SECRET lipsește — linkurile de dezabonare nu se pot semna și blasturile ' +
            'răspund 503'
        : 'REVALIDATE_SECRET lipsește — site-ul nu se mai împrospătează după o publicare',
    );
  } else if (getIsPlaceholder(value)) {
    addError(`${name} încă are o valoare de test — oricine o poate ghici`);
  }
}

// ── Potrivirea cu celălalt proiect ───────────────────────────────────────────
const compare = (name, otherPath, label) => {
  const other = getFileEnv(otherPath);
  if (!other) return;

  const mine = get(name);
  const theirs = other[name]?.trim();

  if (!mine || !theirs) return;

  if (mine !== theirs) {
    addError(
      `${name} diferă între acest proiect și ${label} — apelul va fi respins cu 401. ` +
        'Pune aceeași valoare în ambele, plus în panourile de hosting.',
    );
  }
};

if (existsSync(DASHBOARD)) {
  compare('NEWSLETTER_SECRET', resolve(DASHBOARD, 'src', 'functions', '.env'), 'functions/.env');
  compare('REVALIDATE_SECRET', resolve(DASHBOARD, '.env'), 'dashboard-LN/.env');
} else {
  console.log('· dashboard-LN nu e alături — sar peste verificarea secretelor comune.');
}

// ── Raport ───────────────────────────────────────────────────────────────────
for (const warning of warnings) console.warn(`⚠  ${warning}`);
for (const error of errors) console.error(`✖  ${error}`);

if (errors.length > 0) {
  console.error(
    `\n${errors.length} ${errors.length === 1 ? 'problemă' : 'probleme'} de configurare. ` +
      'Buildul s-a oprit — vezi .env.example pentru ce înseamnă fiecare variabilă.\n',
  );
  process.exit(1);
}

console.log(
  warnings.length > 0
    ? `✔ Configurație validă, cu ${warnings.length} ${warnings.length === 1 ? 'avertisment' : 'avertismente'}.`
    : '✔ Configurație validă.',
);
