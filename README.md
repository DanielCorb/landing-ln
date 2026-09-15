# Lumea Nouă — site public (`landing-ln`)    

Site-ul public al publicației online **Lumea Nouă**. Aici ajung cititorii: citesc postările,
navighează prin rubrici, caută, se abonează la newsletter și trimit mesaje prin formularul
de contact.

Nu are panou de administrare și nu are autentificare. Tot conținutul vine din Firestore,
scris de [`dashboard-LN`](../dashboard-LN) — cele două proiecte împart aceeași bază de date.

---

## Vocabularul proiectului

Distincția asta e importantă și se regăsește peste tot în cod:

| Termen | Ce înseamnă |
| --- | --- |
| **postare** (`Post`) | Unitatea de conținut. Ce se scrie, se editează, se programează și se publică. |
| **rubrică** (`Rubrica`) | Secțiunea în care e încadrată o postare. Sunt exact trei, fixe. |

Cele trei rubrici sunt:

- `articole` — Articole
- `traduceri` — Traduceri
- `contributiile-cititorilor` — Contribuțiile Cititorilor

**„Articole" este o rubrică, nu un sinonim pentru „postare".** Orice funcționalitate legată
de postări (afișare, filtrare, sortare, căutare, SEO) se aplică identic tuturor celor trei
rubrici.

De aceea ruta publică a unei postări este `/postare/<slug>`, indiferent de rubrică. Vechea
rută `/articol/<slug>` face redirect permanent (308) către noua rută, ca linkurile existente
și indexarea Google să nu se piardă — vezi [`next.config.ts`](next.config.ts).

> **Notă:** colecția din Firestore se numește în continuare `articles`. Numele fizic a fost
> păstrat pentru că redenumirea ar însemna migrarea datelor de producție. În cod se accesează
> prin constanta `POSTS_COLLECTION`.

---

## Stack

- **Next.js 16** (App Router, React 19, Server Components)
- **TypeScript** strict
- **Tailwind CSS 3.4**, cu design tokens în variabile CSS
- **Firebase Admin SDK** pentru citirea din Firestore (server-side)
- **Nodemailer** peste SMTP-ul domeniului (mailbox cPanel) pentru newsletter și pentru
  notificarea de la formularul de contact
- **Swiper** pentru caruselele de postări, **react-day-picker** pentru filtrul de perioadă

---

## Cum funcționează

### Fluxul datelor

```
dashboard-LN  ──scrie──►  Firestore  ──citește──►  landing-ln  ──►  cititor
     │                    (articles,                   ▲
     │                     settings/general)           │
     └──────── POST /api/revalidate ───────────────────┘
               (invalidează cache-ul după publicare)
```

Toate citirile se fac **exclusiv pe server**, prin Admin SDK
([`src/lib/firebase/admin.ts`](src/lib/firebase/admin.ts)). Browserul nu vorbește niciodată
direct cu Firestore — regulile de securitate cer un utilizator autentificat, iar site-ul
public nu are așa ceva.

### Cache-uirea citirilor

Firestore e interogat cu un singur `where` (fără indecși compuși), iar filtrarea, sortarea și
paginarea se fac în memorie. Ca să nu coste, întregul set de postări publicate se aduce **o
singură dată per request**, prin `cache()` din React:

```ts
// src/lib/firestore/posts.ts
export const getAllPublishedPosts = cache(async (): Promise<Post[]> => { … });
```

Pagina principală citește hero-ul, carusela „Ultimele publicații" și câte o secțiune pentru
două rubrici — toate din același rezultat memoizat.

### ISR și actualizarea instant

Paginile bazate pe postări au `export const revalidate = 300` (5 minute). În plus,
dashboard-ul apelează `POST /api/revalidate` imediat după orice modificare a unei postări, cu
rutele afectate:

```jsonc
{ "secret": "…", "paths": ["/", "/arhiva", "/rubrica/articole", "/postare/slug-ul-postarii"] }
```

