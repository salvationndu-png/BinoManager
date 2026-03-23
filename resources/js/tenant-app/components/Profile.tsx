import React, { useState, useEffect } from 'react';
import { User, Shield, Lock, Monitor, Mail, Building2, Eye, EyeOff, Loader2, Check, AlertCircle, Smartphone, Copy, RefreshCw, X } from 'lucide-react';
import { apiPut, apiGet, apiDelete, apiPost } from '../lib/api';
import { cn } from '../lib/utils';

interface Session {
  agent: { is_desktop: boolean; platform: string; browser: string };
  ip_address: string;
  is_current_device: boolean;
  last_active: string;
}

interface TwoFactorData {
  enabled: boolean;
  confirmed: boolean;
  svg?: string;
  secret?: string;
  recovery_codes?: string[];
}

export default function Profile() {
  const bm = (window as any).BinoManager;
  const user = bm?.user;
  const tenant = bm?.tenant;
  const [tab, setTab] = useState<'info' | 'password' | 'sessions' | 'two-factor'>('info');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  
  // Email change
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailChangeForm, setEmailChangeForm] = useState({ new_email: '', password: '', code: '' });
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [emailChangeStep, setEmailChangeStep] = useState<'request' | 'verify'>('request');
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  
  // Logout sessions
  const [logoutPassword, setLogoutPassword] = useState('');
  const [showLogoutPassword, setShowLogoutPassword] = useState(false);

  // Two-Factor Authentication
  const [twoFactor, setTwoFactor] = useState<TwoFactorData>({ enabled: false, confirmed: false });
  const [confirmCode, setConfirmCode] = useState('');
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (tab === 'sessions') loadSessions();
    if (tab === 'two-factor') loadTwoFactorStatus();
  }, [tab]);

  const loadSessions = async () => {
    try {
      const data = await apiGet<{sessions: Session[]}>('/api/profile/sessions');
      setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTwoFactorStatus = async () => {
    try {
      const data = await apiGet<TwoFactorData>('/api/profile/two-factor');
      setTwoFactor(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await apiPut('/api/profile', { name: profileForm.name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiPost('/api/profile/email/request', {
        new_email: emailChangeForm.new_email,
        password: emailChangeForm.password,
      });
      setPendingEmail(response.pending_email);
      setEmailChangeStep('verify');
      setMessage({ type: 'success', text: response.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send verification code' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiPost('/api/profile/email/confirm', { code: emailChangeForm.code });
      setMessage({ type: 'success', text: response.message });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmailChange = async () => {
    setLoading(true);
    try {
      await apiPost('/api/profile/email/cancel', {});
      setShowEmailChange(false);
      setEmailChangeForm({ new_email: '', password: '', code: '' });
      setPendingEmail(null);
      setEmailChangeStep('request');
      setMessage({ type: 'success', text: 'Email change cancelled' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to cancel email change' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await apiPut('/api/profile/password', passwordForm);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOtherSessions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await apiDelete('/api/profile/sessions', { password: logoutPassword });
      setMessage({ type: 'success', text: 'Other sessions logged out successfully!' });
      setLogoutPassword('');
      loadSessions();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to logout sessions' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiPost<TwoFactorData>('/api/profile/two-factor', {});
      setTwoFactor({ ...data, enabled: true, confirmed: false });
      setMessage({ type: 'success', text: 'Scan the QR code with your authenticator app' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to enable 2FA' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiPost<{recovery_codes: string[]}>('/api/profile/two-factor/confirm', { code: confirmCode });
      setTwoFactor({ enabled: true, confirmed: true, recovery_codes: data.recovery_codes });
      setShowRecoveryCodes(true);
      setConfirmCode('');
      setMessage({ type: 'success', text: '2FA enabled successfully! Save your recovery codes.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;
    setLoading(true);
    setMessage(null);
    try {
      await apiDelete('/api/profile/two-factor');
      setTwoFactor({ enabled: false, confirmed: false });
      setShowRecoveryCodes(false);
      setMessage({ type: 'success', text: '2FA disabled successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to disable 2FA' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowRecoveryCodes = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{recovery_codes: string[]}>('/api/profile/two-factor/recovery-codes');
      setTwoFactor({ ...twoFactor, recovery_codes: data.recovery_codes });
      setShowRecoveryCodes(true);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load recovery codes' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    if (!confirm('Are you sure? This will invalidate your current recovery codes.')) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiPost<{recovery_codes: string[]}>('/api/profile/two-factor/recovery-codes', {});
      setTwoFactor({ ...twoFactor, recovery_codes: data.recovery_codes });
      setShowRecoveryCodes(true);
      setMessage({ type: 'success', text: 'Recovery codes regenerated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to regenerate codes' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-8 px-4 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight dark:text-zinc-100">Profile Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your account details and security</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary-600 grid place-items-center text-white font-bold text-xl sm:text-2xl shadow-lg shadow-primary-600/20 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 truncate">{user?.name}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-zinc-400" />
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <Building2 size={13} className="text-zinc-400" />
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">{tenant?.name}</p>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
              user?.isAdmin ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            )}>
              {user?.isAdmin ? 'Admin' : 'Sales Staff'}
            </span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "rounded-xl p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
        )}>
          <div className="flex-shrink-0">
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <p className="text-xs sm:text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
        {[
          { id: 'info', label: 'Personal Info', icon: User, shortLabel: 'Info' },
          { id: 'password', label: 'Password', icon: Lock, shortLabel: 'Password' },
          { id: 'two-factor', label: '2FA', icon: Smartphone, shortLabel: '2FA' },
          { id: 'sessions', label: 'Sessions', icon: Monitor, shortLabel: 'Sessions' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center",
              tab === t.id
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            )}>
            <t.icon size={14} className="sm:w-[15px] sm:h-[15px]" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6">
        {tab === 'info' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 mb-1">Profile Information</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Update your account's profile information and email address</p>
            </div>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailChange(true)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 border-2 border-primary-600 dark:border-primary-400 rounded-lg sm:rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors whitespace-nowrap"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Email Change Modal */}
        {showEmailChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Change Email Address</h2>
                <button
                  onClick={() => {
                    setShowEmailChange(false);
                    setEmailChangeForm({ new_email: '', password: '', code: '' });
                    setEmailChangeStep('request');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailChangeStep === 'request' ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your new email address and confirm your password
                  </p>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">New Email Address</label>
                    <input
                      type="email"
                      value={emailChangeForm.new_email}
                      onChange={(e) => setEmailChangeForm({...emailChangeForm, new_email: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={emailChangeForm.password}
                      onChange={(e) => setEmailChangeForm({...emailChangeForm, password: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      We've sent a 6-digit code to <strong>{pendingEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={emailChangeForm.code}
                      onChange={(e) => setEmailChangeForm({...emailChangeForm, code: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-center text-2xl tracking-widest"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || emailChangeForm.code.length !== 6}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {loading ? 'Verifying...' : 'Verify & Change'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEmailChange}
                      disabled={loading}
                      className="px-6 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 mb-1">Update Password</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Ensure your account is using a long, random password to stay secure</p>
            </div>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
                  >
                    {showPasswords.current ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
                  >
                    {showPasswords.new ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {tab === 'sessions' && (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 mb-1">Browser Sessions</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Manage and logout your active sessions on other browsers and devices</p>
            </div>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            
            {sessions.length === 0 ? (
              <p className="text-xs sm:text-sm text-zinc-400 text-center py-8">No active sessions</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {sessions.map((session, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      <Monitor size={18} className="sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {session.agent.platform} - {session.agent.browser}
                      </p>
                      <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                        {session.ip_address} • {session.last_active}
                      </p>
                      {session.is_current_device && (
                        <span className="inline-block mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          This Device
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sessions.length > 1 && (
              <form onSubmit={handleLogoutOtherSessions} className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Confirm Password to Logout Other Sessions
                  </label>
                  <div className="relative">
                    <input
                      type={showLogoutPassword ? 'text' : 'password'}
                      value={logoutPassword}
                      onChange={(e) => setLogoutPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLogoutPassword(!showLogoutPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
                    >
                      {showLogoutPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  {loading ? 'Logging Out...' : 'Logout Other Sessions'}
                </button>
              </form>
            )}
          </div>
        )}

        {tab === 'two-factor' && (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 mb-1">Two-Factor Authentication</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {twoFactor.enabled && twoFactor.confirmed
                  ? 'You have enabled two-factor authentication.'
                  : twoFactor.enabled
                  ? 'Finish enabling two-factor authentication.'
                  : 'Add additional security to your account using two-factor authentication.'}
              </p>
            </div>
            <hr className="border-zinc-100 dark:border-zinc-800" />

            {!twoFactor.enabled ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
                  </p>
                </div>
                <button
                  onClick={handleEnableTwoFactor}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
                  {loading ? 'Enabling...' : 'Enable 2FA'}
                </button>
              </div>
            ) : !twoFactor.confirmed ? (
              <div className="space-y-4 sm:space-y-5">
                <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl border border-amber-100 dark:border-amber-800">
                  <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                    To finish enabling two-factor authentication, scan the following QR code using your phone's authenticator application or enter the setup key and provide the generated OTP code.
                  </p>
                </div>

                {twoFactor.svg && (
                  <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-zinc-800 rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div dangerouslySetInnerHTML={{ __html: twoFactor.svg }} className="[&>svg]:w-40 [&>svg]:h-40 sm:[&>svg]:w-48 sm:[&>svg]:h-48" />
                    {twoFactor.secret && (
                      <div className="text-center w-full">
                        <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Setup Key</p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <code className="px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 break-all">
                            {twoFactor.secret}
                          </code>
                          <button
                            onClick={() => copyToClipboard(twoFactor.secret!)}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                            title="Copy to clipboard"
                          >
                            {copiedCode ? <Check size={14} className="sm:w-4 sm:h-4 text-emerald-500" /> : <Copy size={14} className="sm:w-4 sm:h-4 text-zinc-400" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleConfirmTwoFactor} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Confirmation Code</label>
                    <input
                      type="text"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-center text-base sm:text-lg tracking-widest"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={loading || confirmCode.length !== 6}
                      className="flex-1 flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {loading ? 'Confirming...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisableTwoFactor}
                      disabled={loading}
                      className="px-5 sm:px-6 py-2.5 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check size={18} className="sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Two-factor authentication is enabled and protecting your account.
                  </p>
                </div>

                {showRecoveryCodes && twoFactor.recovery_codes && (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl border border-amber-100 dark:border-amber-800">
                      <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two-factor authentication device is lost.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg sm:rounded-xl">
                      {twoFactor.recovery_codes.map((code, i) => (
                        <code key={i} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-zinc-900 rounded-lg text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                    <button
                      onClick={() => copyToClipboard(twoFactor.recovery_codes!.join('\n'))}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {copiedCode ? <Check size={14} className="sm:w-4 sm:h-4" /> : <Copy size={14} className="sm:w-4 sm:h-4" />}
                      {copiedCode ? 'Copied!' : 'Copy All Codes'}
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  {!showRecoveryCodes && (
                    <button
                      onClick={handleShowRecoveryCodes}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                      Show Recovery Codes
                    </button>
                  )}
                  {showRecoveryCodes && (
                    <button
                      onClick={handleRegenerateRecoveryCodes}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw size={14} className="sm:w-4 sm:h-4" />}
                      Regenerate Codes
                    </button>
                  )}
                  <button
                    onClick={handleDisableTwoFactor}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> : <Shield size={14} className="sm:w-4 sm:h-4" />}
                    Disable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
