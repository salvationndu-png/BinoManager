import React from 'react';
import { saGet, saPatch } from '../lib/api';
import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

type TicketStatus = 'open' | 'in_progress' | 'closed';
type TicketType   = 'support' | 'feedback' | 'bug';

interface Ticket {
  id: number;
  type: TicketType;
  subject: string;
  message: string;
  status: TicketStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  tenant: { id: number; name: string; slug: string };
  user:   { id: number; name: string; email: string };
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  open:        'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  closed:      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };

const STATUS_ICON: Record<TicketStatus, React.ReactNode> = {
  open:        <Clock size={12} />,
  in_progress: <AlertCircle size={12} />,
  closed:      <CheckCircle size={12} /> };

const TYPE_BADGE: Record<TicketType, string> = {
  support:  'bg-indigo-500/10 text-indigo-400',
  feedback: 'bg-emerald-500/10 text-emerald-400',
  bug:      'bg-red-500/10 text-red-400' };

export function FeedbackInbox() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all' | TicketStatus>('all');
  const [selected, setSelected]   = useState<Ticket | null>(null);
  const [reply, setReply]         = useState('');
  const [status, setStatus]       = useState<TicketStatus>('in_progress');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');

  const load = async (f = filter) => {
    setLoading(true);
    try {
      const d = await saGet(`/superadmin/api/feedback?status=${f}`);
      setTickets(d.data ?? []);
      if (d.total !== undefined) setTotal(d.total ?? 0);
    } catch (e) {
      console.error('Failed to load feedback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const openTicket = (t: Ticket) => {
    setSelected(t);
    setReply(t.admin_reply ?? '');
    setStatus(t.status === 'open' ? 'in_progress' : t.status);
    setSaveMsg('');
  };

  const submitReply = async () => {
    if (!selected || !reply.trim()) return;
    setSaving(true); setSaveMsg('');
    try {
      const updated = await saPatch(`/superadmin/api/feedback/${selected.id}`, { admin_reply: reply, status });
      setSelected(updated);
      setTickets(ts => ts.map(t => t.id === updated.id ? updated : t));
      setSaveMsg('Reply saved.');
    } catch {
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Support Inbox</h1>
          <p className="text-sm text-sa-muted mt-1">
            {total} total ticket{total !== 1 ? 's' : ''}
            {openCount > 0 && <span className="ml-2 text-amber-400 font-semibold">· {openCount} open</span>}
          </p>
        </div>
        <button onClick={() => load()} className="p-2 text-sa-muted hover:text-sa-text hover:bg-sa-card rounded-lg transition-colors self-start sm:self-auto">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'open', 'in_progress', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold border transition-colors',
              filter === f
                ? 'bg-sa-accent/10 text-sa-accent border-sa-accent/30'
                : 'text-sa-muted border-sa-border hover:text-sa-text'
            )}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-sa-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-sa-muted">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tickets found</p>
            </div>
          ) : tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => openTicket(ticket)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                selected?.id === ticket.id
                  ? 'bg-sa-accent/10 border-sa-accent/30'
                  : 'bg-sa-card border-sa-border hover:border-sa-accent/20'
              )}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap', STATUS_STYLES[ticket.status])}>
                  {STATUS_ICON[ticket.status]} {ticket.status.replace('_', ' ')}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', TYPE_BADGE[ticket.type])}>
                  {ticket.type}
                </span>
                {!ticket.admin_reply && ticket.status !== 'closed' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <p className="text-sm font-semibold text-sa-text truncate">{ticket.subject}</p>
              <p className="text-xs text-sa-muted mt-1 truncate">{ticket.tenant?.name} · {ticket.user?.name}</p>
              <p className="text-[10px] text-sa-muted mt-1">{new Date(ticket.created_at).toLocaleDateString('en-NG')}</p>
            </button>
          ))}
        </div>

        {/* Detail / reply panel */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 text-sa-muted bg-sa-card border border-sa-border rounded-2xl">
              <MessageSquare size={36} className="mb-3 opacity-30" />
              <p className="text-sm">Select a ticket to view and reply</p>
            </div>
          ) : (
            <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden max-h-[calc(100vh-16rem)] flex flex-col">
              {/* Ticket header */}
              <div className="p-4 sm:p-5 border-b border-sa-border shrink-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap', STATUS_STYLES[selected.status])}>
                    {STATUS_ICON[selected.status]} {selected.status.replace('_', ' ')}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', TYPE_BADGE[selected.type])}>
                    {selected.type}
                  </span>
                </div>
                <h2 className="font-bold text-sa-text break-words">{selected.subject}</h2>
                <p className="text-xs text-sa-muted mt-1 break-words">
                  From <span className="text-sa-text font-semibold">{selected.user?.name}</span> ({selected.user?.email}) ·{' '}
                  <span className="text-sa-text font-semibold">{selected.tenant?.name}</span> ·{' '}
                  {new Date(selected.created_at).toLocaleString('en-NG')}
                </p>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto">
                {/* Original message */}
                <div className="p-4 sm:p-5 border-b border-sa-border">
                  <p className="text-xs font-bold text-sa-muted uppercase tracking-wider mb-2">Message</p>
                  <p className="text-sm text-sa-text whitespace-pre-wrap break-words leading-relaxed">{selected.message}</p>
                </div>

                {/* Previous reply */}
                {selected.admin_reply && (
                  <div className="p-4 sm:p-5 border-b border-sa-border bg-sa-accent/5">
                    <p className="text-xs font-bold text-sa-accent uppercase tracking-wider mb-2">
                      Your previous reply · {selected.replied_at ? new Date(selected.replied_at).toLocaleDateString('en-NG') : ''}
                    </p>
                    <p className="text-sm text-sa-text whitespace-pre-wrap break-words">{selected.admin_reply}</p>
                  </div>
                )}
              </div>

              {/* Reply form - fixed at bottom */}
              <div className="p-4 sm:p-5 space-y-3 border-t border-sa-border shrink-0 bg-sa-card">
                <p className="text-xs font-bold text-sa-muted uppercase tracking-wider">Reply</p>
                <textarea
                  rows={4}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full bg-sa-bg border border-sa-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm text-sa-text outline-none focus:border-sa-accent transition-colors resize-none"
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as TicketStatus)}
                    className="bg-sa-bg border border-sa-border rounded-xl px-3 py-2 text-sm text-sa-text outline-none focus:border-sa-accent w-full sm:w-auto"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={submitReply}
                    disabled={saving || !reply.trim()}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-sa-accent text-sa-bg rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity w-full sm:w-auto"
                  >
                    <Send size={15} />
                    {saving ? 'Saving...' : 'Send Reply'}
                  </button>
                  {saveMsg && <p className="text-xs text-sa-muted self-center">{saveMsg}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

