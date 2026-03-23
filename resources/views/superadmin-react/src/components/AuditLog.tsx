import { 
  Search, 
  Filter, 
  Download, 
  History,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  ArrowUpRight,
  ChevronDown,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const auditEvents = [
  { id: 1, action: 'suspend', desc: 'Suspended workspace "BadActor Ltd"', tenant: 'BadActor Ltd', time: '2 minutes ago', admin: 'Salvation Ndu', ip: '192.168.1.45', color: 'text-red-500', icon: ShieldAlert },
  { id: 2, action: 'unsuspend', desc: 'Restored workspace "GoodVibes Inc"', tenant: 'GoodVibes Inc', time: '15 minutes ago', admin: 'Salvation Ndu', ip: '192.168.1.45', color: 'text-emerald-500', icon: ShieldCheck },
  { id: 3, action: 'impersonate', desc: 'Impersonated admin for "HelpDesk Pro"', tenant: 'HelpDesk Pro', time: '1 hour ago', admin: 'Salvation Ndu', ip: '192.168.1.45', color: 'text-amber-500', icon: UserCog },
  { id: 4, action: 'plan_change', desc: 'Changed plan from Starter to Enterprise', tenant: 'ScaleFast', time: '3 hours ago', admin: 'Admin Jane', ip: '10.0.0.12', color: 'text-blue-500', icon: ArrowUpRight },
  { id: 5, action: 'extend_trial', desc: 'Extended trial by 7 days', tenant: 'Acme Corp', time: '5 hours ago', admin: 'Salvation Ndu', ip: '192.168.1.45', color: 'text-purple-500', icon: Clock },
  { id: 6, action: 'note', desc: 'Added admin note: "Suspected high usage"', tenant: 'Nexus Solutions', time: '1 day ago', admin: 'Admin Jane', ip: '10.0.0.12', color: 'text-sa-muted', icon: History },
  { id: 7, action: 'login', desc: 'Super admin login successful', tenant: null, time: '1 day ago', admin: 'Salvation Ndu', ip: '192.168.1.45', color: 'text-zinc-400', icon: ShieldCheck },
];

const TimelineEntry = ({ event }: { event: any, key?: any }) => (
  <div className="relative pl-8 pb-8 last:pb-0">
    {/* Line */}
    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-sa-border group-last:hidden" />
    
    {/* Dot */}
    <div className={cn(
      "absolute left-0 top-0 w-8 h-8 rounded-full bg-sa-bg border border-sa-border flex items-center justify-center z-10",
      event.color
    )}>
      <event.icon size={14} />
    </div>

    <div className="bg-sa-card border border-sa-border rounded-xl p-4 hover:border-sa-accent/30 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
            event.action === 'suspend' ? "bg-red-500/10 text-red-500 border-red-500/20" :
            event.action === 'unsuspend' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
            event.action === 'impersonate' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
            "bg-sa-muted/10 text-sa-muted border-sa-muted/20"
          )}>
            {event.action}
          </span>
          <p className="text-sm font-medium text-sa-text">{event.desc}</p>
        </div>
        <span className="text-xs text-sa-muted font-medium">{event.time}</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {event.tenant && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-sa-bg border border-sa-border rounded-lg text-[10px] font-bold text-sa-accent hover:bg-sa-accent/10 transition-colors cursor-pointer">
            <ExternalLink size={10} />
            {event.tenant}
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-sa-muted uppercase tracking-wider">
          <span className="font-bold text-sa-text">{event.admin}</span>
          <span>•</span>
          <span>IP: {event.ip}</span>
        </div>
      </div>

      <button className="mt-4 flex items-center gap-1 text-[10px] font-bold text-sa-muted hover:text-sa-text transition-colors uppercase tracking-widest">
        <ChevronDown size={12} />
        View Raw Context
      </button>
    </div>
  </div>
);

export const AuditLog = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Audit Log</h2>
          <p className="text-sa-muted text-sm">Complete, tamper-evident record of every action taken by super admins.</p>
        </div>
        <button className="flex items-center gap-2 bg-sa-card border border-sa-border px-4 py-2 rounded-lg text-sm font-bold hover:bg-sa-border transition-colors">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Events', value: '2,341', icon: History, color: 'text-sa-accent' },
          { label: 'Active Admins', value: '4', icon: UserCog, color: 'text-blue-500' },
          { label: 'Critical Actions', value: '12', icon: ShieldAlert, color: 'text-red-500' },
          { label: 'Last 24h', value: '84', icon: Clock, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-sa-card border border-sa-border p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-sa-card border border-sa-border p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by tenant name..." 
            className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 sm:flex-none flex items-center justify-between gap-2 bg-sa-bg border border-sa-border rounded-lg px-3 py-2 text-sm text-sa-muted">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Last 30 Days</span>
            </div>
            <ChevronDown size={16} />
          </div>
          <select className="flex-1 sm:flex-none bg-sa-bg border border-sa-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-sa-accent transition-colors">
            <option>All Actions</option>
            <option>Suspend</option>
            <option>Impersonate</option>
            <option>Plan Change</option>
          </select>
          <select className="flex-1 sm:flex-none bg-sa-bg border border-sa-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-sa-accent transition-colors">
            <option>All Admins</option>
            <option>Salvation Ndu</option>
            <option>Admin Jane</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-sa-border rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Today, March 16</div>
          <div className="space-y-0">
            {auditEvents.slice(0, 3).map((event) => (
              <TimelineEntry key={event.id} event={event} />
            ))}
          </div>
        </div>

        <div>
          <div className="inline-block px-3 py-1 bg-sa-border rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Yesterday, March 15</div>
          <div className="space-y-0">
            {auditEvents.slice(3).map((event) => (
              <TimelineEntry key={event.id} event={event} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-2 bg-sa-card border border-sa-border rounded-lg text-sm font-bold hover:bg-sa-border hover:text-sa-text transition-colors">
            Load More Activity
          </button>
        </div>
      </div>
    </div>
  );
};
