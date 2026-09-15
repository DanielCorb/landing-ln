import type { Metadata } from 'next';
// constants
import { BASE_URL } from '@constants/site';
// views
import AboutView from '@views/AboutView';

const TITLE = 'Despre noi';

const DESCRIPTION =
  'Află mai multe despre publicația Lumea Nouă și echipa din spatele proiectului.';

// Keep in sync with REVALIDATE_SECONDS in @constants/site — Next.js needs a literal here.
export const revalidate = 300;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/despre-noi` },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/despre-noi`,
    locale: 'ro_RO',
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default function DespreNoiPage() {
  return <AboutView />;
}
