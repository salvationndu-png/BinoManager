import React from 'react';
import { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Lock, Eye, EyeOff, Copy, CheckCircle2, AlertCircle, Zap, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost, saPut, saPatch } from '../lib/api';

export const PaymentGateway = () => {
  const [gateways, setGateways] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [gw, tx] = await Promise.all([saGet('/superadmin/api/gateways'), saGet('/superadmin/api/payments')]);
      setGateways(gw.gateways ?? gw);
      setTransactions(tx.transactions ?? tx.data ?? []);
    } catch { showToast('Failed to load gateway data', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (gatewayId: number) => {
    setSaving(true);
    try {
      await saPut(`/superadmin/payments/${gatewayId}`, formData);
      showToast('Gateway updated successfully');
      setEditing(null); setFormData({});
      await load();
    } catch (e: any) { showToast(e?.data?.message ?? 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (gatewayId: number) => {
    try {
      await saPatch(`/superadmin/payments/${gatewayId}/toggle`);
      showToast('Gateway toggled');
      await load();
    } catch { showToast('Toggle failed', 'error'); }
  };

  const handlePing = async () => {
    setPinging(true); setPingResult(null);
    try {
      const res = await saPost('/superadmin/api/gateway-ping');
      setPingResult(res.latency ? `Connected — ${res.latency}ms` : res.message ?? 'Connected');
    } catch { setPingResult('Connection failed'); }
    finally { setPinging(false); }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  };

  const webhookUrl = `${window.location.origin}/webhooks/paystack`;
  const fmt = (n: number) => '₦' + Number(n).toLocaleString('en-NG');

  return (
    <div className="space-y-8">
      {toast && (
        <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm", toast.type==='success'?'bg-sa-accent':'bg-red-600')}>
          <span className="flex-1">{toast.msg}</span><button onClick={() => setToast(null)}><X size={15}/></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">Payment Gateway</h2><p className="text-sa-muted text-sm">Configure payment credentials and monitor transactions</p></div>
        <button onClick={handlePing} disabled={pinging} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sa-card border border-sa-border text-sm font-bold hover:border-sa-accent/50 transition-colors disabled:opacity-50">
          <Zap size={16} className={pinging ? 'animate-spin' : ''}/> {pinging ? 'Testing...' : 'Ping Paystack'}
        </button>
      </div>

      {pingResult && (
        <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium", pingResult.includes('fail') || pingResult.includes('Failed') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-sa-accent/10 border-sa-accent/20 text-sa-accent')}>
          {pingResult.includes('fail') ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>} {pingResult}
        </div>
      )}

      {/* Webhook URL */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={18} className="text-sa-accent"/> Webhook Endpoint</h3>
        <p className="text-xs text-sa-muted mb-3">Configure this URL in your Paystack dashboard under Webhooks. All payment events will be sent here.</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-sa-bg border border-sa-border rounded-lg px-4 py-2.5 text-sm font-mono text-sa-accent">{webhookUrl}</code>
          <button onClick={() => copyText(webhookUrl, 'webhook')} className={cn("p-2.5 rounded-lg border transition-colors", copied==='webhook' ? 'bg-sa-accent text-sa-bg border-sa-accent' : 'border-sa-border text-sa-muted hover:border-sa-accent/50')}>
            {copied === 'webhook' ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
          </button>
        </div>
      </div>

      {/* Gateway cards */}
      {loading ? <div className="h-64 bg-sa-card border border-sa-border rounded-2xl animate-pulse"/> : (
        gateways.map(gw => (
          <div key={gw.id} className={cn("bg-sa-card border rounded-2xl p-6 relative overflow-hidden", gw.is_active ? 'border-sa-accent/50' : 'border-sa-border')}>
            {gw.is_active && <div className="absolute top-0 left-0 right-0 h-0.5 bg-sa-accent"/>}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center font-bold text-white text-lg">{gw.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{gw.name}</h3>
                    {gw.is_active && <span className="flex items-center gap-1 text-[10px] font-bold text-sa-accent uppercase tracking-widest bg-sa-accent/10 px-2 py-0.5 rounded border border-sa-accent/20"><div className="w-1.5 h-1.5 rounded-full bg-sa-accent animate-pulse"/>Active</span>}
                  </div>
                  <p className="text-xs text-sa-muted">Currency: {gw.currency} · {gw.has_keys ? '✓ Keys configured' : '⚠ Keys not configured'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(gw.id)} className={cn("px-4 py-2 rounded-lg text-sm font-bold border transition-colors", gw.is_active ? 'bg-sa-accent/10 text-sa-accent border-sa-accent/20 hover:bg-sa-accent/20' : 'border-sa-border text-sa-muted hover:border-sa-accent/50')}>
                  {gw.is_active ? 'Active' : 'Set Active'}
                </button>
                <button onClick={() => { setEditing(gw.id); setFormData({ public_key: '', secret_key: '', webhook_secret: '', currency: gw.currency, is_active: gw.is_active }); }}
                  className="px-4 py-2 rounded-lg text-sm font-bold border border-sa-border text-sa-muted hover:border-sa-accent/50 hover:text-sa-text transition-colors">
                  Edit Keys
                </button>
              </div>
            </div>

            {editing === gw.id ? (
              <div className="space-y-4 border-t border-sa-border pt-6">
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">Leave a key field empty to keep the existing value unchanged.</p>
                {[['secret_key','Secret Key','password'],['public_key','Public Key','text'],['webhook_secret','Webhook Secret','password']].map(([field, label, type]) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">{label}</label>
                    <div className="relative">
                      <input type={showKeys[field] ? 'text' : type} value={formData[field] ?? ''} onChange={e => setFormData(p => ({...p, [field]: e.target.value}))}
                        placeholder={`Enter new ${label.toLowerCase()}...`}
                        className="w-full bg-sa-bg border border-sa-border rounded-lg py-2.5 pl-4 pr-10 text-sm font-mono focus:outline-none focus:border-sa-accent text-sa-text"/>
                      {type === 'password' && <button type="button" onClick={() => setShowKeys(p => ({...p, [field]: !p[field]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-sa-muted hover:text-sa-text transition-colors">
                        {showKeys[field] ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setEditing(null); setFormData({}); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-sa-bg border border-sa-border text-sa-muted hover:border-sa-border/80 transition-colors">Cancel</button>
                  <button onClick={() => handleSave(gw.id)} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-sa-accent text-sa-bg hover:bg-emerald-400 disabled:opacity-50 transition-all">
                    {saving ? 'Saving...' : 'Save Credentials'}
                  </button>
                </div>
              </div>
            ) : gw.has_keys && (
              <div className="grid sm:grid-cols-2 gap-4 border-t border-sa-border pt-6">
                {[['Public Key', gw.masked_public_key], ['Secret Key', gw.masked_secret_key]].map(([label, val]) => (
                  <div key={label as string} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">{label}</label>
                    <div className="flex items-center gap-2 bg-sa-bg border border-sa-border rounded-lg px-3 py-2">
                      <code className="flex-1 text-xs font-mono text-sa-muted truncate">{val ?? 'Not set'}</code>
                      <ShieldCheck size={14} className="text-sa-accent shrink-0"/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Transaction log */}
      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-sa-border flex justify-between items-center">
          <div><h3 className="font-bold">Transaction Log</h3><p className="text-xs text-sa-muted mt-0.5">Recent platform payment events</p></div>
          <ExternalLink size={18} className="text-sa-muted"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sa-border bg-sa-bg/50">
              <tr>{['Date','Tenant','Plan','Amount','Reference','Status'].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-bold text-sa-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-sa-border">
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sa-muted">No transactions recorded</td></tr>
              ) : transactions.map((tx: any, i: number) => (
                <tr key={i} className="hover:bg-sa-accent/5 transition-colors">
                  <td className="px-4 py-3 text-xs text-sa-muted whitespace-nowrap">{new Date(tx.processed_at ?? tx.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{tx.tenant?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sa-muted text-xs">{tx.plan?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-sa-accent">{fmt(tx.amount ?? 0)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sa-muted">{tx.paystack_reference ?? '—'}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">success</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

