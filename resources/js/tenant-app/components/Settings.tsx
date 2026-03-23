import React, { useState, useEffect } from 'react';
import { Save, Check, Upload, Info, Palette } from 'lucide-react';
import { cn, tenantUrl } from '../lib/utils';

export default function Settings() {
  const bm = (window as any).BinoManager;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [primaryColor, setPrimaryColor] = useState(bm?.settings?.primary_color || '#2563eb');
  const [secondaryColor, setSecondaryColor] = useState(bm?.settings?.secondary_color || '#1e40af');

  const settings = bm?.settings ?? {};
  const tenant = bm?.tenant ?? {};
  const isEnterprise = tenant?.planSlug?.startsWith('enterprise');

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
  }, [primaryColor, secondaryColor]);

  const handleBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    fd.append('_token', bm?.csrf ?? '');
    if (isEnterprise) {
      fd.append('primary_color', primaryColor);
      fd.append('secondary_color', secondaryColor);
    }
    try {
      const res = await fetch(tenantUrl('settings/branding'), {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': bm?.csrf ?? '', 'X-Requested-With': 'XMLHttpRequest' },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setSaved(true);
        setTimeout(() => { window.location.reload(); }, 1200);
      } else {
        setError(data.message ?? 'Failed to save settings.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Business branding and preferences</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Branding form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-5">Business Branding</h2>
        <form onSubmit={handleBranding} className="space-y-5" encType="multipart/form-data">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { l: 'Business Name', n: 'business_name', v: settings.business_name ?? tenant.name ?? '' },
              { l: 'Phone', n: 'phone', v: settings.phone ?? '' },
              { l: 'Address', n: 'address', v: settings.address ?? '' },
              { l: 'Receipt Footer', n: 'receipt_footer', v: settings.receipt_footer ?? '' },
            ].map(f => (
              <div key={f.n} className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">{f.l}</label>
                <input type="text" name={f.n} defaultValue={f.v}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none transition-shadow" />
              </div>
            ))}
          </div>

          {/* Logo upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Logo {!isEnterprise && <span className="text-amber-500">(Enterprise Only)</span>}</label>
            {settings.logo_path && (
              <div className="mb-2">
                <img src={'/storage/' + settings.logo_path} alt="Current logo" className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700" />
              </div>
            )}
            <label className={cn(
              "flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors",
              isEnterprise ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" : "cursor-not-allowed opacity-50"
            )}>
              <Upload size={18} className="text-zinc-400 flex-shrink-0" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {isEnterprise ? 'Upload logo (JPG/PNG/WebP, max 2MB)' : 'Upgrade to Enterprise to upload logo'}
              </span>
              <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={!isEnterprise} />
            </label>
          </div>

          {/* Color Scheme */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-zinc-400" />
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                Color Scheme {!isEnterprise && <span className="text-amber-500">(Enterprise Only)</span>}
              </label>
            </div>
            {!isEnterprise && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <Info size={14} />
                  Custom branding is available on the Enterprise plan. <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('bino:nav', { detail: 'billing' }))} className="underline font-semibold">Upgrade now</button>
                </p>
              </div>
            )}
            <div className={cn("grid sm:grid-cols-2 gap-4", !isEnterprise && "opacity-50 pointer-events-none")}>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={!isEnterprise}
                    className="w-14 h-14 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={!isEnterprise}
                    placeholder="#2563eb"
                    className="flex-1 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 dark:text-zinc-400">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    disabled={!isEnterprise}
                    className="w-14 h-14 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    disabled={!isEnterprise}
                    placeholder="#1e40af"
                    className="flex-1 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none" 
                  />
                </div>
              </div>
            </div>
            {isEnterprise && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Info size={12} />
                Colors will be applied to buttons, links, and accents throughout the app
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
              {saved ? <><Check size={16} /> Saved!</> : saving ? <>Saving…</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Workspace info (read-only) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
          <Info size={16} className="text-zinc-400" /> Workspace Info
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['Workspace Slug', tenant.slug],
            ['Current Plan', tenant.plan],
            ['Account Status', tenant.status],
            ['Timezone', settings.timezone ?? 'Africa/Lagos'],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{value as string || '-'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
