import React, { useState, useEffect } from 'react';
import { saGet, saPost } from '../lib/api';
import { Mail, Server, Key, Send, Check, AlertCircle, Loader2, Eye, EyeOff, TestTube } from 'lucide-react';

interface EmailSettings {
  id?: number;
  driver: 'smtp' | 'mailgun' | 'ses' | 'sendmail';
  host?: string;
  port?: number;
  encryption?: 'tls' | 'ssl' | '';
  username?: string;
  from_address: string;
  from_name: string;
  mailgun_domain?: string;
  mailgun_endpoint?: string;
  ses_region?: string;
  is_active: boolean;
  last_tested_at?: string;
  test_result?: string;
}

export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    driver: 'smtp',
    from_address: '',
    from_name: 'BinoManager',
    is_active: false,
    encryption: 'tls',
    port: 587,
  });
  
  const [passwords, setPasswords] = useState({
    smtp_password: '',
    mailgun_secret: '',
    ses_secret: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    smtp: false,
    mailgun: false,
    ses: false,
  });

  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await saGet('/superadmin/email-settings');
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load email settings:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload: any = { ...settings };
      
      // Add passwords based on driver
      if (settings.driver === 'smtp' && passwords.smtp_password) {
        payload.password = passwords.smtp_password;
      } else if (settings.driver === 'mailgun' && passwords.mailgun_secret) {
        payload.mailgun_secret = passwords.mailgun_secret;
      } else if (settings.driver === 'ses' && passwords.ses_secret) {
        payload.ses_secret = passwords.ses_secret;
      }

      const data = await saPost('/superadmin/email-settings', payload);
      setMessage({ type: 'success', text: data.message });
      if (data.settings) setSettings(data.settings);
      setPasswords({ smtp_password: '', mailgun_secret: '', ses_secret: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.data?.message ?? err.message ?? 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const data = await saPost('/superadmin/email-settings/test', { test_email: testEmail });
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        loadSettings();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.data?.message ?? err.message ?? 'Failed to send test email' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Email Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure email delivery for the platform
        </p>
      </div>

      {/* Status Banner */}
      {settings.is_active ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <Check size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Email system is active and working
            </p>
            {settings.last_tested_at && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Last tested: {new Date(settings.last_tested_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Email system is not configured or inactive
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Configure and test your email settings to activate the system
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver Selection */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4">Email Driver</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'smtp', label: 'SMTP', icon: Server },
              { value: 'mailgun', label: 'Mailgun', icon: Mail },
              { value: 'ses', label: 'Amazon SES', icon: Server },
              { value: 'sendmail', label: 'Sendmail', icon: Send },
            ].map((driver) => (
              <button
                key={driver.value}
                type="button"
                onClick={() => setSettings({ ...settings, driver: driver.value as any })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.driver === driver.value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <driver.icon size={24} className={`mx-auto mb-2 ${
                  settings.driver === driver.value ? 'text-primary-600' : 'text-zinc-400'
                }`} />
                <p className={`text-sm font-semibold ${
                  settings.driver === driver.value ? 'text-primary-600' : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                  {driver.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* From Settings */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4">From Address</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                From Email *
              </label>
              <input
                type="email"
                value={settings.from_address}
                onChange={(e) => setSettings({ ...settings, from_address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="noreply@yourdomain.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                From Name *
              </label>
              <input
                type="text"
                value={settings.from_name}
                onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="BinoManager"
                required
              />
            </div>
          </div>
        </div>

        {/* SMTP Settings */}
        {settings.driver === 'smtp' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4">SMTP Configuration</h3>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={settings.host || ''}
                    onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={settings.port || ''}
                    onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="587"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Encryption
                </label>
                <select
                  value={settings.encryption || ''}
                  onChange={(e) => setSettings({ ...settings, encryption: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={settings.username || ''}
                  onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your-email@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.smtp ? 'text' : 'password'}
                    value={passwords.smtp_password}
                    onChange={(e) => setPasswords({ ...passwords, smtp_password: e.target.value })}
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter SMTP password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, smtp: !showPasswords.smtp })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPasswords.smtp ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mailgun Settings */}
        {settings.driver === 'mailgun' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4">Mailgun Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  value={settings.mailgun_domain || ''}
                  onChange={(e) => setSettings({ ...settings, mailgun_domain: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="mg.yourdomain.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  API Key *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.mailgun ? 'text' : 'password'}
                    value={passwords.mailgun_secret}
                    onChange={(e) => setPasswords({ ...passwords, mailgun_secret: e.target.value })}
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxx"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, mailgun: !showPasswords.mailgun })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPasswords.mailgun ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Endpoint
                </label>
                <input
                  type="text"
                  value={settings.mailgun_endpoint || 'api.mailgun.net'}
                  onChange={(e) => setSettings({ ...settings, mailgun_endpoint: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="api.mailgun.net"
                />
              </div>
            </div>
          </div>
        )}

        {/* SES Settings */}
        {settings.driver === 'ses' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4">Amazon SES Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Access Key ID *
                </label>
                <input
                  type="text"
                  value={settings.username || ''}
                  onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Secret Access Key *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.ses ? 'text' : 'password'}
                    value={passwords.ses_secret}
                    onChange={(e) => setPasswords({ ...passwords, ses_secret: e.target.value })}
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, ses: !showPasswords.ses })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPasswords.ses ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Region *
                </label>
                <select
                  value={settings.ses_region || 'us-east-1'}
                  onChange={(e) => setSettings({ ...settings, ses_region: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Sendmail Info */}
        {settings.driver === 'sendmail' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Sendmail uses the server's local mail transfer agent. No additional configuration required.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Test Email Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <TestTube size={20} />
          Test Email Configuration
        </h3>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Send a test email to verify your configuration is working correctly.
        </p>

        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !testEmail}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {testing ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
