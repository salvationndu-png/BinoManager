import React, { useState } from 'react';
import { 
  CreditCard, 
  Users, 
  Globe, 
  ShieldAlert, 
  Save,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Mail,
  Clock
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const TabButton = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-4 text-sm font-bold transition-all border-b-2",
      active 
        ? "border-sa-accent text-sa-accent bg-sa-accent/5" 
        : "border-transparent text-sa-muted hover:text-white hover:bg-sa-card"
    )}
  >
    {label}
  </button>
);

const FormField = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-8 border-b border-sa-border last:border-0">
    <div className="space-y-1">
      <h4 className="text-sm font-bold">{label}</h4>
      <p className="text-xs text-sa-muted leading-relaxed">{description}</p>
    </div>
    <div className="lg:col-span-2 max-w-xl">
      {children}
    </div>
  </div>
);

export const PlatformSettings = () => {
  const [activeTab, setActiveTab] = useState('billing');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
          <p className="text-sa-muted text-sm">Global configuration for trial periods, billing, branding, and system maintenance.</p>
        </div>
        <button className="flex items-center gap-2 bg-sa-accent text-sa-bg px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Save size={18} />
          Save All Changes
        </button>
      </div>

      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-sa-border bg-sa-bg/30 overflow-x-auto">
          <TabButton active={activeTab === 'billing'} label="Trial & Billing" onClick={() => setActiveTab('billing')} />
          <TabButton active={activeTab === 'limits'} label="Tenant Limits" onClick={() => setActiveTab('limits')} />
          <TabButton active={activeTab === 'branding'} label="Branding" onClick={() => setActiveTab('branding')} />
          <TabButton active={activeTab === 'maintenance'} label="Maintenance" onClick={() => setActiveTab('maintenance')} />
        </div>

        <div className="p-8">
          {activeTab === 'billing' && (
            <div className="divide-y divide-sa-border">
              <FormField 
                label="Default Trial Duration" 
                description="Number of days new tenants get for free before they must subscribe."
              >
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={14} className="w-24 bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
                  <span className="text-sm text-sa-muted font-medium">Days</span>
                </div>
              </FormField>
              <FormField 
                label="Grace Period Duration" 
                description="Days allowed after subscription expiry before auto-suspension."
              >
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={7} className="w-24 bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
                  <span className="text-sm text-sa-muted font-medium">Days</span>
                </div>
              </FormField>
              <FormField 
                label="Trial Reminder Emails" 
                description="Send automated reminders at 7, 3, and 1 day before trial expiry."
              >
                <div className="flex items-center gap-4">
                  <button className="w-12 h-6 rounded-full bg-sa-accent relative transition-colors">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-sa-bg" />
                  </button>
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              </FormField>
              <FormField 
                label="Currency Symbol" 
                description="The primary currency symbol used across the platform."
              >
                <input type="text" defaultValue="₦" className="w-24 bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent font-bold" />
              </FormField>
            </div>
          )}

          {activeTab === 'limits' && (
            <div className="divide-y divide-sa-border">
              <FormField 
                label="Default Plan" 
                description="The plan assigned to new signups by default."
              >
                <select className="w-full bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent">
                  <option>Starter (Free Trial)</option>
                  <option>Business</option>
                  <option>Enterprise</option>
                </select>
              </FormField>
              <FormField 
                label="Reserved Subdomains" 
                description="Comma-separated list of blocked slugs (e.g. admin, support, api)."
              >
                <textarea 
                  defaultValue="admin, support, api, billing, help, dev, staging, test, mail"
                  rows={4}
                  className="w-full bg-sa-bg border border-sa-border rounded-lg p-3 text-sm focus:outline-none focus:border-sa-accent font-mono"
                />
              </FormField>
              <FormField 
                label="Session Lifetime" 
                description="How long (in minutes) a user session remains active."
              >
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={120} className="w-24 bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
                  <span className="text-sm text-sa-muted font-medium">Minutes</span>
                </div>
              </FormField>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="divide-y divide-sa-border">
              <FormField 
                label="Platform Name" 
                description="The name of your SaaS platform shown in emails and UI."
              >
                <input type="text" defaultValue="BinoManager" className="w-full bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
              </FormField>
              <FormField 
                label="Platform Logo" 
                description="Used in emails, landing pages, and the dashboard header."
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-sa-bg border border-sa-border flex items-center justify-center text-sa-accent font-bold text-2xl">B</div>
                  <button className="px-4 py-2 bg-sa-bg border border-sa-border rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">Change Logo</button>
                </div>
              </FormField>
              <FormField 
                label="Support Email" 
                description="The 'From' address for system notifications."
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={16} />
                  <input type="email" defaultValue="support@binomanager.com" className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent" />
                </div>
              </FormField>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-8">
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-500 mb-1">Maintenance Mode</h4>
                  <p className="text-sm text-red-100/70 mb-4 leading-relaxed">
                    Enabling maintenance mode will block access for all tenants and redirect them to a maintenance page. 
                    Super admins will still have access to the control panel.
                  </p>
                  <button className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">
                    Enable Maintenance Mode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-sa-bg border border-sa-border rounded-2xl space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <RefreshCw size={18} className="text-sa-accent" />
                    System Cache
                  </h4>
                  <p className="text-xs text-sa-muted leading-relaxed">Clear all application, view, and config caches across the platform.</p>
                  <button className="w-full py-2 bg-sa-card border border-sa-border rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">Clear All Caches</button>
                </div>
                <div className="p-6 bg-sa-bg border border-sa-border rounded-2xl space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" />
                    Trial Expiration
                  </h4>
                  <p className="text-xs text-sa-muted leading-relaxed">Force expire all currently trialing tenants. Use with extreme caution.</p>
                  <button className="w-full py-2 bg-sa-card border border-sa-border rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">Force Expire All Trials</button>
                </div>
              </div>

              <div className="pt-8 border-t border-sa-border">
                <h4 className="font-bold text-red-500 mb-4">Danger Zone</h4>
                <div className="p-6 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold">Nuke Test Data</p>
                    <p className="text-xs text-sa-muted">Truncate all sales, products, and stock tables. Only available in local environment.</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                    Nuke Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
