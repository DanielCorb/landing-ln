import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK — Server Components, Route Handlers and Server Actions only.
 *
 * Reads bypass Firestore security rules, which require an authenticated user that the
 * public site does not have. Requires the FIREBASE_ADMIN_* environment variables.
 *
 * This module initialises at import time, so a missing or malformed credential does not
 * surface as a runtime 500 — it fails the build during "Collecting page data", on whichever
 * route imports it first. Firebase's own messages for those cases (`Service account object
 * must contain a string "project_id" property`, `DECODER routines::unsupported`) name
 * neither the environment variable nor the deployment setting behind them, so both are
 * translated below.
 */

const REQUIRED_VARIABLES = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
] as const;

const SURROUNDING_QUOTES = /^["']|["']$/g;

const PEM_HEADER = '-----BEGIN PRIVATE KEY-----';

/**
 * Normalise the private key into real PEM.
 *
 * Two things go wrong depending on where the value was pasted, and both produce the same
 * opaque `DECODER routines::unsupported`:
 *
 *   - **Quotes.** In `.env` the wrapping quotes are dotenv syntax and get stripped on load.
 *     A dashboard field (Vercel, Netlify) stores the value literally, so copying the line
 *     across carries the quotes into the key and the PEM parser chokes on the leading `"`.
 *   - **Newlines.** A one-line value keeps `\n` as two characters; a multi-line paste
 *     already has real newlines. Unescaping handles the first and is a no-op on the second.
 *
 * Order matters: trim, then unquote, then unescape.
 */
const getPrivateKey = (): string =>
  (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '')
    .trim()
    .replace(SURROUNDING_QUOTES, '')
    .replace(/\\n/g, '\n');

const getServiceAccount = (): ServiceAccount => {
  const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Firebase Admin nu este configurat — lipsesc: ${missing.join(', ')}.\n` +
        'Pe Vercel variabilele sunt separate pe medii (Production / Preview / Development): ' +
        'una adăugată doar la Production lipsește din build-urile de Preview ale altor ' +
        'branch-uri. Verifică Settings > Environment Variables și bifează toate mediile.',
    );
  }

  const privateKey = getPrivateKey();

  if (!privateKey.startsWith(PEM_HEADER)) {
    throw new Error(
      'FIREBASE_ADMIN_PRIVATE_KEY nu arată a cheie PEM validă — trebuie să înceapă cu ' +
        `"${PEM_HEADER}".\nCel mai des: valoarea a fost lipită în panoul de deployment ` +
        'împreună cu ghilimelele din .env. Acolo ghilimelele nu se elimină automat, ci intră ' +
        'în cheie. Lipește conținutul fără ghilimele, păstrând \\n-urile ca atare.',
    );
  }

  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  };
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(getServiceAccount()) });

export const adminDb = getFirestore(app);