Ruta invalidează acele căi **și** layout-ul rădăcină, așa că o postare nou publicată apare pe
home aproape instant, nu după expirarea ferestrei ISR. Fereastra de 5 minute rămâne doar ca
plasă de siguranță, dacă webhook-ul nu ajunge.

Secretul din `REVALIDATE_SECRET` trebuie să fie identic în ambele proiecte.

### Rutele

| Rută | Ce face |
| --- | --- |
| `/` | Hero cu ultima postare, newsletter, carusel „Ultimele publicații", câte o secțiune pentru fiecare din cele trei rubrici |
| `/arhiva` | Cele trei rubrici + toate postările, cu filtrare pe perioadă, sortare și scroll infinit |
| `/rubrica/[slug]` | Postările dintr-o rubrică, cu aceleași filtre + paginare |
| `/postare/[slug]` | O postare: cover, lead, corp, note de subsol, CTA donații, postări înrudite |
| `/despre-noi` | Conținut editat din dashboard (`settings.aboutPageContent`) |
| `/contact` | Canalele de contact + formular |
| `/politica-de-confidentialitate` | Singura pagină legală: confidențialitate + cookie-uri, într-un document. `/gdpr` și `/cookies` redirectează aici (vezi [`next.config.ts`](next.config.ts)) |
| `/dezabonare` | Confirmarea dezabonării de la newsletter, dintr-un link semnat |
| `/api/search` | Căutare în postări, folosită de overlay-ul din header |
| `/api/contact` | Primește formularul de contact |
| `/api/newsletter/notify` | Trimite **o tranșă** din anunțul unei postări noi; apelat de `notifyNewPost` pentru prima și de `resumeNewsletter` pentru restul |
| `/api/newsletter/unsubscribe` | Dezabonare one-click, în spatele headerului `List-Unsubscribe` |
| `/api/revalidate` | Webhook de invalidare a cache-ului, apelat de dashboard |

### Căutarea

Se caută **doar în titlu**, direct în titlul curent al postării. Nu mai există niciun index
de cuvinte cheie în Firestore: nu se reindexează nimic, iar o redenumire se vede imediat.

Cum funcționează, în [`src/utils/searchByTitle.ts`](src/utils/searchByTitle.ts):

- se pornește de la **2 litere**;
- interogarea și titlurile se normalizează la fel (minuscule, fără diacritice — „Stângăcia”
  și „stangacia” sunt același lucru), iar semnele de punctuație devin spații;
- **toate** cuvintele tastate trebuie să apară în titlu, altfel postarea nu e rezultat;
- ordinea rezultatelor: titlu identic → titlu care începe cu interogarea → interogarea
  apare ca atare în titlu → cuvânt exact → început de cuvânt → în interiorul unui cuvânt;
- greșelile de tastare sunt prinse cu distanță Levenshtein (doar de la 4 litere în sus) și
  ajung **întotdeauna** sub rezultatele potrivite literal;
- se întorc toate rezultatele, nu primele N — overlay-ul are propriul scroll.

Fișierul este duplicat identic în `dashboard-LN/src/utils/searchByTitle.ts`, ca listele din
dashboard să ordoneze la fel. Dacă îl modifici aici, copiază-l și acolo.

### Formularul de contact

Mesajul se salvează **întâi** în Firestore (colecția `Contacts`, de unde îl citește
dashboard-ul), iar emailul este o notificare peste asta. Dacă mesajul s-a salvat, vizitatorul
primește confirmare chiar dacă providerul de email refuză trimiterea — altfel oamenii
retrimit mesaje care ajunseseră deja.

Notificarea pleacă pe același releu SMTP ca newsletterul și ajunge la adresa din Setări >
„Email notificări" (sau, dacă e goală, la `NEWSLETTER_ADMIN_EMAIL`). Adresa
vizitatorului stă în `Reply-To`, nu în `From` — un `From` cu domeniul altcuiva e o
falsificare pe care serverul SMTP refuză să o retransmită, iar SPF ar pica-o oricum.

