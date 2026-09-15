'use client';

import { useState, type FC, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
// utils
import { getClassNames } from '@utils/getClassNames';
// actions
import { subscribeToNewsletterAction } from '@/app/actions/newsletter';

type StatusType = 'success' | 'error' | null;

const STATUS_CLASSES: Record<'success' | 'error', string> = {
  success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  error: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const NewsletterWidget: FC = () => {
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;

    if (!agreedToTerms) {
      setStatus({ type: 'error', message: 'Trebuie să accepți Termenii și Condițiile.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    const result = await subscribeToNewsletterAction(email, agreedToTerms);
    setLoading(false);

    if (result.success) {
      setStatus({ type: 'success', message: result.message || 'Te-ai abonat cu succes!' });
      setEmail('');
      setAgreedToTerms(false);
    } else {
      setStatus({ type: 'error', message: result.error || 'A apărut o eroare.' });
    }
  };

  return (
    <div className="card flex h-full flex-col justify-between p-6" id="newsletter-widget">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-teal" />
          <h3 className="font-display text-xl text-text-primary">Abonare Newsletter</h3>
        </div>

        <p className="mb-6 text-justify text-sm text-text-muted">
          Abonează-te pentru a primi notificări pe email atunci când publicăm o postare nouă. Fără
          spam.
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <input
          type="email"
          placeholder="Adresa ta de email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          required
          className="input-field w-full text-sm"
          id="newsletter-email"
        />

        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="newsletter-terms"
            checked={agreedToTerms}
            onChange={(event) => setAgreedToTerms(event.target.checked)}
            required
            className="accent-teal"
          />
          <label htmlFor="newsletter-terms" className="text-xs text-text-muted">
            {/* The label now names the document it actually links to. Consent to data
                processing has to point at the notice describing it — "Termenii și
                Condițiile" referred to a page that does not exist. */}
            Sunt de acord cu{' '}
            <a
              href="/politica-de-confidentialitate"
              className="text-teal hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Politica de Confidențialitate
            </a>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-btn bg-teal px-4 py-2.5 font-bold text-white transition-colors hover:bg-teal-dark dark:text-teal-dark dark:hover:bg-teal-light"
          id="newsletter-subscribe-button"
        >
          {loading ? 'Se abonează...' : 'Abonează-te'}
        </button>

        {status.type && (
          <div
            className={getClassNames(
              'flex items-center gap-2 rounded-btn p-3 text-xs',
              STATUS_CLASSES[status.type],
            )}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewsletterWidget;
