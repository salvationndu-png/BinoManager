import React from 'react';
import { useState, useEffect } from 'react';
import { Plus, Edit3, ShieldCheck, Globe, Zap, Lock, Check, X, Users, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost, saPatch } from '../lib/api';
import { Plan } from '../types';

const PLAN_ICONS: any = { Starter: Globe, Business: Zap, Enterprise: Lock };
const PLAN_COLORS: any = { Starter: 'text-sa-accent', Business: 'text-blue-400', Enterprise: 'text-purple-400' };

export const PlansManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState<Partial<Plan> | null>(null);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const d = await saGet('/superadmin/api/plans');
      setPlans(d.plans ?? d);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => setModalPlan({ name: '', slug: '', billing_cycle: billingCycle, price_kobo: 500000, max_users: 1, max_products: 50, features: [], is_active: true, is_popular: false, sort_order: plans.length });
  const openEdit = (plan: Plan) => setModalPlan({ ...plan, features: [...(plan.features ?? [])] });

  const handleSave = async () => {
    if (!modalPlan?.name) { showToast('Plan name is required', 'error'); return; }
    setSaving(true);
    try {
      const isEdit = !!(modalPlan as Plan).id;
      const url = isEdit ? `/superadmin/api/plans/${(modalPlan as Plan).id}` : '/superadmin/api/plans';
      const method = isEdit ? saPatch : saPost;
      await method(url, modalPlan);
      showToast(isEdit ? 'Plan updated' : 'Plan created');
      setModalPlan(null);
      await load();
    } catch (e: any) { showToast(e?.data?.message ?? 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (plan: Plan) => {
    try {
      await saPatch(`/superadmin/api/plans/${plan.id}/toggle`);
      await load();
    } catch { showToast('Toggle failed', 'error'); }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setModalPlan(p => ({ ...p!, features: [...(p?.features ?? []), featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (i: number) => setModalPlan(p => ({ ...p!, features: (p?.features ?? []).filter((_: any, idx: number) => idx !== i) }));

  const filteredPlans = plans.filter(p => p.billing_cycle === billingCycle);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm", toast.type==='success'?'bg-sa-accent':'bg-red-600')}>
          <span className="flex-1">{toast.msg}</span><button onClick={() => setToast(null)}><X size={15}/></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">Plans & Pricing</h2><p className="text-sa-muted text-sm">Manage subscription tiers. Changes apply to new signups.</p></div>
        <div className="flex items-center gap-3">
          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-sa-card border border-sa-border rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                billingCycle === 'monthly'
                  ? 'bg-sa-accent text-sa-bg shadow-sm'
                  : 'text-sa-muted hover:text-sa-text'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                billingCycle === 'annual'
                  ? 'bg-sa-accent text-sa-bg shadow-sm'
                  : 'text-sa-muted hover:text-sa-text'
              )}
            >
              Annual
              <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">-17%</span>
            </button>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-sa-accent text-sa-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-sa-accent/20">
            <Plus size={18}/> Add Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...Array(3)].map((_,i) => <div key={i} className="h-64 bg-sa-card border border-sa-border rounded-2xl animate-pulse"/>)}</div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sa-muted text-sm">No {billingCycle} plans found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map(plan => {
            const Icon = PLAN_ICONS[plan.name] ?? ShieldCheck;
            const color = PLAN_COLORS[plan.name] ?? 'text-sa-accent';
            const isAnnual = plan.billing_cycle === 'annual';
            const displayPrice = isAnnual ? (plan.price_kobo / 100 / 12) : (plan.price_kobo / 100);
            return (
              <div key={plan.id} className={cn("bg-sa-card border rounded-2xl p-6 flex flex-col relative transition-all duration-300 hover:border-sa-accent/40", plan.is_active ? 'border-sa-border/80' : 'border-sa-border opacity-60')}>
                {plan.is_popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-sa-bg bg-sa-accent px-3 py-1 rounded-full">POPULAR</div>}
                {!plan.is_active && <div className="absolute top-4 right-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest bg-sa-bg border border-sa-border px-2 py-0.5 rounded">Inactive</div>}
                <div className="mb-5">
                  <div className={cn("w-10 h-10 rounded-xl bg-sa-bg border border-sa-border flex items-center justify-center mb-4", color)}>
                    <Icon size={20}/>
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-xs text-sa-muted uppercase tracking-wider mb-1">{isAnnual ? 'Annual' : 'Monthly'}</p>
                  <p className="text-3xl font-black">
                    ₦{displayPrice.toLocaleString('en-NG', {maximumFractionDigits: 0})}
                    <span className="text-sm font-normal text-sa-muted">/mo</span>
                  </p>
                  {isAnnual && <p className="text-xs text-sa-muted mt-1">₦{(plan.price_kobo / 100).toLocaleString()} billed annually</p>}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 text-sa-muted"><Users size={13}/>{plan.max_users === 0 ? 'Unlimited users' : `${plan.max_users} users`}</div>
                  <div className="flex items-center gap-1.5 text-sa-muted"><Package size={13}/>{plan.max_products === 0 ? 'Unlimited products' : `${plan.max_products} products`}</div>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {(plan.features ?? []).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-sa-muted"><Check size={14} className="text-sa-accent mt-0.5 shrink-0"/>{f}</li>
                  ))}
                </ul>
                {plan.subscribers_count != null && (
                  <p className="text-[10px] text-sa-muted mb-4 border-t border-sa-border pt-4">{plan.subscribers_count} active subscriber{plan.subscribers_count !== 1 ? 's' : ''}</p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(plan)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold border border-sa-border text-sa-muted hover:border-sa-accent/50 hover:text-sa-text transition-colors">
                    <Edit3 size={14}/> Edit
                  </button>
                  <button onClick={() => handleToggle(plan)} className={cn("flex-1 py-2 rounded-lg text-xs font-bold border transition-colors", plan.is_active ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10' : 'border-sa-accent/20 text-sa-accent hover:bg-sa-accent/10')}>
                    {plan.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan modal */}
      {modalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalPlan(null)}/>
          <div className="relative bg-sa-card border border-sa-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">{(modalPlan as Plan).id ? 'Edit Plan' : 'Create New Plan'}</h3>
              <button onClick={() => setModalPlan(null)} className="text-sa-muted hover:text-sa-text"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Plan Name</label>
                  <input value={modalPlan.name ?? ''} onChange={e => setModalPlan(p => ({...p!, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g,'-') + '-' + (p?.billing_cycle ?? 'monthly')}))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Billing Cycle</label>
                  <select value={modalPlan.billing_cycle ?? 'monthly'} onChange={e => setModalPlan(p => ({...p!, billing_cycle: e.target.value as 'monthly'|'annual', slug: (p?.name ?? '').toLowerCase().replace(/\s+/g,'-') + '-' + e.target.value}))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text">
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">
                    {modalPlan.billing_cycle === 'annual' ? 'Annual Price (₦)' : 'Monthly Price (₦)'}
                  </label>
                  <input type="number" value={Math.round((modalPlan.price_kobo ?? 0) / 100)} onChange={e => setModalPlan(p => ({...p!, price_kobo: Number(e.target.value) * 100}))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text" min="0"/>
                  {modalPlan.billing_cycle === 'annual' && modalPlan.price_kobo && (
                    <p className="text-xs text-sa-muted">≈ ₦{Math.round((modalPlan.price_kobo / 100) / 12).toLocaleString()}/month</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Sort Order</label>
                  <input type="number" value={modalPlan.sort_order ?? 0} onChange={e => setModalPlan(p => ({...p!, sort_order: Number(e.target.value)}))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text" min="0"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Max Users (0=unlimited)</label>
                  <input type="number" value={modalPlan.max_users ?? 1} onChange={e => setModalPlan(p => ({...p!, max_users: Number(e.target.value)}))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text" min="0"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Max Products (0=unlimited)</label>
                  <input type="number" value={modalPlan.max_products ?? 50} onChange={e => setModalPlan(p => ({...p!, max_products: Number(e.target.value)}))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text" min="0"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Features</label>
                <ul className="space-y-1 mb-2">{(modalPlan.features ?? []).map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm"><Check size={13} className="text-sa-accent shrink-0"/><span className="flex-1">{f}</span><button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300"><X size={13}/></button></li>
                ))}</ul>
                <div className="flex gap-2">
                  <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeature()} placeholder="Add a feature..." className="flex-1 bg-sa-bg border border-sa-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sa-accent text-sa-text"/>
                  <button onClick={addFeature} className="px-3 py-2 bg-sa-accent/10 border border-sa-accent/20 text-sa-accent rounded-lg text-sm font-bold hover:bg-sa-accent/20 transition-colors"><Plus size={15}/></button>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={modalPlan.is_active ?? true} onChange={e => setModalPlan(p => ({...p!, is_active: e.target.checked}))} className="w-4 h-4 accent-sa-accent"/>
                <span className="text-sm font-medium">Active (visible to new signups)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={modalPlan.is_popular ?? false} onChange={e => setModalPlan(p => ({...p!, is_popular: e.target.checked}))} className="w-4 h-4 accent-sa-accent"/>
                <span className="text-sm font-medium">Mark as "Most Popular"</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalPlan(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-sa-bg border border-sa-border text-sa-muted hover:border-sa-border/80 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-sa-accent text-sa-bg hover:bg-emerald-400 disabled:opacity-50 transition-all">
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