### Newsletter

Trei fluxuri, toate peste SMTP-ul domeniului:

| Când | Ce se trimite | De unde pleacă |
| --- | --- | --- |
| Cineva se abonează | Email de bun venit către cititor + notificare către redacție | [`src/app/actions/newsletter.ts`](src/app/actions/newsletter.ts) |
| O postare devine `published` prima oară | Anunțul cu postarea, către toți abonații activi | [`src/app/api/newsletter/notify/route.ts`](src/app/api/newsletter/notify/route.ts) |
| Cineva se dezabonează | Notificare către redacție | [`src/app/api/newsletter/unsubscribe/route.ts`](src/app/api/newsletter/unsubscribe/route.ts) |

Declanșatorul pentru postări noi este funcția `notifyNewPost` din dashboard, un trigger
Firestore — o postare ajunge `published` pe două căi (publicare manuală și jobul
`scheduledPublish`), iar un trigger pe document le vede pe amândouă. Câmpul
`newsletterSentAt` garantează că o editare ulterioară nu retrimite.

#### Eșalonarea pe ore

Mailboxul acceptă **50 de mesaje pe oră pe domeniu**, iar plafonul e împărțit cu emailurile
de bun venit și cu notificările de contact. Peste el serverul nu pune la coadă, ci refuză —
așa că un anunț nu pleacă dintr-o bucată, ci în tranșe:

1. `notifyNewPost` marchează postarea (`newsletterSentAt`, `newsletterDone: false`) și cere
   prima tranșă de la [`/api/newsletter/notify`](src/app/api/newsletter/notify/route.ts);
2. endpointul trimite `NEWSLETTER_BATCH_SIZE` abonați și scrie unde a rămas
   (`newsletterCursor`) plus totalurile;
3. `resumeNewsletter` rulează la fiecare 15 minute, caută postările cu
   `newsletterDone == false` și cere tranșa următoare;
4. endpointul răspunde **425** dacă n-a trecut încă intervalul, așa că pauza e respectată
   indiferent cât de des întreabă cineva;
5. când lista se termină, `newsletterDone` devine `true` și postarea iese din căutare.

Pauza e impusă de endpoint, nu de cadența programatorului, pentru că plafonul e o fereastră
glisantă: 40 de mesaje la 10:50 și încă 40 la 11:05 înseamnă 80 într-un sfert de oră, iar a
doua tranșă ar fi refuzată.

Cursorul e **id-ul documentului** ultimului abonat servit, nu un offset: id-urile din
`subscribers` sunt chiar adresele, deci ordonarea e stabilă, iar cine se abonează în timpul
unui blast se așază alfabetic și intră în tranșele următoare dacă e după cursor.

Șabloanele sunt în [`src/lib/email/templates/`](src/lib/email/templates), scrise cu tabele
și CSS inline pentru că Outlook randează mailul prin motorul HTML al Word-ului.

Linkul de dezabonare e semnat HMAC, nu stocat: se poate recalcula oricând și nu expiră.
Clickul duce la o pagină de confirmare și **nu** dezabonează singur — scannerele de
securitate accesează URL-urile din mesaje înainte ca omul să le deschidă. Dezabonarea
instant din clientul de email merge separat, prin headerele `List-Unsubscribe`.

### Tema light/dark

Un script inline blocant din `<head>` pune clasa `dark` pe `<html>` înainte de primul paint,
citind `localStorage['ln-theme']`. `ThemeProvider` doar preia starea aceea — **nu** blochează
randarea copiilor. (Într-o versiune anterioară returna `null` până la montare, ceea ce însemna
că serverul trimitea un `<body>` gol și tot site-ul aștepta bundle-ul JS ca să afișeze ceva.)

---

## Structura folderelor

Convenția e aceeași ca în dashboard.

