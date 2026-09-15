import type { Metadata } from 'next';
// views
import NotFoundView from '@views/NotFoundView';

export const metadata: Metadata = {
  title: 'Pagina nu a fost găsită',
  description: 'Pagina pe care o cauți nu există sau a fost mutată.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
