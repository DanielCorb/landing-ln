import { spawnSync } from 'node:child_process';

/**
 * `pnpm run deploy` — the landing's counterpart to the dashboard's deploy.
 *
 * **Nothing in this repo goes to Firebase**, and saying so out loud is most of the point
 * of this script existing: the two projects sit side by side, one of them does deploy to
 * Firebase, and "does the landing need it too?" is otherwise a question you have to answer
 * by going and looking. There is no `firebase.json` here, no functions, no rules, no
 * indexes. The site only ever *reads* Firestore, through the Admin SDK and a service
 * account, and reading needs nothing uploaded.
 *
 * Everything Firebase owns for Lumea Nouă lives in `dashboard-LN`, where `pnpm run deploy`
 * ships it — including the Firestore rules that govern what this site is allowed to read.
 *
 * Publishing the site itself does not happen from here either: the host builds and deploys
 * from the git push.
 *
 * So what is left is the build, which is the one check worth running before you push.
 *
 * It has to be `pnpm run deploy`. Bare `pnpm deploy` is pnpm's own built-in command for
 * copying a workspace package into a directory, and the built-in wins over the script.
 */

console.log(
  '\nNimic de încărcat în Firebase din acest proiect.\n' +
    '  Site-ul doar citește din Firestore (Admin SDK + service account) — fără functions,\n' +
    '  fără rules, fără indexes. Tot ce ține de Firebase se deployează din dashboard-LN,\n' +
    '  cu `pnpm run deploy`.\n' +
    '  Publicarea site-ului se face de host, la push.\n\n' +
    '── Build ───────────────────────────────\n',
);

// The shell is required because `pnpm` resolves to a .cmd/.ps1 shim on Windows rather than
// to an executable.
const build = spawnSync('pnpm build', { stdio: 'inherit', shell: true });

if (build.status !== 0) {
  console.error('\n✖ Build-ul a picat.');
  process.exit(build.status ?? 1);
}

console.log('\n✔ Build curat. Nimic de deployat în Firebase din acest proiect.');