```
src/
├── app/          rutare Next.js — fișiere subțiri: metadata, params, randează un view
│   ├── actions/  Server Actions
│   └── api/      Route Handlers
├── assets/       imagini, fonturi
├── components/
│   ├── common/   componente reutilizate în 2+ locuri
│   ├── icons/    setul de iconițe vectoriale (social, search, Ko-fi, glob, rubrici)
│   └── layout/   Header, Footer, ThemeProvider
├── constants/    valori partajate, UPPER_SNAKE_CASE
├── hooks/        hook-uri globale (.tsx), prefixate cu `use`
├── lib/          clienți și implementări de acces la date (Firebase, SEO)
├── models/       interfețe și tipuri partajate
├── style/        CSS global
├── utils/        funcții utilitare (.ts), prefixate cu `get`/`set`
└── views/        corpul fiecărei pagini
```

### Reguli de cod

- **Importuri absolute**, prin alias: `@components/…`, `@models/…`, `@utils/…`, `@lib/…`,
  `@constants/…`, `@hooks/…`, `@views/…`, `@style/…`, `@assets/…`. Niciun `../..`.
- Importurile sunt **grupate și comentate**, în ordinea: third-party → constants → models →
  utils → lib → hooks → components → style.
- Componentele sunt **arrow functions tipate cu `FC<Props>`**, cu `export default` la finalul
  fișierului.
- Valorile statice (obiecte de config, hărți de clase, liste de opțiuni) stau **în afara**
  componentei; cele derivate din props/state se memoizează cu `useMemo`/`useCallback` acolo
  unde identitatea chiar contează.
- Clasele condiționale trec prin `getClassNames()` din
  [`@utils/getClassNames`](src/utils/getClassNames.ts), nu prin ternare inline în `className`.
- Fără `any`. `unknown` doar la granițe reale (JSON extern), imediat îngustat.
- Utilitarele încep cu `get` (întorc o valoare) sau `set` (efect secundar, `void`).
- Formatarea se face cu Prettier, folosind [`.prettierrc`](.prettierrc) din rădăcină.

---

