import React from 'react';
import { useState, useEffect } from 'react';
import { User, Lock, ShieldCheck, History, X, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost } from '../lib/api';

export const AdminProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [myActivity, setMyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info'|'password'|'activity'>('info');
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    Promise.all([saGet('/superadmin/api/profile'), saGet('/superadmin/api/audit?per_page=20&self=1')])
      .then(([p, a]) => { setProfile(p.admin ?? p); setMyActivity(a.data ?? []); })
      .catch((e: any) => console.error('[AdminProfile]', e.message))
      .finally(() => setLoading(false));
  }, []);

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) { showToast('Passwords do not match', 'error'); return; }
    setSaving(true);
    try {
      await saPost('/superadmin/api/profile/change-password', pwForm);
      showToast('Password updated successfully');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (e: any) {
      const errors = e?.data?.errors;
      showToast(errors ? Object.values(errors).flat().join(' ') : (e?.data?.message ?? 'Failed'), 'error');
    } finally { setSaving(false); }
  };

  const sa = window.SuperAdmin?.admin;
  const initials = (profile?.name ?? sa?.name ?? 'SA').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm", toast.type==='success'?'bg-sa-accent':'bg-red-600')}>
          <span className="flex-1">{toast.msg}</span><button onClick={() => setToast(null)}><X size={15}/></button>
        </div>
      )}

      <div><h2 className="text-2xl font-bold tracking-tight">My Profile</h2><p className="text-sa-muted text-sm">Manage your super admin account</p></div>

      {/* Profile card */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sa-accent to-emerald-400 flex items-center justify-center font-bold text-sa-bg text-2xl shadow-lg shadow-sa-accent/20 shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold">{profile?.name ?? sa?.name}</p>
          <p className="text-sa-muted text-sm">{profile?.email ?? sa?.email}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-sa-muted">
              <ShieldCheck size={13} className="text-sa-accent"/> Super Administrator
            </span>
            {(profile?.last_login_at || sa?.lastLogin) && (
              <span className="flex items-center gap-1.5 text-xs text-sa-muted">
                <Globe size={13}/> Last login: {new Date(profile?.last_login_at || sa?.lastLogin).toLocaleString()}{(profile?.last_login_ip || sa?.lastLoginIp) && ` · ${profile?.last_login_ip || sa?.lastLoginIp}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-sa-border">
          {([['info','Personal Info',User],['password','Change Password',Lock],['activity','My Activity',History]] as const).map(([t, label, Icon]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-colors",
                tab === t ? 'border-sa-accent text-sa-accent' : 'border-transparent text-sa-muted hover:text-sa-text')}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'info' && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['Full Name', profile?.name ?? sa?.name],
                  ['Email Address', profile?.email ?? sa?.email],
                  ['Account Status', 'Active'],
                  ['Role', 'Super Administrator'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-[10px] font-bold text-sa-muted uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold">{value as string}</p>
                  </div>
                ))}
              </div>
              <hr className="border-sa-border"/>
              <div>
                <p className="text-[10px] font-bold text-sa-muted uppercase tracking-wider mb-1">Last Login</p>
                <p className="text-sm font-semibold">{profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString() : '—'}</p>
                {profile?.last_login_ip && <p className="text-xs text-sa-muted mt-0.5">from {profile.last_login_ip}</p>}
              </div>
            </div>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePwChange} className="space-y-4 max-w-sm">
              <p className="text-xs text-sa-muted">Password must be at least 12 characters with mixed case and numbers.</p>
              {[
                { key: 'current_password', label: 'Current Password' },
                { key: 'password', label: 'New Password' },
                { key: 'password_confirmation', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">{label}</label>
                  <input type="password" value={(pwForm as any)[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-sa-bg border border-sa-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sa-accent text-sa-text" required/>
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-sa-accent text-sa-bg rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-sa-accent/20">
                <Lock size={16}/>{saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {tab === 'activity' && (
            <div>
              <p className="text-xs text-sa-muted mb-4">Your last 20 admin actions</p>
              {loading ? <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-sa-bg border border-sa-border rounded-lg animate-pulse"/>)}</div>
              : myActivity.length === 0 ? <p className="text-sa-muted text-sm">No activity recorded yet</p>
              : (
                <div className="space-y-2">
                  {myActivity.map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-sa-bg border border-sa-border rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-sa-accent mt-2 shrink-0"/>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.description}</p>
                        <p className="text-[10px] text-sa-muted mt-0.5">{new Date(a.created_at).toLocaleString()}{a.tenant && ` — ${a.tenant.name}`}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-sa-border text-sa-muted shrink-0">{a.action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

