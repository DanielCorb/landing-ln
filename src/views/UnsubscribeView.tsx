'use client';

import { useState, type FC } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, MailX } from 'lucide-react';
// actions
import { unsubscribeFromNewsletterAction } from '@/app/actions/newsletter';

/**
 * Confirmation step for an unsubscribe link.
 *
 * The click does **not** unsubscribe on its own. Corporate mail filters, link scanners and
 * inbox previews routinely fetch every URL in a message before a human ever sees it, so a
 * GET that removed the address would quietly unsubscribe people who never opened the
 * email. The actual removal happens on this button, which is a POST via a server action.
 *
 * One-click unsubscribe from the mail client's own UI is handled separately, by the
 * `List-Unsubscribe-Post` endpoint — that one is already a POST and needs no confirmation.
 */

const PRIMARY_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center rounded-btn bg-teal px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-teal-dark hover:shadow-lg disabled:opacity-60';

const SECONDARY_LINK_CLASS =
  'inline-flex w-full items-center justify-center rounded-btn border border-border px-6 py-3 font-medium text-text-secondary transition-colors duration-200 hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/5';

interface UnsubscribeViewProps {
  /** Verified server-side; null when the link was tampered with or is incomplete. */
  email: string | null;
}

const UnsubscribeView: FC<UnsubscribeViewProps> = ({ email }) => {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    if (!email) return;

    setLoading(true);
    setError('');

    const result = await unsubscribeFromNewsletterAction(email);
    setLoading(false);

    if (result.success) setDone(true);
    else setError(result.error || 'A apărut o eroare.');
  };

  return (
    <div className="animate-fade-in flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">
          {done ? (
            <CheckCircle2 className="h-10 w-10 text-teal" />
          ) : (
            <MailX className="h-10 w-10 text-teal" />
          )}
        </div>

        {!email ? (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-text-primary">Link invalid</h1>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              Linkul de dezabonare nu este valid sau a fost trunchiat de clientul de email. Scrie-ne
              și te scoatem noi din listă.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/contact" className={PRIMARY_BUTTON_CLASS}>
                Contactează-ne
              </Link>
              <Link href="/" className={SECONDARY_LINK_CLASS}>
                Înapoi acasă
              </Link>
            </div>
          </div>
        ) : done ? (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-text-primary">Te-ai dezabonat</h1>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              Nu vei mai primi emailuri de la noi la adresa{' '}
              <span className="font-medium text-text-primary">{email}</span>. Ne pare rău să te
              vedem plecând — te poți reabona oricând de pe pagina principală.
            </p>
            <div className="pt-2">
              <Link href="/" className={SECONDARY_LINK_CLASS}>
                Înapoi acasă
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-text-primary">Confirmă dezabonarea</h1>
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
              Adresa <span className="font-medium text-text-primary">{email}</span> nu va mai primi
              notificări despre postările noi.
            </p>

            {error && (
              <div className="flex items-center justify-center gap-2 rounded-btn bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={loading}
                className={PRIMARY_BUTTON_CLASS}
                id="unsubscribe-confirm-button"
              >
                {loading ? 'Se procesează…' : 'Da, dezabonează-mă'}
              </button>
              <Link href="/" className={SECONDARY_LINK_CLASS}>
                Nu, rămân abonat
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsubscribeView;
