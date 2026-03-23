import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ExternalLink, 
  ShieldAlert, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const tenants = [
  { id: 1, name: 'Acme Corporation', slug: 'acme-corp', owner: 'admin@acme.com', plan: 'Enterprise', status: 'active', mrr: '₦150,000', users: '42/100', joined: '3 months ago' },
  { id: 2, name: 'Global Tech', slug: 'global-tech', owner: 'ceo@global.io', plan: 'Business', status: 'trialing', mrr: '₦0', users: '5/20', joined: '2 days ago' },
  { id: 3, name: 'Nexus Solutions', slug: 'nexus-sol', owner: 'support@nexus.com', plan: 'Starter', status: 'active', mrr: '₦25,000', users: '3/5', joined: '1 year ago' },
  { id: 4, name: 'BadActor Ltd', slug: 'bad-actor', owner: 'scam@gmail.com', plan: 'Starter', status: 'suspended', mrr: '₦0', users: '1/5', joined: '5 months ago' },
  { id: 5, name: 'Starlight Inc', slug: 'starlight', owner: 'billing@starlight.com', plan: 'Business', status: 'grace', mrr: '₦45,000', users: '12/20', joined: '8 months ago' },
  { id: 6, name: 'Cloud Nine', slug: 'cloud-nine', owner: 'dev@cloud9.io', plan: 'Enterprise', status: 'active', mrr: '₦150,000', users: '88/100', joined: '2 years ago' },
  { id: 7, name: 'Future Systems', slug: 'future-sys', owner: 'info@future.com', plan: 'Business', status: 'active', mrr: '₦45,000', users: '18/20', joined: '4 months ago' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    trialing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    grace: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
    cancelled: 'bg-sa-muted/10 text-sa-muted border-sa-muted/20',
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border", styles[status])}>
      {status}
    </span>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: any = {
    Enterprise: 'text-purple-400',
    Business: 'text-blue-400',
    Starter: 'text-sa-accent',
  };
  return <span className={cn("font-bold", styles[plan])}>{plan}</span>;
};

export const TenantsList = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants Management</h2>
          <p className="text-sa-muted text-sm">Manage all workspaces, monitor health, and take administrative actions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-sa-card border border-sa-border px-4 py-2 rounded-lg text-sm font-bold hover:bg-sa-border transition-colors">
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-sa-accent text-sa-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Plus size={18} />
            Create Workspace
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-sa-card border border-sa-border p-4 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select className="flex-1 sm:flex-none bg-sa-bg border border-sa-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-sa-accent transition-colors">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Trialing</option>
              <option>Grace</option>
              <option>Suspended</option>
            </select>
            <select className="flex-1 sm:flex-none bg-sa-bg border border-sa-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-sa-accent transition-colors">
              <option>All Plans</option>
              <option>Starter</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>
            <button className="p-2 bg-sa-bg border border-sa-border rounded-lg text-sa-muted hover:text-white transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-sa-muted uppercase tracking-widest mr-2">Quick Filters:</span>
          <div className="flex flex-wrap gap-2">
            <button className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full border border-emerald-500/20">742 Active</button>
            <button className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full border border-blue-500/20">84 Trialing</button>
            <button className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full border border-amber-500/20">12 Grace</button>
            <button className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-full border border-red-500/20">34 Suspended</button>
          </div>
        </div>
      </div>

      {/* Table / Mobile Cards */}
      <div className="bg-sa-card border border-sa-border rounded-xl overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-sa-border">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="p-4 space-y-4 hover:bg-sa-accent/5 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sa-bg border border-sa-border flex items-center justify-center font-bold text-sa-accent">
                    {tenant.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{tenant.name}</p>
                    <p className="text-[10px] font-mono text-sa-muted truncate">{tenant.slug}</p>
                  </div>
                </div>
                <StatusBadge status={tenant.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-bold text-sa-muted">
                <div>
                  <p className="mb-1">Plan</p>
                  <PlanBadge plan={tenant.plan} />
                </div>
                <div className="text-right">
                  <p className="mb-1">MRR</p>
                  <p className="text-sa-text">{tenant.mrr}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-sa-border/50">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-sa-muted hover:text-sa-accent transition-colors">
                    <ExternalLink size={16} />
                  </button>
                  <button className="p-2 text-sa-muted hover:text-amber-500 transition-colors">
                    <RefreshCw size={16} />
                  </button>
                  <button className="p-2 text-sa-muted hover:text-red-500 transition-colors">
                    <ShieldAlert size={16} />
                  </button>
                </div>
                <button className="text-xs font-bold text-sa-muted hover:text-sa-text transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sa-bg/50 border-b border-sa-border">
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Workspace</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Owner</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest text-right">MRR</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest text-center">Users</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold text-sa-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sa-border">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-sa-accent/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sa-bg border border-sa-border flex items-center justify-center font-bold text-sa-accent group-hover:border-sa-accent/50 transition-colors">
                        {tenant.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tenant.name}</p>
                        <p className="text-xs font-mono text-sa-muted">{tenant.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-sa-muted truncate max-w-[150px]">{tenant.owner}</p>
                  </td>
                  <td className="px-6 py-4">
                    <PlanBadge plan={tenant.plan} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-bold">{tenant.mrr}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-xs font-medium text-sa-muted">{tenant.users}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-sa-muted">{tenant.joined}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-sa-muted hover:text-sa-accent transition-colors" title="View Detail">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 text-sa-muted hover:text-amber-500 transition-colors" title="Impersonate">
                        <RefreshCw size={16} />
                      </button>
                      <button className="p-2 text-sa-muted hover:text-red-500 transition-colors" title="Suspend">
                        <ShieldAlert size={16} />
                      </button>
                      <button className="p-2 text-sa-muted hover:text-sa-text transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-sa-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-sa-bg/30">
          <p className="text-xs text-sa-muted order-2 sm:order-1">Showing <span className="text-sa-text font-bold">1-7</span> of <span className="text-sa-text font-bold">247</span> workspaces</p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button className="p-2 border border-sa-border rounded-lg text-sa-muted hover:bg-sa-border transition-colors disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 12].map((page, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-colors",
                    page === 1 ? "bg-sa-accent text-sa-bg" : "text-sa-muted hover:bg-sa-border"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-2 border border-sa-border rounded-lg text-sa-muted hover:bg-sa-border transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
