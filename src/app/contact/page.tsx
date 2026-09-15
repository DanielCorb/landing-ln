import type { Metadata } from 'next';
// constants
import { BASE_URL } from '@constants/site';
// views
import ContactView from '@views/ContactView';

const TITLE = 'Contact';

const DESCRIPTION =
  'Contactează echipa Lumea Nouă — trimite-ne un mesaj sau urmărește-ne pe rețelele sociale.';

// Keep in sync with REVALIDATE_SECONDS in @constants/site — Next.js needs a literal here.
export const revalidate = 300;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/contact`,
    locale: 'ro_RO',
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default function ContactPage() {
  return <ContactView />;
}
