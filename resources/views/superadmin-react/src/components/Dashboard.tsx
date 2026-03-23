import { useEffect, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  UserPlus, 
  Activity,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  History
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 480000 },
  { month: 'Apr', revenue: 610000 },
  { month: 'May', revenue: 750000 },
  { month: 'Jun', revenue: 820000 },
  { month: 'Jul', revenue: 950000 },
  { month: 'Aug', revenue: 890000 },
  { month: 'Sep', revenue: 1100000 },
  { month: 'Oct', revenue: 1250000 },
  { month: 'Nov', revenue: 1400000 },
  { month: 'Dec', revenue: 1650000 },
];

const signupData = [
  { month: 'Jan', signups: 45 },
  { month: 'Feb', signups: 52 },
  { month: 'Mar', signups: 48 },
  { month: 'Apr', signups: 61 },
  { month: 'May', signups: 75 },
  { month: 'Jun', signups: 82 },
  { month: 'Jul', signups: 95 },
  { month: 'Aug', signups: 89 },
  { month: 'Sep', signups: 110 },
  { month: 'Oct', signups: 125 },
  { month: 'Nov', signups: 140 },
  { month: 'Dec', signups: 165 },
];

const planDistribution = [
  { name: 'Starter', value: 450, color: '#10b981' },
  { name: 'Business', value: 300, color: '#3b82f6' },
  { name: 'Enterprise', value: 120, color: '#8b5cf6' },
];

const KPICard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
  <div className="bg-sa-card border border-sa-border p-6 rounded-2xl hover:border-sa-accent/50 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-sa-bg border border-sa-border group-hover:bg-sa-accent/10 group-hover:border-sa-accent/20 transition-colors">
        <Icon size={20} className="text-sa-muted group-hover:text-sa-accent transition-colors" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
      )}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trendValue}
      </div>
    </div>
    <p className="text-sa-muted text-sm font-medium mb-1">{label}</p>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
  </div>
);

