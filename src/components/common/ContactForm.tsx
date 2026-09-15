'use client';

import { useState, type FC, type FormEvent } from 'react';
import { AlertCircle, CheckCircle, Loader2, Mail, Send } from 'lucide-react';

/**
 * Contact form. Posts to /api/contact, which stores the message in Firestore (so the
 * dashboard sees it) and additionally emails it.
 *
 * The whole card is `h-full` and lays its fields out as a column with the message box
 * taking the slack, so on a two-column layout it ends level with the channel list on
 * the left instead of stopping short of it.
 */

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

const GENERIC_ERROR = 'A apărut o eroare. Te rugăm să încerci din nou.';

const ContactForm: FC = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: { error?: string } = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData(EMPTY_FORM);
      } else {
        setStatus('error');
        setErrorMessage(data.error || GENERIC_ERROR);
      }
    } catch {
      setStatus('error');
      setErrorMessage('Eroare de conexiune. Te rugăm să încerci din nou.');
    }
  };

  if (status === 'success') {
    return (
      <div className="card flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-donate" />
        <h3 className="font-display text-2xl text-text-primary">Mesaj trimis!</h3>
        <p className="text-text-muted">
          Mulțumim pentru mesaj. Vom reveni cu un răspuns cât mai curând.
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="btn-secondary mt-4">
          Trimite alt mesaj
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card flex h-full flex-col gap-5 p-6 sm:p-8"
      id="contact-form"
    >
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-teal" />
        <h3 className="font-display text-xl text-text-primary">Trimite-ne un mesaj</h3>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-btn bg-red-500/10 p-3 text-sm text-red-500">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1 block text-sm font-medium text-text-secondary"
          >
            Nume
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className="input-field"
            placeholder="Numele tău"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1 block text-sm font-medium text-text-secondary"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className="input-field"
            placeholder="email@exemplu.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1 block text-sm font-medium text-text-secondary"
        >
          Subiect
        </label>
        <input
          id="contact-subject"
          type="text"
          required
          value={formData.subject}
          onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
          className="input-field"
          placeholder="Despre ce este vorba?"
        />
      </div>

      {/* Takes the remaining height so the card ends level with the column beside it */}
      <div className="flex min-h-[140px] flex-1 flex-col">
        <label
          htmlFor="contact-message"
          className="mb-1 block text-sm font-medium text-text-secondary"
        >
          Mesaj
        </label>
        <textarea
          id="contact-message"
          required
          value={formData.message}
          onChange={(event) => setFormData({ ...formData, message: event.target.value })}
          className="input-field h-full min-h-[140px] flex-1 resize-y"
          placeholder="Scrie mesajul tău..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary flex w-full items-center justify-center gap-2"
        id="contact-submit"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Se trimite...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Trimite mesajul
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
