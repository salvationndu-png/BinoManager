import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, X, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { cn, tenantUrl } from '../lib/utils';

const csrf = () => window.BinoManager?.csrf ?? '';

type TicketType = 'support' | 'feedback' | 'bug';
type TicketStatus = 'open' | 'in_progress' | 'closed';

interface Ticket {
  id: number;
  type: TicketType;
  subject: string;
  status: TicketStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  open:        'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  closed:      'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

const STATUS_ICON: Record<TicketStatus, React.ReactNode> = {
  open:        <Clock size={12} />,
  in_progress: <AlertCircle size={12} />,
  closed:      <CheckCircle size={12} />,
};

const TYPE_LABELS: Record<TicketType, string> = {
  support:  'Support',
  feedback: 'Feedback',
  bug:      'Bug Report',
};

export default function Support() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState({ type: 'support' as TicketType, subject: '', message: '' });
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const load = () => {
    setLoading(true);
    fetch(tenantUrl('api/feedback'))
      .then(r => r.json())
      .then(data => { setTickets(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const res = await fetch(tenantUrl('api/feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Failed'); }
      setSuccess('Your message has been sent. We\'ll get back to you soon.');
      setForm({ type: 'support', subject: '', message: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Support & Feedback</h1>
          <p className="text-sm text-zinc-500 mt-1">Send us a message or report an issue. We typically respond within 24 hours.</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setError(''); setSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle size={16} className="shrink-0" />
          {success}
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">New Message</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as TicketType }))}
                className="mt-1 w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="support">Support Request</option>
                <option value="feedback">Feedback</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subject</label>
              <input
                required
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Brief description..."
                className="mt-1 w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Describe your issue or feedback in detail..."
              className="mt-1 w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Send size={15} />
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <MessageSquare size={40} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="font-semibold text-zinc-500">No messages yet</p>
          <p className="text-sm text-zinc-400 mt-1">Click "New Message" to contact support.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0', STATUS_STYLES[ticket.status])}>
                  {STATUS_ICON[ticket.status]}
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-semibold text-zinc-400 shrink-0">{TYPE_LABELS[ticket.type]}</span>
                <span className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{ticket.subject}</span>
                {ticket.admin_reply && (
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full shrink-0">Reply received</span>
                )}
                <span className="text-xs text-zinc-400 shrink-0">{new Date(ticket.created_at).toLocaleDateString('en-NG')}</span>
                {expanded === ticket.id ? <ChevronUp size={16} className="text-zinc-400 shrink-0" /> : <ChevronDown size={16} className="text-zinc-400 shrink-0" />}
              </button>

              {expanded === ticket.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  {/* Original message not stored in list — show subject as context */}
                  {ticket.admin_reply ? (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
                      <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                        BinoManager Support replied · {ticket.replied_at ? new Date(ticket.replied_at).toLocaleDateString('en-NG') : ''}
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{ticket.admin_reply}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">Awaiting reply from support team...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