const StatusCard = ({ label, count, colorClass }: any) => (
  <div className="bg-sa-card border border-sa-border p-4 rounded-xl flex items-center justify-between hover:bg-sa-accent/5 cursor-pointer transition-colors group">
    <div className="flex items-center gap-3">
      <div className={cn("w-2 h-2 rounded-full", colorClass)} />
      <span className="text-sm font-medium text-sa-muted group-hover:text-sa-text transition-colors">{label}</span>
    </div>
    <span className="text-lg font-bold">{count}</span>
  </div>
);

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/superadmin/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-sa-muted">Loading dashboard...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Live Feed Ticker */}
      <div className="bg-sa-card border border-sa-border rounded-xl p-2 px-4 flex items-center gap-4 overflow-hidden relative">
        <div className="flex items-center gap-2 shrink-0 border-r border-sa-border pr-4">
          <div className="w-2 h-2 rounded-full bg-sa-accent animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-sa-accent">Live Feed</span>
        </div>
        <div className="flex gap-8 animate-marquee whitespace-nowrap text-[10px] font-medium text-sa-muted">
          <span>New tenant "Quantum Labs" joined the Starter plan • 2m ago</span>
          <span>Payment of ₦150,000 received from "Acme Corp" • 14m ago</span>
          <span>System upgrade completed successfully • 1h ago</span>
          <span>New support ticket from "Global Tech" • 2h ago</span>
          <span>New tenant "Quantum Labs" joined the Starter plan • 2m ago</span>
          <span>Payment of ₦150,000 received from "Acme Corp" • 14m ago</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard 
          label="Monthly Recurring Revenue" 
          value={formatCurrency(data?.mrr || 0)} 
          trend={data?.mrrGrowth >= 0 ? 'up' : 'down'} 
          trendValue={`${data?.mrrGrowth >= 0 ? '+' : ''}${data?.mrrGrowth || 0}%`} 
          icon={DollarSign}
        />
        <KPICard 
          label="Active Tenants" 
          value={data?.activeTenants || 0} 
          trend="up" 
          trendValue="" 
          icon={Users}
        />
        <KPICard 
          label="New Signups (30d)" 
          value={data?.newSignupsThisMonth || 0} 
          trend="up" 
          trendValue="" 
          icon={UserPlus}
        />
        <KPICard 
          label="Churn Rate" 
          value={`${data?.churnRate || 0}%`} 
          trend={data?.churnRate <= 5 ? 'up' : 'down'} 
          trendValue={`${data?.churnedThisMonth || 0} churned`} 
          icon={Activity}
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard label="Active" count={data?.activeTenants || 0} colorClass="bg-emerald-500" />
        <StatusCard label="Trialing" count={data?.trialingTenants || 0} colorClass="bg-blue-500" />
        <StatusCard label="Grace" count={data?.graceTenants || 0} colorClass="bg-amber-500" />
        <StatusCard label="Suspended" count={data?.suspendedTenants || 0} colorClass="bg-red-500" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-1">Platform Revenue</h3>
            <p className="text-sm text-sa-muted">Total revenue generated across all tenants (12 months)</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl lg:text-3xl font-bold text-sa-accent">{formatCurrency(data?.mrr || 0)}</p>
            <p className="text-[10px] text-sa-muted uppercase tracking-wider">Monthly Recurring Revenue</p>
          </div>
        </div>
        <div className="h-[250px] lg:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueChart || []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--sa-border)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="var(--sa-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--sa-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₦${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--sa-card)', border: '1px solid var(--sa-border)', borderRadius: '8px', color: 'var(--sa-text)' }}
                itemStyle={{ color: 'var(--sa-accent)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-sa-card border border-sa-border rounded-2xl p-4 lg:p-8">
          <h3 className="text-lg font-bold mb-6">Signups Growth</h3>
          <div className="h-[200px] lg:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.signupsChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sa-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--sa-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--sa-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--sa-border)'}}
                  contentStyle={{ backgroundColor: 'var(--sa-card)', border: '1px solid var(--sa-border)', borderRadius: '8px', color: 'var(--sa-text)' }}
                />
                <Bar dataKey="count" fill="var(--sa-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sa-card border border-sa-border rounded-2xl p-4 lg:p-8 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Plan Distribution</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl lg:text-3xl font-bold">{data?.totalTenants || 0}</span>
              <span className="text-[10px] text-sa-muted uppercase tracking-widest">Total Tenants</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.planDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(data?.planDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--sa-card)', border: '1px solid var(--sa-border)', borderRadius: '8px', color: 'var(--sa-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {(data?.planDistribution || []).map((item: any, index: number) => (
              <div key={item.plan} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'][index % 3] }} />
                <span className="text-xs text-sa-muted">{item.plan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Trials Expiring */}
        <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-sa-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Trials Expiring
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full font-medium">{(data?.expiringTrials || []).length} Pending</span>
          </div>
          <div className="divide-y divide-sa-border">
            {(data?.expiringTrials || []).length === 0 ? (
              <div className="p-8 text-center text-sa-muted text-sm">No trials expiring in the next 3 days</div>
            ) : (
              (data?.expiringTrials || []).slice(0, 4).map((trial: any) => (
                <div key={trial.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sa-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sa-bg border border-sa-border flex items-center justify-center font-bold text-sa-muted shrink-0">
                      {trial.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{trial.name}</p>
                      <p className="text-xs text-sa-muted truncate">{trial.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">
                      Expires {new Date(trial.trial_ends_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-sa-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <History size={18} className="text-sa-accent" />
              Recent Activity
            </h3>
            <ArrowUpRight size={18} className="text-sa-muted" />
          </div>
          <div className="divide-y divide-sa-border">
            {(data?.recentActivity || []).length === 0 ? (
              <div className="p-8 text-center text-sa-muted text-sm">No recent activity</div>
            ) : (
              (data?.recentActivity || []).map((item: any) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sa-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-sa-bg border border-sa-border shrink-0 text-sa-accent">
                      <History size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.description}</p>
                      <p className="text-[10px] text-sa-muted uppercase tracking-wider">
                        {new Date(item.created_at).toLocaleString()} • by {item.super_admin?.name || 'System'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-sa-accent/20 text-sa-accent self-start sm:self-center">
                    {item.action}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
