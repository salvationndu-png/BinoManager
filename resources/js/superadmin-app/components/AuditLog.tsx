import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Search, Download, History, ShieldAlert, ShieldCheck, UserCog, ArrowUpRight, ChevronDown, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet } from '../lib/api';
import { ErrorState } from './ErrorState';
import { AuditEntry } from '../types';

const actionConfig: Record<string, { icon: any; color: string; bg: string }> = {
  'tenant.suspend':     { icon: ShieldAlert, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  'tenant.unsuspend':   { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'tenant.impersonate': { icon: UserCog,     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  'tenant.plan_change': { icon: ArrowUpRight,color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  'tenant.extend_trial':{ icon: Clock,       color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  'default':            { icon: History,     color: 'text-sa-muted',    bg: 'bg-sa-muted/10 border-sa-muted/20' },
};

export const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actions, setActions] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (actionFilter) params.set('action', actionFilter);
      params.set('page', String(page));
      const res = await saGet(`/superadmin/api/audit?${params}`);
      setEntries(res.data ?? []);
      setPagination(res.meta ?? res.pagination ?? {});
      if (res.actions) setActions(res.actions);
    } catch (e: any) { setError(e.message ?? 'Failed to load audit log'); }
    finally { setLoading(false); }
  }, [search, actionFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Group entries by date
  const grouped: Record<string, AuditEntry[]> = {};
  entries.forEach(e => {
    const d = new Date(e.created_at).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">Audit Log</h2><p className="text-sa-muted text-sm">Complete record of all super admin actions</p></div>
        <a href="/superadmin/api/audit/export" className="flex items-center gap-2 bg-sa-card border border-sa-border px-4 py-2 rounded-lg text-sm font-bold hover:bg-sa-border transition-colors">
          <Download size={16}/> Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="bg-sa-card border border-sa-border p-4 rounded-xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={18}/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search descriptions, tenants..."
            className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent text-sa-text transition-colors"/>
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-sa-bg border border-sa-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sa-accent text-sa-text min-w-[180px]">
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="h-16 bg-sa-card border border-sa-border rounded-xl animate-pulse"/>)}</div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center text-sa-muted"><History size={40} className="mx-auto mb-3 opacity-30"/><p>No audit entries found</p></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateEntries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-sa-border"/>
                <span className="text-[10px] font-bold text-sa-muted uppercase tracking-widest whitespace-nowrap">{date}</span>
                <div className="h-px flex-1 bg-sa-border"/>
              </div>
              <div className="space-y-2">
                {dateEntries.map(entry => {
                  const cfg = actionConfig[entry.action] ?? actionConfig.default;
                  const Icon = cfg.icon;
                  return (
                    <div key={entry.id} className="bg-sa-card border border-sa-border rounded-xl overflow-hidden hover:border-sa-accent/30 transition-colors">
                      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                        <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center shrink-0", cfg.bg)}>
                          <Icon size={16} className={cfg.color}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry.description}
                            {entry.tenant && <span className="text-sa-muted"> — <span className="font-bold text-sa-text">{entry.tenant.name}</span></span>}
                          </p>
                          <p className="text-[10px] text-sa-muted mt-0.5">
                            {new Date(entry.created_at).toLocaleTimeString()} · {entry.super_admin?.name ?? 'System'} · {entry.ip_address}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border hidden sm:inline-block", cfg.bg, cfg.color)}>
                            {entry.action.split('.')[1] ?? entry.action}
                          </span>
                          {entry.context && <ChevronDown size={14} className={cn("text-sa-muted transition-transform", expanded === entry.id && 'rotate-180')}/>}
                        </div>
                      </div>
                      {expanded === entry.id && entry.context && (
                        <div className="border-t border-sa-border px-4 py-3 bg-sa-bg">
                          <p className="text-[10px] text-sa-muted uppercase tracking-widest mb-2 font-bold">Context</p>
                          <pre className="text-xs text-sa-muted font-mono overflow-x-auto">{JSON.stringify(entry.context, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-sa-muted">Showing {pagination.from}–{pagination.to} of {pagination.total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="p-2 rounded-lg border border-sa-border text-sa-muted hover:border-sa-accent/50 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
            <button onClick={() => setPage(p => Math.min(pagination.last_page, p+1))} disabled={page===pagination.last_page}
              className="p-2 rounded-lg border border-sa-border text-sa-muted hover:border-sa-accent/50 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>
      )}
    </div>
  );
};

