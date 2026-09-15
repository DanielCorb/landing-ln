/**
 * The site's single legal page.
 *
 * There used to be three — /gdpr, /cookies and /politica-de-confidentialitate — each an
 * outline waiting for a lawyer. They now collapse into one document, because splitting a
 * privacy notice across several URLs makes a reader hunt for the clause that applies to
 * them, and GDPR asks for the information to be presented in an accessible form. The old
 * two routes redirect here (see next.config.ts).
 *
 * The body is modelled as blocks rather than one HTML blob so the headings stay real
 * headings for screen readers and for search engines. Inline markup inside a block is
 * limited to links and `<strong>`, and every string here is authored in this file — none
 * of it comes from user input, which is what makes rendering it as HTML safe.
 */

// The two cookie lists in section 3 come from the same constants the preferences modal
// renders, so the notice and the consent dialog can never describe different cookies.
import { ESSENTIAL_COOKIES, OPTIONAL_COOKIES } from '@constants/cookies';

/** Shown under the title. Replace with the date the policy actually goes live. */
export const LAST_UPDATED = '15.08.2026';

/** Editorial inbox for anything about personal data. */
export const PRIVACY_CONTACT_EMAIL = 'contact@lumeanoua.com';

export type LegalBlock = { type: 'paragraph'; html: string } | { type: 'list'; items: string[] };

export interface LegalSection {
  /** Numbered heading, rendered as an `<h2>`. */
  heading: string;
  blocks: LegalBlock[];
}

/**
 * Anchor for an external reference.
 *
 * `rel="noopener noreferrer"` is not decoration: a `target="_blank"` link hands the opened
 * page a `window.opener` handle back to ours unless it is set.
 */
const getExternalLink = (href: string, label: string): string =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;

/**
 * Mail link, deliberately without `target="_blank"`.
 *
 * A blank target on a `mailto:` hands the browser a navigation it cannot render, so it
 * opens the mail client and leaves an empty tab behind.
 */
const getMailLink = (address: string): string => `<a href="mailto:${address}">${address}</a>`;

const CONTACT_LINK = getMailLink(PRIVACY_CONTACT_EMAIL);

/**
 * Where each legal reference points.
 *
 * The first version linked EUR-Lex and the Ministry of Justice portal — authoritative, but
 * unusable in practice. `legislatie.just.ro` refuses connections from outside Romania, and
 * the EUR-Lex text is one continuous document with no per-article addressing, so a reader
 * chasing "art. 6 alin. 1 lit. a" has to hunt through it. GDPR requires this information to
 * be genuinely accessible, which a link most readers cannot open is not.
 *
 * These replacements are PDFs on government domains and a per-article mirror of the
 * regulation in Romanian. Both PDFs were fetched and confirmed to serve real documents.
 */
const GDPR_URL = 'https://gdprinfo.eu/ro';

const GDPR_LINK = getExternalLink(GDPR_URL, 'Regulamentului (UE) 2016/679 (GDPR)');

const GDPR_ARTICLE_LINK = (label: string): string => getExternalLink(GDPR_URL, label);

const LAW_190_LINK = getExternalLink(
  'https://edirect.e-guvernare.ro/Uploads/Legi/35906/Lege%20190%202018.pdf',
  'Legii nr. 190/2018',
);

const LAW_506_LINK = getExternalLink(
  'https://if.prefectura.mai.gov.ro/wp-content/uploads/sites/55/2019/10/LEGE-A_506_17-11-2004.pdf',
  'Legea nr. 506/2004',
);

const ANSPDCP_LINK = getExternalLink('https://www.dataprotection.ro', 'www.dataprotection.ro');

