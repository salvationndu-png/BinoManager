import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Globe, Clock } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  slug: string;
  billing_cycle: 'monthly' | 'annual';
  price_kobo: number;
  price_naira: string;
  monthly_equivalent?: string;
  annual_savings?: number;
  max_users: number;
  max_products: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  current?: boolean;
}

export default function Billing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/public/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/billing');
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const filteredPlans = plans.filter(p => p.billing_cycle === billingCycle);

  const handleUpgrade = (planId: number) => {
    window.location.href = `/pricing?plan=${planId}`;
  };

  const handleUpgradeToAnnual = () => {
    window.location.href = '/subscription/upgrade';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Billing & Subscription</h1>
        <p className="text-zinc-500 mt-1 dark:text-zinc-400">Manage your plan, payment methods, and billing history.</p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="bg-primary-600 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-primary-600/20">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">Current Plan</span>
              <h2 className="text-4xl font-bold mt-4">{currentPlan.plan?.name} Plan</h2>
              <p className="text-primary-100 mt-2">
                {currentPlan.plan?.billing_cycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
                {currentPlan.next_payment_date && ` • Next billing: ${new Date(currentPlan.next_payment_date).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-3">
              {currentPlan.plan?.billing_cycle === 'monthly' && (
                <button 
                  onClick={handleUpgradeToAnnual}
                  className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <Zap size={16} />
                  Upgrade to Annual (Save 17%)
                </button>
              )}
              <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
                Manage
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-700 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-30"></div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Annual
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Plans Comparison */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const isCurrent = currentPlan?.plan?.id === plan.id;
            return (
              <div 
                key={plan.id} 
                className={`bg-white p-8 rounded-2xl border relative ${
                  plan.is_popular ? 'border-primary-600 ring-2 ring-primary-600' : 'border-zinc-200'
                } shadow-sm flex flex-col dark:bg-zinc-900 dark:border-zinc-800 ${
                  plan.is_popular ? 'dark:border-primary-500 dark:ring-primary-500' : ''
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-zinc-900 text-white text-xs font-semibold px-4 py-1 rounded-full dark:bg-zinc-100 dark:text-zinc-900">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold dark:text-zinc-100">{plan.name}</h3>
                
                {/* Annual Plan Display */}
                {billingCycle === 'annual' ? (
                  <>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold dark:text-zinc-100">
                        {plan.price_naira}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400">/year</span>
                    </div>
                    {plan.annual_savings && plan.annual_savings > 0 && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full dark:bg-green-900/20 dark:text-green-400">
                        <Check size={14} />
                        Save ₦{plan.annual_savings.toLocaleString()} per year
                      </div>
                    )}
                  </>
                ) : (
                  /* Monthly Plan Display */
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold dark:text-zinc-100">
                      {plan.price_naira}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                  </div>
                )}
                
                <ul className="mt-8 space-y-4 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm dark:text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                        <Check size={12} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => !isCurrent && handleUpgrade(plan.id)}
                  disabled={isCurrent}
                  className={`w-full mt-8 py-3 rounded-xl font-bold transition-all ${
                    isCurrent
                      ? 'bg-zinc-100 text-zinc-400 cursor-default dark:bg-zinc-800 dark:text-zinc-500' 
                      : plan.is_popular
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                      : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Switch to ' + plan.name}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade Prompt for Monthly Users */}
      {currentPlan?.plan?.billing_cycle === 'monthly' && (
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

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-bold text-lg dark:text-zinc-100">Payment Methods</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center font-bold italic text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">CARD</div>
              <div>
                <p className="text-sm font-bold dark:text-zinc-100">Paystack Payment</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Secure payment via Paystack</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase dark:bg-zinc-800 dark:text-zinc-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
