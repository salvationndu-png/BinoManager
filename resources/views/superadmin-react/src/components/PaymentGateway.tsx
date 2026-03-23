import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink, 
  Zap,
  Activity,
  Lock,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const transactions = [
  { id: 1, date: '2026-03-16 14:22', tenant: 'Acme Corp', plan: 'Enterprise', amount: '₦150,000', ref: 'PAY-928374', status: 'success' },
  { id: 2, date: '2026-03-16 12:05', tenant: 'Global Tech', plan: 'Business', amount: '₦45,000', ref: 'PAY-102938', status: 'failed' },
  { id: 3, date: '2026-03-16 09:45', tenant: 'Nexus Solutions', plan: 'Starter', amount: '₦25,000', ref: 'PAY-475869', status: 'success' },
  { id: 4, date: '2026-03-15 22:10', tenant: 'Starlight Inc', plan: 'Business', amount: '₦45,000', ref: 'PAY-384756', status: 'pending' },
  { id: 5, date: '2026-03-15 18:30', tenant: 'Cloud Nine', plan: 'Enterprise', amount: '₦150,000', ref: 'PAY-293847', status: 'success' },
];

const CredentialPanel = ({ title, type, isActive }: { title: string, type: 'live' | 'test', isActive?: boolean }) => (
  <div className={cn(
    "bg-sa-card border rounded-2xl p-6 flex flex-col relative overflow-hidden",
    isActive ? "border-sa-accent/50" : "border-sa-border",
    type === 'test' && "border-amber-500/30"
  )}>
    {type === 'test' && (
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/50" />
    )}
    
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <h3 className="font-bold">{title}</h3>
        {isActive && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-sa-accent uppercase tracking-widest bg-sa-accent/10 px-2 py-0.5 rounded border border-sa-accent/20">
            <div className="w-1.5 h-1.5 rounded-full bg-sa-accent animate-pulse" />
            Active
          </span>
        )}
      </div>
      {type === 'test' && (
        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Test Mode
        </span>
      )}
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Secret Key</label>
        <div className="relative">
          <input 
            type="password" 
            value="••••••••••••••••••••••••••••••••••••" 
            readOnly
            className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-4 pr-10 text-sm font-mono text-sa-muted"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-sa-muted hover:text-white transition-colors">
            <EyeOff size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Public Key</label>
        <div className="relative">
          <input 
            type="text" 
            value="pk_••••••••••••••••••••••••••••••••••••" 
            readOnly
            className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-4 pr-10 text-sm font-mono text-sa-muted"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-sa-muted hover:text-white transition-colors">
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>

    <div className="mt-8 pt-6 border-t border-sa-border flex items-center justify-between">
      <p className="text-[10px] text-sa-muted">Last updated: 2026-03-10 by SN</p>
      <div className="flex gap-2">
        {!isActive && (
          <button className="text-xs font-bold text-sa-accent hover:underline">Set as Active</button>
        )}
        <button className="bg-sa-bg border border-sa-border px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

export const PaymentGateway = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status Banner */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sa-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="font-bold text-sm">Live Mode Active</span>
          </div>
          <div className="h-4 w-px bg-sa-border" />
          <div className="flex items-center gap-2 text-xs text-sa-muted">
            <Activity size={14} className="text-sa-accent" />
            <span>Last Webhook: <span className="text-white font-medium">charge.success (2m ago)</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-sa-muted">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Last Payment: <span className="text-white font-medium">₦150,000 from Acme Corp</span></span>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-sa-bg border border-sa-border px-4 py-2 rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">
          <RefreshCw size={14} />
          Ping Paystack
        </button>
      </div>

      {/* Credentials Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CredentialPanel title="Live Credentials" type="live" isActive={true} />
        <CredentialPanel title="Test Credentials" type="test" isActive={false} />
      </div>

      {/* Webhook Configuration */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-8">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Zap size={20} className="text-sa-accent" />
          Webhook Configuration
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Webhook URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value="https://api.binomanager.com/webhooks/paystack" 
                  readOnly
                  className="flex-1 bg-sa-bg border border-sa-border rounded-lg py-2 px-4 text-sm text-sa-muted"
                />
                <button className="p-2 bg-sa-bg border border-sa-border rounded-lg text-sa-muted hover:text-white transition-colors">
                  <Copy size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Webhook Secret</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                  readOnly
                  className="flex-1 bg-sa-bg border border-sa-border rounded-lg py-2 px-4 text-sm text-sa-muted"
                />
                <button className="p-2 bg-sa-bg border border-sa-border rounded-lg text-sa-muted hover:text-white transition-colors">
                  <EyeOff size={18} />
                </button>
              </div>
            </div>
            <button className="w-full bg-sa-accent/10 text-sa-accent border border-sa-accent/20 py-2 rounded-lg text-sm font-bold hover:bg-sa-accent/20 transition-colors">
              Verify Webhook Secret
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Accepted Events</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'charge.success', active: true },
                { label: 'subscription.disable', active: true },
                { label: 'invoice.create', active: true },
                { label: 'transfer.success', active: false },
                { label: 'customer.identification', active: false },
                { label: 'charge.dispute.create', active: true },
              ].map((event) => (
                <div key={event.label} className="flex items-center gap-3 p-3 bg-sa-bg border border-sa-border rounded-xl">
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    event.active ? "bg-sa-accent border-sa-accent text-sa-bg" : "border-sa-border"
                  )}>
                    {event.active && <CheckCircle2 size={12} />}
                  </div>
                  <span className={cn("text-xs font-medium", event.active ? "text-white" : "text-sa-muted")}>{event.label}</span>
                </div>
              ))}
            </div>
            <button className="text-xs font-bold text-sa-muted hover:text-white transition-colors mt-2">
              Send Test Webhook Event
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-sa-border flex justify-between items-center">
          <h3 className="font-bold">Recent Payments Log</h3>
          <button className="text-xs font-bold text-sa-accent hover:underline">View All Transactions</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sa-bg/50 border-b border-sa-border">
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Tenant</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Reference</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sa-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-sa-accent/5 transition-colors">
                  <td className="px-6 py-4 text-xs text-sa-muted">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-bold">{tx.tenant}</td>
                  <td className="px-6 py-4 text-xs font-medium text-sa-muted">{tx.plan}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right">{tx.amount}</td>
                  <td className="px-6 py-4 text-xs font-mono text-sa-muted">{tx.ref}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                      tx.status === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      tx.status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-sa-muted hover:text-white transition-colors">
                        <ExternalLink size={14} />
                      </button>
                      {tx.status === 'failed' && (
                        <button className="p-2 text-red-500 hover:text-red-400 transition-colors">
                          <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
