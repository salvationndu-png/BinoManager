import { 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  ShieldAlert, 
  Clock,
  DollarSign,
  Users,
  Package,
  Activity,
  History,
  FileText,
  CreditCard
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';

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

export const TenantDetail = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header Band */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2 bg-sa-card border border-sa-border rounded-lg text-sa-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sa-accent to-emerald-400 flex items-center justify-center text-2xl font-bold text-sa-bg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              AC
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold tracking-tight">Acme Corporation</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                <span className="text-[10px] font-mono text-sa-muted uppercase tracking-widest px-2 py-0.5 rounded bg-sa-border/50">acme-corp</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-sa-muted font-medium">
                <span>admin@acme.com</span>
                <span>•</span>
                <span>+234 801 234 5678</span>
                <span>•</span>
                <span className="text-purple-400 font-bold">Enterprise Plan</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-sa-card border border-sa-border px-4 py-2 rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">
            <RefreshCw size={14} />
            Impersonate
          </button>
          <button className="flex items-center gap-2 bg-sa-card border border-sa-border px-4 py-2 rounded-lg text-xs font-bold hover:bg-sa-border transition-colors">
            <ShieldAlert size={14} className="text-red-500" />
            Suspend
          </button>
          <button className="flex items-center gap-2 bg-sa-accent text-sa-bg px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors">
            Extend Trial
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3">
        <Clock size={18} className="text-amber-500" />
        <p className="text-sm text-amber-100/80">
          <span className="font-bold">Subscription Alert:</span> This tenant's next billing cycle is in 3 days. Last payment was successful.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '₦450,000', icon: DollarSign, color: 'text-sa-accent' },
          { label: 'Active Users', value: '42', icon: Users, color: 'text-blue-500' },
          { label: 'Products in Catalog', value: '128', icon: Package, color: 'text-purple-500' },
          { label: 'Sales This Month', value: '₦82,400', icon: Activity, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-sa-card border border-sa-border p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sa-bg border border-sa-border rounded-lg">
                <stat.icon size={18} className={stat.color} />
              </div>
              <span className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabbed Area */}
      <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-sa-border bg-sa-bg/30 overflow-x-auto">
          <TabButton active={activeTab === 'overview'} label="Overview" onClick={() => setActiveTab('overview')} />
          <TabButton active={activeTab === 'billing'} label="Billing History" onClick={() => setActiveTab('billing')} />
          <TabButton active={activeTab === 'activity'} label="Activity Log" onClick={() => setActiveTab('activity')} />
          <TabButton active={activeTab === 'notes'} label="Admin Notes" onClick={() => setActiveTab('notes')} />
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <CreditCard size={18} className="text-sa-accent" />
                  Subscription Details
                </h3>
                <div className="bg-sa-bg border border-sa-border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-sa-border/50">
                    <span className="text-sm text-sa-muted">Current Plan</span>
                    <span className="text-sm font-bold text-purple-400">Enterprise</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-sa-border/50">
                    <span className="text-sm text-sa-muted">Price</span>
                    <span className="text-sm font-bold">₦150,000 / month</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-sa-border/50">
                    <span className="text-sm text-sa-muted">Status</span>
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-sa-border/50">
                    <span className="text-sm text-sa-muted">Next Billing Date</span>
                    <span className="text-sm font-bold">March 19, 2026</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Users size={18} className="text-blue-500" />
                  Team Members
                </h3>
                <div className="bg-sa-bg border border-sa-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-sa-card/50 border-b border-sa-border">
                        <th className="px-4 py-3 font-bold text-sa-muted uppercase tracking-widest">Name</th>
                        <th className="px-4 py-3 font-bold text-sa-muted uppercase tracking-widest">Role</th>
                        <th className="px-4 py-3 font-bold text-sa-muted uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sa-border">
                      {[
                        { name: 'John Doe', role: 'Admin', status: 'Active' },
                        { name: 'Jane Smith', role: 'Sales', status: 'Active' },
                        { name: 'Mike Johnson', role: 'Support', status: 'Inactive' },
                      ].map((member, i) => (
                        <tr key={i} className="hover:bg-sa-card transition-colors">
                          <td className="px-4 py-3 font-medium">{member.name}</td>
                          <td className="px-4 py-3 text-sa-muted">{member.role}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                              member.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-sa-muted/10 text-sa-muted"
                            )}>{member.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Payment History</h3>
                <button className="text-xs font-bold text-sa-accent hover:underline">Download All Receipts</button>
              </div>
              <div className="bg-sa-bg border border-sa-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-sa-card/50 border-b border-sa-border">
                      <th className="px-6 py-4 font-bold text-sa-muted uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 font-bold text-sa-muted uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 font-bold text-sa-muted uppercase tracking-widest">Reference</th>
                      <th className="px-6 py-4 font-bold text-sa-muted uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sa-border">
                    {[
                      { date: 'Feb 19, 2026', amount: '₦150,000', ref: 'PAY-928374', status: 'Success' },
                      { date: 'Jan 19, 2026', amount: '₦150,000', ref: 'PAY-102938', status: 'Success' },
                      { date: 'Dec 19, 2025', amount: '₦150,000', ref: 'PAY-475869', status: 'Success' },
                    ].map((tx, i) => (
                      <tr key={i} className="hover:bg-sa-card transition-colors">
                        <td className="px-6 py-4 text-sa-muted">{tx.date}</td>
                        <td className="px-6 py-4 font-bold">{tx.amount}</td>
                        <td className="px-6 py-4 font-mono text-xs text-sa-muted">{tx.ref}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="font-bold">Recent Tenant Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'New User Added', user: 'Jane Smith', time: '2h ago', icon: Users, color: 'text-blue-500' },
                  { action: 'Catalog Updated', user: 'John Doe', time: '5h ago', icon: Package, color: 'text-purple-500' },
                  { action: 'Subscription Renewed', user: 'System', time: '1d ago', icon: CreditCard, color: 'text-sa-accent' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-sa-bg border border-sa-border rounded-xl">
                    <div className={cn("p-2 rounded-lg bg-sa-card border border-sa-border", item.color)}>
                      <item.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.action}</p>
                      <p className="text-xs text-sa-muted">Performed by {item.user} • {item.time}</p>
                    </div>
                    <ExternalLink size={14} className="text-sa-muted" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Administrative Notes</h3>
                <span className="text-[10px] text-sa-muted uppercase tracking-widest">Last edited: 2 days ago by SN</span>
              </div>
              <textarea 
                placeholder="Add internal notes about this tenant..."
                className="w-full h-48 bg-sa-bg border border-sa-border rounded-xl p-4 text-sm focus:outline-none focus:border-sa-accent resize-none"
                defaultValue="High usage tenant. Requested white-labeling features for next quarter. Monitor API usage closely."
              />
              <div className="flex justify-end">
                <button className="bg-sa-accent text-sa-bg px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors">
                  Save Admin Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
