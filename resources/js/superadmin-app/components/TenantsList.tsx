import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Search, Download, MoreVertical, ShieldAlert, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, UserCog, Clock, CreditCard, StickyNote, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost } from '../lib/api';
import { Tenant, SAPage } from '../types';

const StatusBadge = ({ status }: { status: string }) => {
  const s: any = { active:'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', trialing:'bg-blue-500/10 text-blue-500 border-blue-500/20', grace:'bg-amber-500/10 text-amber-500 border-amber-500/20', suspended:'bg-red-500/10 text-red-500 border-red-500/20', cancelled:'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  return <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border", s[status] ?? s.cancelled)}>{status}</span>;
};

const PlanBadge = ({ plan }: { plan?: string }) => {
  const s: any = { Enterprise:'text-purple-400', Business:'text-blue-400', Starter:'text-sa-accent' };
  return <span className={cn("font-semibold text-sm", s[plan ?? ''] ?? 'text-sa-muted')}>{plan ?? '—'}</span>;
};

interface Modal { type: 'suspend'|'unsuspend'|'extend'|'change-plan'|'notes'|'impersonate'; tenant: Tenant; }

export const TenantsList = ({ setPage, setSelectedTenantId }: { setPage: (p: SAPage) => void; setSelectedTenantId: (id: number) => void }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage2] = useState(1);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [modal, setModal] = useState<Modal | null>(null);
  const [actionData, setActionData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (planFilter) params.set('plan', planFilter);
      params.set('page', String(page));
      const res = await saGet(`/superadmin/api/tenants?${params}`);
      setTenants(res.data ?? []);
      setPagination(res.meta ?? res.pagination ?? {});
      setStats(res.stats ?? {});
      if (!plans.length) setPlans(res.plans ?? []);
    } catch { showToast('Failed to load tenants', 'error'); }
    finally { setLoading(false); }
  }, [search, statusFilter, planFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const { tenant, type } = modal;
      const base = `/superadmin/tenants/${tenant.id}`;
      if (type === 'suspend') await saPost(`${base}/suspend`, { reason: actionData.reason ?? '' });
      else if (type === 'unsuspend') await saPost(`${base}/unsuspend`);
      else if (type === 'extend') await saPost(`${base}/extend-trial`, { days: actionData.days ?? 7 });
      else if (type === 'change-plan') await saPost(`${base}/change-plan`, { plan_id: actionData.plan_id });
      else if (type === 'notes') await saPost(`${base}/notes`, { notes: actionData.notes ?? '' });
      else if (type === 'impersonate') {
        // Create and submit a form with POST method
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/superadmin/impersonate/${tenant.id}/start`;
        const input = document.createElement('input');
          input.type = 'hidden';
          input.name = '_token';
          input.value = window.SuperAdmin?.csrf ?? '';
          form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        return;
      }
      showToast('Action completed successfully');
      setModal(null);
      setActionData({});
      await load();
    } catch (e: any) { showToast(e?.data?.message ?? 'Action failed', 'error'); }
    finally { setSaving(false); }
  };

  const statusCounts = [
    { label: 'All', val: '', count: stats.total ?? 0 },
    { label: 'Active', val: 'active', count: stats.active ?? 0 },
    { label: 'Trialing', val: 'trialing', count: stats.trialing ?? 0 },
    { label: 'Grace', val: 'grace', count: stats.grace ?? 0 },
    { label: 'Suspended', val: 'suspended', count: stats.suspended ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm", toast.type === 'success' ? 'bg-sa-accent' : 'bg-red-600')}>
          <span className="flex-1">{toast.msg}</span><button onClick={() => setToast(null)}><X size={15}/></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">Tenants Management</h2><p className="text-sa-muted text-sm">Manage all workspaces and take administrative actions</p></div>
        <a href={`/superadmin/api/tenants/export?status=${statusFilter}&search=${search}`}
          className="flex items-center gap-2 bg-sa-card border border-sa-border px-4 py-2 rounded-lg text-sm font-bold hover:bg-sa-border transition-colors">
          <Download size={18}/> Export CSV
        </a>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {statusCounts.map(s => (
          <button key={s.val} onClick={() => { setStatusFilter(s.val); setPage2(1); }}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
              statusFilter === s.val ? 'bg-sa-accent text-sa-bg border-sa-accent' : 'bg-sa-card border-sa-border text-sa-muted hover:border-sa-accent/50')}>
            {s.label} {s.count > 0 && <span className="ml-1 opacity-70">({s.count})</span>}
          </button>
        ))}
      </div>

      {/* Search + plan filter */}
      <div className="bg-sa-card border border-sa-border p-4 rounded-xl flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={18}/>
          <input type="text" placeholder="Search workspaces, email, slug..." value={search}
            onChange={e => { setSearch(e.target.value); setPage2(1); }}
            className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent transition-colors"/>
        </div>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage2(1); }}
          className="bg-sa-bg border border-sa-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sa-accent text-sa-text">
          <option value="">All Plans</option>
          {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-sa-border rounded-lg text-sm text-sa-muted hover:text-sa-text hover:border-sa-accent/50 transition-colors">
          <RefreshCw size={15}/> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-sa-card border border-sa-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sa-border bg-sa-bg/50">
              <tr>{['Workspace','Owner','Plan','Status','Users','Joined','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-bold text-sa-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-sa-border">
              {loading ? [...Array(6)].map((_,i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-8 bg-sa-border/30 rounded animate-pulse"/></td></tr>
              )) : tenants.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sa-muted">No tenants found</td></tr>
              ) : tenants.map(t => (
                <tr key={t.id} className="hover:bg-sa-accent/5 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sa-bg border border-sa-border flex items-center justify-center font-bold text-sa-muted text-sm shrink-0">
                        {(t.settings?.business_name ?? t.name).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sa-text">{t.settings?.business_name ?? t.name}</p>
                        <p className="text-[10px] text-sa-muted font-mono">{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sa-muted text-xs truncate max-w-[160px]">{t.email}</td>
                  <td className="px-4 py-4"><PlanBadge plan={t.plan?.name}/></td>
                  <td className="px-4 py-4"><StatusBadge status={t.status}/></td>
                  <td className="px-4 py-4 text-sa-muted text-xs">{t.users_count ?? '—'}</td>
                  <td className="px-4 py-4 text-sa-muted text-xs whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'2-digit' })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedTenantId(t.id); setPage('tenant-detail'); }}
                        className="px-3 py-1.5 text-xs font-bold bg-sa-bg border border-sa-border rounded-lg hover:border-sa-accent/50 hover:text-sa-accent transition-colors">
                        View
                      </button>
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                          className="p-1.5 text-sa-muted hover:text-sa-text rounded-lg hover:bg-sa-border transition-colors">
                          <MoreVertical size={16}/>
                        </button>
                        {openMenuId === t.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}/>
                            <div className="absolute right-0 mt-1 w-52 bg-sa-card border border-sa-border rounded-xl shadow-2xl z-20 overflow-hidden">
                              {[
                                { icon: UserCog, label: 'Impersonate', action: 'impersonate', color: 'text-amber-400' },
                                t.status !== 'suspended' ? { icon: ShieldAlert, label: 'Suspend', action: 'suspend', color: 'text-red-400' } : { icon: ShieldCheck, label: 'Unsuspend', action: 'unsuspend', color: 'text-emerald-400' },
                                { icon: Clock, label: 'Extend Trial', action: 'extend', color: 'text-blue-400' },
                                { icon: CreditCard, label: 'Change Plan', action: 'change-plan', color: 'text-purple-400' },
                                { icon: StickyNote, label: 'Admin Note', action: 'notes', color: 'text-sa-muted' },
                              ].map((item: any) => (
                                <button key={item.action} onClick={() => { setOpenMenuId(null); setModal({ type: item.action, tenant: t }); setActionData(item.action === 'notes' ? { notes: t.admin_notes ?? '' } : item.action === 'extend' ? { days: 7 } : {}); }}
                                  className={cn("flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-sa-bg transition-colors", item.color)}>
                                  <item.icon size={15}/>{item.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-sa-border flex items-center justify-between">
            <p className="text-xs text-sa-muted">Showing {pagination.from}–{pagination.to} of {pagination.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage2(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-2 rounded-lg border border-sa-border text-sa-muted hover:border-sa-accent/50 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
              <button onClick={() => setPage2(p => Math.min(pagination.last_page, p+1))} disabled={page === pagination.last_page}
                className="p-2 rounded-lg border border-sa-border text-sa-muted hover:border-sa-accent/50 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}/>
          <div className="relative bg-sa-card border border-sa-border rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-1 capitalize">{modal.type.replace('-',' ')} Workspace</h3>
            <p className="text-sa-muted text-sm mb-5">
              {modal.type === 'impersonate' ? `You will log in as the admin of ` : `Action on `}
              <span className="text-sa-text font-bold">{modal.tenant.settings?.business_name ?? modal.tenant.name}</span>
            </p>
            {modal.type === 'suspend' && (
              <textarea value={actionData.reason ?? ''} onChange={e => setActionData({ reason: e.target.value })}
                placeholder="Reason for suspension (optional)" rows={3}
                className="w-full bg-sa-bg border border-sa-border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:border-sa-accent resize-none text-sa-text"/>
            )}
            {modal.type === 'extend' && (
              <div className="flex gap-2 mb-4">
                {[7, 14, 30].map(d => (
                  <button key={d} onClick={() => setActionData({ days: d })}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-bold border transition-colors", actionData.days === d ? 'bg-sa-accent text-sa-bg border-sa-accent' : 'border-sa-border text-sa-muted hover:border-sa-accent/50')}>
                    +{d}d
                  </button>
                ))}
              </div>
            )}
            {modal.type === 'change-plan' && (
              <select value={actionData.plan_id ?? ''} onChange={e => setActionData({ plan_id: e.target.value })}
                className="w-full bg-sa-bg border border-sa-border rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-sa-accent text-sa-text">
                <option value="">Select new plan...</option>
                {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} — ₦{(p.price_kobo/100).toLocaleString()}/mo</option>)}
              </select>
            )}
            {modal.type === 'notes' && (
              <textarea value={actionData.notes ?? ''} onChange={e => setActionData({ notes: e.target.value })}
                placeholder="Admin notes about this tenant..." rows={4}
                className="w-full bg-sa-bg border border-sa-border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:border-sa-accent resize-none text-sa-text"/>
            )}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-sa-bg border border-sa-border text-sa-muted hover:border-sa-border/80 transition-colors">Cancel</button>
              <button onClick={handleAction} disabled={saving}
                className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50",
                  modal.type === 'suspend' ? 'bg-red-600 hover:bg-red-700 text-white' : modal.type === 'impersonate' ? 'bg-amber-500 hover:bg-amber-600 text-sa-bg' : 'bg-sa-accent hover:bg-emerald-400 text-sa-bg')}>
                {saving ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

