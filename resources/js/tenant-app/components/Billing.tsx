import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import { cn, tenantUrl } from '../lib/utils';

interface Plan {
  id: number;
  name: string;
  slug: string;
  billing_cycle: 'monthly' | 'annual';
  price_kobo: number;
  price_naira?: string;
  monthly_equivalent?: string;
  annual_savings?: number;
  max_users: number;
  max_products: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

export default function Billing() {
  const bm = (window as any).BinoManager;
  const tenant = bm?.tenant;
  const billing = bm?.billing;
  const paymentHistory = billing?.paymentHistory ?? [];
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/public/plans');
      const data = await response.json();
      setAllPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = allPlans.filter(p => p.billing_cycle === billingCycle);

  const handleCheckout = (planId: number) => {
    const csrf = bm?.csrf ?? '';
    const qs = '';
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = tenantUrl('billing/checkout');
    const t = document.createElement('input');
    t.type = 'hidden';
    t.name = '_token';
    t.value = csrf;
    const p = document.createElement('input');
    p.type = 'hidden';
    p.name = 'plan_id';
    p.value = String(planId);
    form.appendChild(t);
    form.appendChild(p);
    document.body.appendChild(form);
    form.submit();
  };

  const handleUpgradeToAnnual = () => {
    window.location.href = tenantUrl('subscription/upgrade');
  };

  const currentPlanBillingCycle = billing?.activePlan?.plan?.billing_cycle;

  return (
    <div className="space-y-8 pb-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Billing & Subscription</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your plan and payment history</p>
      </div>

      <div className="bg-primary-600 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-primary-600/20">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 70% 50%,white 0%,transparent 60%)'}}/>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">Current Plan</span>
            <h2 className="text-3xl font-bold mt-3">{tenant?.plan ?? 'Starter'}</h2>
            <p className="text-primary-200 mt-1 text-sm">
              {tenant?.status === 'trialing'
                ? `Free trial — ${tenant?.trialDaysLeft ?? 0} days remaining`
                : tenant?.status === 'active' ? 'Active subscription' : `Status: ${tenant?.status}`}
            </p>
            {currentPlanBillingCycle && (
              <p className="text-primary-100 mt-1 text-xs">
                {currentPlanBillingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
              </p>
            )}
          </div>
          {currentPlanBillingCycle === 'monthly' && (
            <button 
              onClick={handleUpgradeToAnnual}
              className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-zinc-100 transition-colors flex items-center gap-2"
            >
              <Zap size={16} />
              Upgrade to Annual (Save 17%)
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Prompt for Monthly Users */}
      {currentPlanBillingCycle === 'monthly' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 dark:from-green-900/10 dark:to-emerald-900/10 dark:border-green-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-green-900 dark:text-green-100">Save 17% with Annual Billing</h3>
              <p className="text-green-700 text-sm mt-1 dark:text-green-300">
                Upgrade to annual billing and get 2 months free! Plus, get a prorated discount for your remaining monthly subscription time.
              </p>
              <button 
                onClick={handleUpgradeToAnnual}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View Upgrade Options
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              billingCycle === 'annual'
                ? 'bg-primary-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            Annual
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all",
              billingCycle === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading plans...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            // Check if this plan matches the current subscription
            const currentPlanId = billing?.activePlan?.plan_id;
            const currentPlanName = tenant?.plan?.toLowerCase();
            const isCurrent = currentPlanId === plan.id || currentPlanName === plan.name?.toLowerCase();
            
            return (
              <div key={plan.id} className={cn(
                "bg-white dark:bg-zinc-900 rounded-2xl border-2 p-6 shadow-sm transition-all relative",
                plan.is_popular ? 'border-primary-600 shadow-lg shadow-primary-600/10' : 'border-zinc-200 dark:border-zinc-800'
              )}>
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-zinc-900 text-white text-xs font-semibold px-4 py-1 rounded-full dark:bg-zinc-100 dark:text-zinc-900">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrent && <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Current Plan</div>}
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
                
                {/* Annual Plan Display */}
                {billingCycle === 'annual' ? (
                  <>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      {plan.price_naira || `₦${(plan.price_kobo / 100).toLocaleString()}`}
                      <span className="text-sm font-normal text-zinc-400">/year</span>
                    </p>
                    {plan.annual_savings && plan.annual_savings > 0 && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full dark:bg-green-900/20 dark:text-green-400">
                        <Check size={14} />
                        Save ₦{plan.annual_savings.toLocaleString()} per year
                      </div>
                    )}
                  </>
                ) : (
                  /* Monthly Plan Display */
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                    {plan.price_naira || `₦${(plan.price_kobo / 100).toLocaleString()}`}
                    <span className="text-sm font-normal text-zinc-400">/month</span>
                  </p>
                )}
                
                <ul className="mt-4 space-y-2">
                  {plan.max_users != null && (
                    <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Check size={14} className="text-emerald-500 flex-shrink-0"/>
                      {plan.max_users === 0 ? 'Unlimited' : plan.max_users} team members
                    </li>
                  )}
                  {plan.max_products != null && (
                    <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Check size={14} className="text-emerald-500 flex-shrink-0"/>
                      {plan.max_products === 0 ? 'Unlimited' : plan.max_products} products
                    </li>
                  )}
                  {(plan.features ?? []).map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Check size={14} className="text-emerald-500 flex-shrink-0"/>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => !isCurrent && handleCheckout(plan.id)} disabled={isCurrent}
                  className={cn("w-full mt-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                    isCurrent
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 cursor-default'
                      : plan.is_popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                        : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700')}>
                  {isCurrent ? 'Current Plan' : 'Switch to ' + plan.name}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {paymentHistory.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Payment History</h3>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {paymentHistory.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 grid place-items-center flex-shrink-0">
                  <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Subscription Payment</p>
                  <p className="text-xs text-zinc-400">{p.processed_at ? new Date(p.processed_at).toLocaleDateString() : ''}</p>
                </div>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">₦{Number(p.amount ?? 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