## Setup

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
pnpm dev
```

Variabilele de mediu sunt documentate în [`.env.example`](.env.example). Minimul ca să
pornească: credențialele Firebase Admin. Fără `SMTP_HOST` orice trimitere de email devine
un no-op logat — formularul de contact tot salvează mesajele în Firestore și abonările tot
se înregistrează, doar că nu pleacă niciun email.

| Comandă | Ce face |
| --- | --- |
| `pnpm dev` | server de development pe `:3000` |
| `pnpm build` | build de producție |
| `pnpm run deploy` | confirmă că nu e nimic de încărcat în Firebase, apoi build |
| `pnpm start` | rulează build-ul |
| `pnpm lint` | ESLint |

### Deploy

**Din acest proiect nu pleacă nimic către Firebase.** Site-ul doar *citește* din Firestore,
prin Admin SDK și un service account, iar cititul nu cere nimic încărcat: nu există
`firebase.json`, functions, rules sau indexes aici. Tot ce ține de Firebase — inclusiv
regulile care decid ce are voie site-ul ăsta să citească — stă în `dashboard-LN` și se
trimite de acolo cu `pnpm run deploy`.

Publicarea site-ului nu se face nici ea de aici: hostul construiește și publică la push.

Rămâne build-ul, singura verificare care merită rulată înainte de push, și pe care
`pnpm run deploy` o face — scriptul există ca să nu fie nevoie să verifici de fiecare dată
dacă proiectul ăsta avea sau nu ceva de deployat.

---

## Performanță

Deciziile de mai jos sunt luate pe baza unor măsurători Lighthouse, nu din intuiție. E bine
să nu fie anulate din greșeală.

### Ce s-a schimbat și de ce

**Assets**

- **Toate iconițele sunt vectori scriși de mână**
  ([`src/components/icons`](src/components/icons)). Înainte, „SVG"-urile pentru search și
  rețelele sociale erau de fapt PNG-uri base64 de ~130–470 KB fiecare, încărcate pe fiecare
  pagină și afișate la 32 px. Peste 1,2 MB doar din iconițe.
- **Favicon-ul** era un vector auto-trasat, cu 556 de path-uri: 262 KB, descărcat de două ori
  pe fiecare pagină. Acum e globul, redat din sursă la 192 px — **23,7 KB**, o dată.
- **Globul animat e un sprite sheet, nu un video și nici un WebP animat.** Vezi mai jos.

**Fonturi** — erau categoria cea mai grea de pe site, mai grea decât tot JavaScript-ul.

- Doar 5 tăieturi Poppins (400, 400 italic, 500, 600, 700) în loc de 18. `next/font/local`
  face preload pentru fiecare tăietură declarată.
- **WOFF2 subsetat pe alfabetul latin** în loc de TTF integral: Poppins vine cu un set complet
  de glife Devanagari, inutile aici. 428 KB → **54 KB**. Regenerare: `pnpm fonts`
  ([`scripts/buildFonts.mjs`](scripts/buildFonts.mjs)).
- `adjustFontFallback: 'Arial'` generează un fallback cu metrici potrivite, ca schimbul de
  font să nu miște layout-ul.

**JavaScript**

- **Fără Swiper.** Caruselele folosesc scroll-snap nativ
  ([`ScrollRow`](src/components/common/ScrollRow.tsx)) — 81 KB de JS mai puțin, pentru
  componente aflate sub fold, plus momentum real la scroll pe touch.
- **Calendarul se încarcă la cerere.** `react-day-picker` aduce un stylesheet de 38 KB care
  se aplica după primul paint și producea singur **0,25 CLS** pe arhivă și pe paginile de
  rubrică. Acum e `next/dynamic`, încărcat la primul click pe filtru.
- Cardurile de postare și linkurile legale au `prefetch={false}`. Next preîncărca payload-ul
  RSC al fiecărui card din viewport — circa 540 KB de descărcări speculative pe home.

**Layout**

- **Fără `loading.tsx` la nivel de rută.** Un `loading.tsx` învelește pagina într-un Suspense
  boundary; pe paginile statice asta transforma un paint instant în unul condiționat de
  hidratare (**+2,8 s Speed Index**), iar pe rutele dinamice overlay-ul care dispărea producea
  **0,25 CLS**. Animația globului rămâne acolo unde nu strică — la încărcarea paginilor
  următoare din arhivă și în dashboard.
- Hero-ul de pe home e **un singur nod DOM** cu clase responsive. Două variante (una pentru
  mobil, una pentru desktop) ar pune imaginea de copertă de două ori în document, iar
  browserele descarcă imaginile chiar și dintr-un subarbore `display:none`.
- Imaginile aflate deasupra fold-ului se încarcă **eager**; restul, lazy. Un element LCP
  încărcat lazy e prin definiție unul târziu.

### Globul

Toate aparițiile globului — favicon, coperți lipsă, stări de încărcare, plus logo-ul din
sidebar-ul dashboard-ului — sunt generate dintr-un singur fișier sursă:
`assets-source/glob-animatie.mp4`, un render 1080×1080 al unei rotații complete, pe fundal
negru. Fișierul stă **în afara** lui `src/`: e sursă, nu se livrează niciodată, nimic nu-l
importă.

```bash
pnpm globe
```

([`scripts/buildGlobeAssets.mjs`](scripts/buildGlobeAssets.mjs), necesită `ffmpeg` în PATH.)

**Fundalul negru** se elimină cu o mască alfa circulară, nu prin color key. Continentele
sunt verde foarte închis, deci un key pe negru ar găuri Africa. Globul e un cerc perfect —
centru (539,5, 539,5), rază 527 — așa că masca pe distanța față de centru e și exactă, și
sigură.

**Animația e un sprite sheet** de 44 de cadre puse cap la cap într-o singură imagine, jucat
cu `steps()`. Motivul e dimensiunea: la o rotație, tot cadrul se schimbă, deci nu există
redundanță între cadre de exploatat, iar canalul alfa e scump. Măsurat pe acest clip:

| Format | Dimensiune |
| --- | --- |
| WebP animat, 240 px, 15 fps | 390 KB |
| WebP animat, 160 px, 12 fps | 231 KB |
| **sprite sheet, 128 px, 44 cadre** | **55 KB** |

Un sprite e o singură imagine statică, deci se comprimă ca atare. Fâșia are `44 × 100%`
lățime într-un pătrat care o decupează, așa că `translateX(-100%)` parcurge exact toate
cadrele și `steps(44)` cade fix pe câte unul. Ultimul cadru e la un pas de rotația completă,
deci revenirea la cadrul 0 e un pas ca oricare altul — bucla nu are tăietură.

Numărul de cadre e în `GLOBE_SPRITE_FRAMES` ([`@constants/site`](src/constants/site.ts)) și
trebuie să rămână identic cu `SPRITE_FRAMES` din script.

**Despre tempo.** Rotația durează 2,6 s, nu mai mult. Aproximativ o cincime din tur e Pacific
deschis, aproape fără uscat, deci în cadrele alea nu se mișcă nimic vizibil. La un ciclu lent
porțiunea aia ține aproape o secundă și se citește ca „animația se blochează și o ia de la
capăt". La 2,6 s scade sub o jumătate de secundă și ochiul o percepe ca mișcare continuă.
Dacă mărești durata, problema revine — nu e un defect al fâșiei, care e o rotație completă și
eșantionată uniform.

**Despre lățimea fâșiei.** 44 × 128 px = 5632 px. Merită păstrată sub ~8192 px: unele GPU-uri
mobile au limita de textură acolo, iar o fâșie mai lată ar risca să nu se randeze integral.
Variantele mai dense măsurate au fost 77 × 112 px (8624 px, 77 KB) și 77 × 128 px (9856 px,
90 KB) — mai fine, dar mai riscante și mai grele.

Pentru locurile unde globul e doar decor (coperțile lipsă), se folosește **cadrul static** de
6,6 KB, nu sprite-ul: acolo mișcarea nu adaugă nimic și ar costa de opt ori mai mult.

### Cum se măsoară

PageSpeed Insights nu poate accesa `localhost`. Local, pe build-ul de producție:

```bash
npx lighthouse http://localhost:3000/ --form-factor=mobile --screenEmulation.mobile --view
```

Rulează întotdeauna pe `pnpm build && pnpm start`, nu pe serverul de development, și verifică
întâi că fonturile nu dau 404 — un server pornit înaintea unui build nou servește un manifest
vechi și scorul iese fals de bun.

---

## Legătura cu dashboard-ul

| Contract | Unde |
| --- | --- |
| Colecția `articles` și forma documentului | [`src/models/post.ts`](src/models/post.ts) |
| Documentul `settings/general` | [`src/models/settings.ts`](src/models/settings.ts) |
| Colecția `Contacts` (scrisă aici, citită în dashboard) | [`src/app/api/contact/route.ts`](src/app/api/contact/route.ts) |
| Colecția `subscribers` | [`src/app/actions/newsletter.ts`](src/app/actions/newsletter.ts) |
| Notele de subsol: `<span class="tiptap-footnote" data-content="…">` | [`src/utils/getFootnotes.ts`](src/utils/getFootnotes.ts) |
| Algoritmul de căutare după titlu | [`src/utils/searchByTitle.ts`](src/utils/searchByTitle.ts) |
| Webhook-ul de invalidare | [`src/app/api/revalidate/route.ts`](src/app/api/revalidate/route.ts) |

Dacă modifici ceva din tabelul de mai sus, verifică perechea din `dashboard-LN`.