export const PRIVACY_POLICY = {
  slug: '/politica-de-confidentialitate',
  title: 'Politica de Confidențialitate și Cookie-uri',
  metaDescription:
    'Cum colectează, folosește și protejează Lumea Nouă datele personale ale cititorilor: newsletter, cookie-uri, drepturile tale și cum ți le exerciți.',

  intro: [
    {
      type: 'paragraph',
      html: `Lumea Nouă este o publicație independentă situată în București, controlată strict de echipa Lumea Nouă. Ne puteți contacta pentru orice întrebare legată de datele tale personale la adresa: ${CONTACT_LINK}.`,
    },
    {
      type: 'paragraph',
      html: `Prelucrăm datele personale conform ${GDPR_LINK} și ${LAW_190_LINK}, legea română de punere în aplicare a regulamentului. Pentru cookie-uri se aplică și ${LAW_506_LINK} privind prelucrarea datelor cu caracter personal în sectorul comunicațiilor electronice.`,
    },
  ] satisfies LegalBlock[],

  sections: [
    {
      heading: '1. Ce date colectăm',
      blocks: [
        { type: 'paragraph', html: 'Când te abonezi la newsletter, colectăm:' },
        { type: 'list', items: ['adresa ta de email'] },
        {
          type: 'paragraph',
          html: 'Când navighezi pe site, indiferent dacă ești abonat sau nu, colectăm automat:',
        },
        {
          type: 'list',
          items: [
            'date de bază despre vizită / sesiune și țara din care accesezi (cookie-uri necesare)',
            'vizite pe pagină, tag-uri de trafic și deschiderea articolelor urmărite (pagină + țară; fără timp, scroll sau click-uri)',
            'cu consimțământ pentru cookie-uri opționale: timp petrecut, adâncime de scroll, click-uri și alte interacțiuni detaliate',
            'adresa IP (pentru țară / securitate de bază)',
            'site-uri de referință',
          ],
        },
        {
          type: 'paragraph',
          html: 'Datele de trafic sunt anonimizate, colectate doar cât timp ești pe site și nu sunt legate de adresa ta de email sau de orice altă informație care te-ar putea identifica.',
        },
      ],
    },
    {
      heading: '2. De ce colectăm aceste date',
      blocks: [
        {
          type: 'paragraph',
          html: `Adresa de email o folosim strict ca să-ți trimitem articolele și noutățile prin newsletter, dacă te-ai abonat voluntar. Temeiul legal este consimțământul tău, dat explicit (${GDPR_ARTICLE_LINK('art. 6 alin. 1 lit. a GDPR')}).`,
        },
        {
          type: 'paragraph',
          html: `Datele de trafic anonimizate le folosim ca să înțelegem cum e citit site-ul și ce articole funcționează. Temeiul legal este interesul nostru legitim de a analiza audiența (${GDPR_ARTICLE_LINK('art. 6 alin. 1 lit. f GDPR')}), limitat strict la ce ne trebuie pentru asta.`,
        },
        {
          type: 'paragraph',
          html: 'Nu colectăm niciun alt tip de date în afară de cele de mai sus.',
        },
      ],
    },
    {
      heading: '3. Cookie-uri',
      blocks: [
        { type: 'paragraph', html: 'Folosim două categorii de cookie-uri.' },
        {
          type: 'paragraph',
          html: '<strong>Necesare</strong> (nu au nevoie de consimțământul tău, funcționarea site-ului depinde de ele):',
        },
        { type: 'list', items: [...ESSENTIAL_COOKIES] },
        {
          type: 'paragraph',
          html: '<strong>Opționale</strong> (au nevoie de consimțământul tău explicit, cerut printr-un banner la prima vizită):',
        },
        { type: 'list', items: [...OPTIONAL_COOKIES] },
        {
          type: 'paragraph',
          html: 'Poți accepta toate cookie-urile, poți refuza doar pe cele opționale sau poți refuza toate cookie-urile din setările browser-ului tău. Dacă refuzi și cookie-urile necesare, unele funcții ale site-ului s-ar putea să nu mai meargă corect.',
        },
        {
          type: 'paragraph',
          html: 'Măsurătorile opționale (timp, scroll, click-uri) rulează doar după ce le accepți explicit — nu sunt colectate și nu sunt trimise înainte. Statisticiile de bază (sesiune, vizite, tag-uri, deschidere articol: pagină + țară) rulează pe cookie-uri necesare. Poți schimba alegerea oricând; la retragerea consimțământului oprim trimiterea opțională și ștergem identificatorii de analiză comportamentală din browser.',
        },
      ],
    },
    {
      heading: '4. Reguli speciale pentru newsletter',
      blocks: [
        {
          type: 'paragraph',
          html: 'Te abonezi printr-o acțiune clară din partea ta, fără nicio bifă precompletată în avans.',
        },
        {
          type: 'paragraph',
          html: 'Adresa ta de email stă într-o bază de date separată de datele de trafic anonimizate. Așa știm exact cui îi trimitem newsletter și cui nu, fără să amestecăm asta cu statisticile de vizitare a site-ului.',
        },
        {
          type: 'paragraph',
          html: `Te poți dezabona oricând, la fel de ușor cum te-ai abonat: printr-un link de dezabonare din fiecare email pe care ți-l trimitem, sau printr-un mesaj simplu la ${CONTACT_LINK}.`,
        },
        {
          type: 'paragraph',
          html: 'După ce te dezabonezi, păstrăm adresa ta într-o listă de excludere, ca să nu-ți trimitem din greșeală alt newsletter mai târziu. Dacă vrei ca adresa să dispară complet, inclusiv din lista de excludere, ne spui și o ștergem.',
        },
        {
          type: 'paragraph',
          html: 'Dacă îți schimbi adresa de email și ne anunți, o ștergem imediat pe cea veche.',
        },
      ],
    },
    {
      heading: '5. Cât timp păstrăm datele',
      blocks: [
        {
          type: 'paragraph',
          html: 'Adresa de email o păstrăm cât timp ești abonat, plus perioada de cel puțin 6 luni în care rămâi în lista de excludere după o eventuală dezabonare, dacă nu ceri ștergerea completă.',
        },
        {
          type: 'paragraph',
          html: 'Datele de trafic, fiind anonimizate, pot fi păstrate pe termen nelimitat, într-o arhivă folosită doar pentru statistici interne. Arhiva rămâne complet separată de baza de date cu adrese de email.',
        },
      ],
    },
    {
      heading: '6. Cui dăm acces la date',
      blocks: [
        {
          type: 'paragraph',
          html: 'Nu dăm datele tale niciunui terț. Nu le vindem, nu le închiriem, nu le trimitem la agenții de publicitate sau alte platforme.',
        },
        {
          type: 'paragraph',
          html: 'Singurii care au acces la date sunt membrii echipei Lumea Nouă, în măsura în care au nevoie de ele pentru a administra site-ul și newsletter-ul.',
        },
        {
          type: 'paragraph',
          html: 'Singura excepție e legea: dacă o autoritate publică ne cere date în baza unei obligații legale clare, suntem obligați să răspundem. Asta nu înseamnă că împărtășim date din proprie inițiativă cu altcineva.',
        },
      ],
    },
    {
      heading: '7. Cum protejăm datele',
      blocks: [
        {
          type: 'paragraph',
          html: 'Accesul la bazele de date e restricționat la membrii echipei. Verificăm periodic măsurile de securitate implementate, ca să reducem riscul de acces neautorizat, pierdere sau distrugere a datelor. Colectăm strict minimul necesar, acesta fiind doar adresa de mail, pentru a limita datele expuse în cazul accesului neautorizat la datele colectate. Datele colectate în afara adresei de mail sunt complet anonimizate, astfel sunt protejate încă de la început, iar cititorii nu sunt expuși niciunui risc real în cazul accesului neautorizat la aceste date.',
        },
      ],
    },
    {
      heading: '8. Profiling automat',
      blocks: [
        {
          type: 'paragraph',
          html: 'Nu construim profiluri individuale de comportament și nu luăm decizii automate bazate pe datele tale. Dacă am introduce vreodată o astfel de practică, te-am anunța clar înainte printr-un mail și ai avea dreptul explicit de a o refuza.',
        },
      ],
    },
    {
      heading: '9. Date anonimizate',
      blocks: [
        {
          type: 'paragraph',
          html: 'Datele de trafic din arhivă sunt complet anonimizate și nu sunt legate de nicio persoană identificabilă. Din acest motiv, nu putem oferi acces individual la ele și nici nu le putem șterge la cerere: pur și simplu nu știm cui aparțin.',
        },
      ],
    },
    {
      heading: '10. Drepturile tale',
      blocks: [
        { type: 'paragraph', html: 'Ai dreptul să:' },
        {
          type: 'list',
          items: [
            'afli ce date deținem despre tine',
            'ceri corectarea unor date greșite',
            'ceri ștergerea adresei tale de email din baza noastră de date, dacă nu mai e necesară (adică dacă nu mai vrei să primești newsletter)',
            'retragi consimțământul dat pentru cookie-uri opționale sau pentru newsletter, oricând',
            'te opui prelucrării, în măsura permisă de lege',
            'depui o plângere la autoritatea de supraveghere, dacă ai motive bine întemeiate de a crede că nu respectăm ce scrie aici',
          ],
        },
        {
          type: 'paragraph',
          html: 'Retragerea consimțământului sau cererea de ștergere se fac la fel de simplu ca darea consimțământului inițial.',
        },
      ],
    },
    {
      heading: '11. Cum îți exerciți drepturile',
      blocks: [
        {
          type: 'paragraph',
          html: `Ne scrii la ${CONTACT_LINK} și ne spui ce vrei să facem cu datele tale.`,
        },
        {
          type: 'paragraph',
          html: 'Dacă ceri ștergerea datelor, îți confirmăm în scris, în maxim o lună de la cerere, că au fost șterse. Dacă avem nevoie de mai mult timp din motive obiective (de exemplu un volum mare de cereri sau o situație complicată), te anunțăm în prima lună despre întârziere și motivul ei, iar termenul se poate prelungi cu până la două luni în plus.',
        },
      ],
    },
    {
      heading: '12. Plângeri',
      blocks: [
        {
          type: 'paragraph',
          html: 'Dacă nu ești mulțumit de răspunsul nostru sau consideri că nu am respectat drepturile tale, poți depune o plângere la:',
        },
        {
          type: 'paragraph',
          html: [
            '<strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>',
            'B-dul G-ral. Gheorghe Magheru nr. 28-30, sector 1, București, cod poștal 010336',
            `Email: ${getMailLink('anspdcp@dataprotection.ro')}`,
            `Website: ${ANSPDCP_LINK}`,
          ].join('<br />'),
        },
      ],
    },
    {
      heading: '13. Modificări ale acestei politici',
      blocks: [
        {
          type: 'paragraph',
          html: 'Dacă schimbăm ceva relevant în felul în care colectăm sau folosim datele tale, actualizăm această pagină și menționăm data ultimei modificări în partea de sus.',
        },
      ],
    },
  ] satisfies LegalSection[],
};
