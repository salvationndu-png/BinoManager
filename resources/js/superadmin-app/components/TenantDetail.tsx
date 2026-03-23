import React from 'react';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, ShieldCheck, DollarSign, Users, Package, UserCog, CreditCard, FileText, History, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost } from '../lib/api';
import { SAPage } from '../types';

const StatusBadge = ({ status }: { status: string }) => {
  const s: any = { active:'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', trialing:'bg-blue-500/10 text-blue-500 border-blue-500/20', grace:'bg-amber-500/10 text-amber-500 border-amber-500/20', suspended:'bg-red-500/10 text-red-500 border-red-500/20', cancelled:'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  return <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border", s[status] ?? s.cancelled)}>{status}</span>;
};

export const TenantDetail = ({ tenantId, setPage }: { tenantId: number; setPage: (p: SAPage) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview'|'billing'|'activity'|'notes'>('overview');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [acting, setActing] = useState<string|null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    Promise.all([
      saGet(`/superadmin/api/tenants/${tenantId}`),
      saGet('/superadmin/api/plans'),
    ]).then(([d, p]) => {
      setData(d); setNotes(d.tenant?.internal_notes ?? ''); setPlans(p.plans ?? p);
    }).catch((e: any) => { showToast(e.message ?? 'Failed to load tenant', 'error'); }).finally(() => setLoading(false));
  }, [tenantId]);

  const handleSuspend = async () => {
    setActing('suspend');
    try { await saPost(`/superadmin/tenants/${tenantId}/suspend`, {}); const d = await saGet(`/superadmin/api/tenants/${tenantId}`); setData(d); showToast('Tenant suspended'); }
    catch (e: any) { showToast(e?.data?.message ?? 'Failed', 'error'); }
    finally { setActing(null); }
  };
  const handleUnsuspend = async () => {
    setActing('unsuspend');
    try { await saPost(`/superadmin/tenants/${tenantId}/unsuspend`); const d = await saGet(`/superadmin/api/tenants/${tenantId}`); setData(d); showToast('Tenant restored'); }
    catch (e: any) { showToast(e?.data?.message ?? 'Failed', 'error'); }
    finally { setActing(null); }
  };
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try { await saPost(`/superadmin/tenants/${tenantId}/notes`, { notes }); showToast('Notes saved'); }
    catch { showToast('Failed to save notes', 'error'); }
    finally { setSavingNotes(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-sa-muted"><RefreshCw size={24} className="animate-spin"/></div>;
  if (!data) return <div className="text-center py-16 text-sa-muted">Tenant not found</div>;

  const { tenant, users, auditLog, billingHistory, kpis } = data;
  const fmt = (n: number) => '₦' + Number(n).toLocaleString('en-NG');

  return (
    <div className="space-y-6">
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm", toast.type==='success'?'bg-sa-accent':'bg-red-600')}>
          <span className="flex-1">{toast.msg}</span><button onClick={() => setToast(null)}><X size={15}/></button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setPage('tenants')} className="flex items-center gap-2 text-sa-muted hover:text-sa-text transition-colors text-sm">
          <ArrowLeft size={16}/> All Tenants
        </button>
        <span className="text-sa-border">/</span>
        <span className="text-sa-text text-sm">{tenant.settings?.business_name ?? tenant.name}</span>
      </div>

      {/* Header */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sa-accent to-emerald-700 flex items-center justify-center font-black text-sa-bg text-xl shrink-0">
              {(tenant.settings?.business_name ?? tenant.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{tenant.settings?.business_name ?? tenant.name}</h2>
              <p className="text-sa-muted text-sm">{tenant.email}{tenant.phone && ` · ${tenant.phone}`}</p>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={tenant.status}/>
                <span className="text-[10px] text-sa-muted font-mono">{tenant.slug}.binomanager.com</span>
                {tenant.plan && <span className="text-[10px] font-bold text-purple-400">{tenant.plan.name} Plan</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <form method="POST" action={`/superadmin/impersonate/${tenant.id}/start`}>
              <input type="hidden" name="_token" value={window.SuperAdmin?.csrf ?? ''} />
              <button type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                <UserCog size={15}/> Impersonate
              </button>
            </form>
            {tenant.status !== 'suspended' ? (
              <button onClick={handleSuspend} disabled={acting==='suspend'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                <ShieldAlert size={15}/> {acting==='suspend'?'..':'Suspend'}
              </button>
            ) : (
              <button onClick={handleUnsuspend} disabled={acting==='unsuspend'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                <ShieldCheck size={15}/> {acting==='unsuspend'?'..':'Unsuspend'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Revenue', value: fmt(kpis?.totalRevenue ?? 0), icon: DollarSign, color:'text-sa-accent' },
          { label:'Active Users', value: kpis?.activeUsers ?? 0, icon: Users, color:'text-blue-400' },
          { label:'Products', value: kpis?.productsCount ?? 0, icon: Package, color:'text-purple-400' },
          { label:'Sales This Month', value: fmt(kpis?.salesThisMonth ?? 0), icon: CreditCard, color:'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="bg-sa-card border border-sa-border rounded-xl p-5">
            <div className={cn("mb-3", k.color)}><k.icon size={20}/></div>
            <p className="text-xs text-sa-muted mb-1">{k.label}</p>
            <p className="text-xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-sa-border overflow-x-auto">
          {([['overview','Overview',FileText],['billing','Billing',CreditCard],['activity','Activity',History],['notes','Notes',FileText]] as const).map(([t, label, Icon]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
                tab === t ? 'border-sa-accent text-sa-accent' : 'border-transparent text-sa-muted hover:text-sa-text')}>
              <Icon size={16}/>{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-3 text-sm text-sa-muted uppercase tracking-wider">Subscription</h4>
                {tenant.subscriptions?.length > 0 ? (
                  <div className="bg-sa-bg border border-sa-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['Plan', tenant.plan?.name ?? '—'],
                      ['Status', tenant.subscriptions[0].status],
                      ['Started', tenant.subscriptions[0].starts_at ? new Date(tenant.subscriptions[0].starts_at).toLocaleDateString() : '—'],
                      ['Next Billing', tenant.subscriptions[0].next_payment_date ? new Date(tenant.subscriptions[0].next_payment_date).toLocaleDateString() : '—'],
                    ].map(([l, v]) => (
                      <div key={l as string}><p className="text-[10px] text-sa-muted uppercase tracking-wider">{l}</p><p className="text-sm font-bold mt-1">{v as string}</p></div>
                    ))}
                  </div>
                ) : <p className="text-sa-muted text-sm">No active subscription</p>}
              </div>
              <div>
                <h4 className="font-bold mb-3 text-sm text-sa-muted uppercase tracking-wider">Team Members</h4>
                <div className="divide-y divide-sa-border border border-sa-border rounded-xl overflow-hidden">
                  {(users ?? []).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sa-accent/20 grid place-items-center text-sa-accent font-bold text-xs">{u.name.charAt(0).toUpperCase()}</div>
                        <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-sa-muted">{u.email}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", u.usertype===1?'bg-blue-500/10 text-blue-400 border-blue-500/20':'bg-sa-muted/10 text-sa-muted border-sa-muted/20')}>{u.usertype===1?'Admin':'Sales'}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", u.status?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-red-500/10 text-red-400 border-red-500/20')}>{u.status?'Active':'Inactive'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div>
              <h4 className="font-bold mb-4 text-sm text-sa-muted uppercase tracking-wider">Payment History</h4>
              {(billingHistory ?? []).length === 0 ? (
                <p className="text-sa-muted text-sm">No payment records</p>
              ) : (
                <div className="divide-y divide-sa-border border border-sa-border rounded-xl overflow-hidden">
                  {billingHistory.map((b: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-sa-accent/5 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{new Date(b.processed_at ?? b.created_at).toLocaleString()}</p>
                        <p className="text-xs text-sa-muted">{b.paystack_reference ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-sm text-sa-accent">{fmt(b.amount ?? 0)}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">success</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div>
              <h4 className="font-bold mb-4 text-sm text-sa-muted uppercase tracking-wider">Admin Actions on this Tenant</h4>
              {(auditLog ?? []).length === 0 ? (
                <p className="text-sa-muted text-sm">No recorded actions</p>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-sa-bg border border-sa-border rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-sa-accent mt-2 shrink-0"/>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.description}</p>
                        <p className="text-xs text-sa-muted mt-0.5">{new Date(a.created_at).toLocaleString()} · by {a.super_admin?.name ?? 'System'} · {a.ip_address}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-sa-border text-sa-muted">{a.action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-sa-muted uppercase tracking-wider">Internal Admin Notes</h4>
              <p className="text-xs text-sa-muted">These notes are only visible to super admins.</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
                placeholder="Add notes about this tenant..." 
                className="w-full bg-sa-bg border border-sa-border rounded-xl p-4 text-sm focus:outline-none focus:border-sa-accent resize-none text-sa-text"/>
              <button onClick={handleSaveNotes} disabled={savingNotes}
                className="px-6 py-2.5 bg-sa-accent text-sa-bg rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all">
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

