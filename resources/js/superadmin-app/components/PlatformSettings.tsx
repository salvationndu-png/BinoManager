import React from 'react';
import { useState, useEffect } from 'react';
import { Save, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost } from '../lib/api';

const Tab = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={cn("px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors",
    active ? "border-sa-accent text-sa-accent" : "border-transparent text-sa-muted hover:text-sa-text")}>
    {label}
  </button>
);

const Field = ({ label, children, hint }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-sa-muted">{hint}</p>}
  </div>
);

export const PlatformSettings = () => {
  const [tab, setTab] = useState<'billing'|'branding'|'limits'|'danger'>('billing');
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    saGet('/superadmin/api/settings')
      .then(d => setSettings(d.settings ?? d))
      .catch(e => showToast(e.message ?? 'Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, val: any) => setSettings((p: any) => ({ ...p, [key]: val }));

  const save = async (section: string) => {
    setSaving(true);
    try {
      await saPost(`/superadmin/api/settings/${section}`, settings);
      showToast('Settings saved successfully');
    } catch (e: any) { showToast(e?.data?.message ?? 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const dangerAction = async (action: string) => {
    try {
      await saPost(`/superadmin/api/settings/${action}`);
      showToast(action === 'clear-cache' ? 'All caches cleared' : 'Action completed');
    } catch (e: any) { showToast(e?.data?.message ?? 'Action failed', 'error'); }
    finally { setConfirmAction(null); }
  };

  const inp = "w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text transition-colors";
  const toggle = (key: string) => (
    <button onClick={() => set(key, !settings[key])}
      className={cn("relative w-11 h-6 rounded-full transition-colors shrink-0", settings[key] ? 'bg-sa-accent' : 'bg-sa-border')}>
      <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", settings[key] ? 'translate-x-5' : 'translate-x-0.5')}/>
    </button>
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm", toast.type==='success'?'bg-sa-accent':'bg-red-600')}>
          <span className="flex-1">{toast.msg}</span><button onClick={() => setToast(null)}><X size={15}/></button>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)}/>
          <div className="relative bg-sa-card border border-sa-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 grid place-items-center shrink-0"><AlertTriangle size={20} className="text-red-400"/></div>
              <div><h3 className="font-bold mb-1">Confirm Dangerous Action</h3><p className="text-sa-muted text-sm">This action cannot be undone. Are you sure?</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-sa-bg border border-sa-border text-sa-muted">Cancel</button>
              <button onClick={() => dangerAction(confirmAction)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-sa-muted text-sm">Global configuration for the BinoManager platform</p>
      </div>

      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-sa-border">
          <Tab label="Trial & Billing" active={tab==='billing'} onClick={() => setTab('billing')}/>
          <Tab label="Branding" active={tab==='branding'} onClick={() => setTab('branding')}/>
          <Tab label="Limits & Defaults" active={tab==='limits'} onClick={() => setTab('limits')}/>
          <Tab label="Danger Zone" active={tab==='danger'} onClick={() => setTab('danger')}/>
        </div>

        {loading ? <div className="p-8 flex justify-center"><RefreshCw size={24} className="animate-spin text-sa-muted"/></div> : (
          <div className="p-6">

            {tab === 'billing' && (
              <div className="space-y-6 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Default Trial Duration (days)" hint="How long new tenants get a free trial">
                    <input type="number" value={settings.trial_days ?? 14} onChange={e => set('trial_days', e.target.value)} className={inp} min="1" max="90"/>
                  </Field>
                  <Field label="Grace Period (days)" hint="Extra time after subscription expires">
                    <input type="number" value={settings.grace_days ?? 7} onChange={e => set('grace_days', e.target.value)} className={inp} min="1" max="30"/>
                  </Field>
                </div>
                <Field label="Support Email" hint="Used in all billing and trial notification emails">
                  <input type="email" value={settings.support_email ?? ''} onChange={e => set('support_email', e.target.value)} className={inp} placeholder="support@binomanager.com"/>
                </Field>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Email Reminders</label>
                  {[
                    { key: 'trial_reminder_7d', label: 'Trial expiry — 7 days before' },
                    { key: 'trial_reminder_3d', label: 'Trial expiry — 3 days before' },
                    { key: 'trial_reminder_1d', label: 'Trial expiry — 1 day before' },
                    { key: 'grace_reminder',    label: 'Grace period start email' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-sa-border last:border-0">
                      <span className="text-sm">{label}</span>
                      {toggle(key)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between py-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4">
                  <div>
                    <p className="text-sm font-bold text-red-400">Auto-suspend on grace expiry</p>
                    <p className="text-[10px] text-sa-muted mt-0.5">Automatically suspends tenants when grace period ends</p>
                  </div>
                  {toggle('auto_suspend')}
                </div>
                <button onClick={() => save('billing')} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sa-accent text-sa-bg rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-sa-accent/20">
                  <Save size={16}/>{saving ? 'Saving...' : 'Save Billing Settings'}
                </button>
              </div>
            )}

            {tab === 'branding' && (
              <div className="space-y-6 max-w-xl">
                <Field label="Platform Name" hint="Shown in emails and the admin sidebar">
                  <input value={settings.platform_name ?? 'BinoManager'} onChange={e => set('platform_name', e.target.value)} className={inp}/>
                </Field>
                <Field label="Landing Page Headline" hint="Main tagline on the tenant registration page">
                  <input value={settings.landing_headline ?? ''} onChange={e => set('landing_headline', e.target.value)} className={inp} placeholder="The smarter way to manage wholesale"/>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Terms of Service URL">
                    <input value={settings.tos_url ?? ''} onChange={e => set('tos_url', e.target.value)} className={inp} placeholder="https://..."/>
                  </Field>
                  <Field label="Privacy Policy URL">
                    <input value={settings.privacy_url ?? ''} onChange={e => set('privacy_url', e.target.value)} className={inp} placeholder="https://..."/>
                  </Field>
                </div>
                <button onClick={() => save('branding')} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sa-accent text-sa-bg rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-sa-accent/20">
                  <Save size={16}/>{saving ? 'Saving...' : 'Save Branding'}
                </button>
              </div>
            )}

            {tab === 'limits' && (
              <div className="space-y-6 max-w-xl">
                <Field label="Session Lifetime (minutes)" hint="How long tenant sessions stay active">
                  <input type="number" value={settings.session_lifetime ?? 120} onChange={e => set('session_lifetime', e.target.value)} className={inp} min="15" max="1440"/>
                </Field>
                <Field label="Login Throttle (attempts/minute)" hint="Per-IP rate limit for tenant login">
                  <input type="number" value={settings.login_throttle ?? 5} onChange={e => set('login_throttle', e.target.value)} className={inp} min="3" max="20"/>
                </Field>
                <Field label="Reserved Slugs" hint="Comma-separated workspace slugs that cannot be registered (e.g. admin, api, www)">
                  <textarea value={settings.reserved_slugs ?? ''} onChange={e => set('reserved_slugs', e.target.value)} rows={3}
                    className={cn(inp, "resize-none")} placeholder="admin, api, www, app, dashboard, billing, superadmin"/>
                </Field>
                <button onClick={() => save('limits')} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sa-accent text-sa-bg rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-sa-accent/20">
                  <Save size={16}/>{saving ? 'Saving...' : 'Save Limits'}
                </button>
              </div>
            )}

            {tab === 'danger' && (
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <AlertTriangle size={18} className="text-red-400 shrink-0"/>
                  <p className="text-sm text-red-400">These actions affect all tenants. Use with extreme caution.</p>
                </div>
                {[
                  { action: 'clear-cache', label: 'Clear All Caches', desc: 'Clears config, views, and application cache. Safe to run at any time.', color: 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10' },
                  { action: 'toggle-maintenance', label: settings.maintenance_mode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode', desc: 'Blocks tenant dashboard access for all users. Super admin retains access.', color: 'border-red-500/20 text-red-400 hover:bg-red-500/10' },
                ].map(({ action, label, desc, color }) => (
                  <div key={action} className="flex items-center justify-between p-5 bg-sa-bg border border-sa-border rounded-xl gap-4">
                    <div>
                      <p className="font-bold text-sm">{label}</p>
                      <p className="text-xs text-sa-muted mt-0.5">{desc}</p>
                    </div>
                    <button onClick={() => setConfirmAction(action)}
                      className={cn("px-4 py-2 rounded-lg text-xs font-bold border transition-colors shrink-0", color)}>
                      Run
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

