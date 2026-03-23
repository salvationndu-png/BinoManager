import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, UserPlus, Activity, ArrowUpRight, Clock, ShieldCheck, ShieldAlert, UserCog, History, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { saGet, saPost } from '../lib/api';
import { SAPage } from '../types';

const PLAN_COLORS = ['#10b981','#3b82f6','#8b5cf6'];
const TTip = { contentStyle: { backgroundColor:'var(--sa-card)', border:'1px solid var(--sa-border)', borderRadius:'8px', color:'var(--sa-text)' }, itemStyle:{color:'var(--sa-accent)'} };

const KPICard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
  <div className="bg-sa-card border border-sa-border p-6 rounded-2xl hover:border-sa-accent/50 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-sa-bg border border-sa-border group-hover:bg-sa-accent/10 group-hover:border-sa-accent/20 transition-colors">
        <Icon size={20} className="text-sa-muted group-hover:text-sa-accent transition-colors"/>
      </div>
      <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", trend==='up'?"bg-emerald-500/10 text-emerald-500":"bg-red-500/10 text-red-500")}>
        {trend==='up'?<TrendingUp size={12}/>:<TrendingDown size={12}/>}{trendValue}
      </div>
    </div>
    <p className="text-sa-muted text-sm font-medium mb-1">{label}</p>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
  </div>
);

export const Dashboard = ({ setPage }: { setPage?: (p: SAPage) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [extending, setExtending] = useState<number|null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await saGet('/superadmin/api/dashboard');
      setData(d);
    } catch (e: any) {
      console.error('Dashboard API error:', e);
      setError(e.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleExtend = async (tenantId: number) => {
    setExtending(tenantId);
    try {
      await saPost(`/superadmin/tenants/${tenantId}/extend-trial`, { days: 7 });
      await loadData();
    } catch (e) { console.error(e); }
    finally { setExtending(null); }
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_,i) => <div key={i} className="h-32 bg-sa-card rounded-2xl border border-sa-border"/>)}</div>
      <div className="h-80 bg-sa-card rounded-2xl border border-sa-border"/>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <Activity size={24} className="text-red-400"/>
      </div>
      <div className="text-center">
        <h3 className="font-bold text-lg mb-1">Failed to load dashboard</h3>
        <p className="text-sa-muted text-sm mb-4 max-w-sm">{error}</p>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-sa-accent text-sa-bg rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors mx-auto">
          <RefreshCw size={15}/> Try Again
        </button>
      </div>
    </div>
  );

  const revenueChart = data?.revenueChart ?? [];
  const signupsChart = data?.signupsChart ?? [];
  const planDist = data?.planDistribution ?? [];
  const expiringTrials = data?.expiringTrials ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const fmt = (n: number) => '₦' + (n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'k' : n.toLocaleString());

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-sa-muted text-sm">Real-time business health metrics</p>
        </div>
        <button onClick={loadData}
          className="flex items-center gap-2 text-sa-muted hover:text-sa-accent transition-colors text-sm">
          <RefreshCw size={15}/> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Monthly Recurring Revenue" value={fmt(data?.mrr ?? 0)} trend={data?.mrrGrowth >= 0 ? 'up':'down'} trendValue={`${Math.abs(data?.mrrGrowth ?? 0).toFixed(1)}%`} icon={DollarSign}/>
        <KPICard label="Active Tenants" value={data?.activeTenants ?? 0} trend="up" trendValue={`${data?.trialingTenants ?? 0} trialing`} icon={Users}/>
        <KPICard label="New Signups (30d)" value={data?.newSignupsThisMonth ?? 0} trend="up" trendValue="last 30 days" icon={UserPlus}/>
        <KPICard label="Churn Rate" value={`${data?.churnRate ?? 0}%`} trend={data?.churnRate > 5 ? 'down':'up'} trendValue={`${data?.churnedThisMonth ?? 0} this month`} icon={Activity}/>
      </div>

      {/* Status pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Active', val: data?.activeTenants ?? 0, color:'bg-emerald-500' },
          { label:'Trialing', val: data?.trialingTenants ?? 0, color:'bg-blue-500' },
          { label:'Grace', val: data?.graceTenants ?? 0, color:'bg-amber-500' },
          { label:'Suspended', val: data?.suspendedTenants ?? 0, color:'bg-red-500' },
        ].map(s => (
          <div key={s.label} onClick={() => setPage?.('tenants')}
            className="bg-sa-card border border-sa-border p-4 rounded-xl flex items-center justify-between hover:bg-sa-accent/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${s.color}`}/><span className="text-sm text-sa-muted">{s.label}</span></div>
            <span className="text-lg font-bold">{s.val}</span>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <div><h3 className="text-lg font-bold">Revenue — Last 12 Months</h3><p className="text-xs text-sa-muted mt-1">Total platform payments received</p></div>
          <div className="text-right"><p className="text-2xl font-bold text-sa-accent">{fmt(data?.mrr ?? 0)}</p><p className="text-[10px] text-sa-muted uppercase tracking-wider">Current MRR</p></div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart.map((r:any) => ({month: r.month, revenue: r.revenue}))}>
              <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--sa-border)" vertical={false}/>
              <XAxis dataKey="month" stroke="var(--sa-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
              <YAxis stroke="var(--sa-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)}/>
              <Tooltip {...TTip} formatter={(v:any) => [fmt(Number(v)), 'Revenue']}/>
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Signups + Plan dist */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-sa-card border border-sa-border rounded-2xl p-6 lg:p-8">
          <h3 className="text-lg font-bold mb-6">Signups Growth</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupsChart.map((s:any) => ({month:s.month, signups:s.count}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sa-border)" vertical={false}/>
                <XAxis dataKey="month" stroke="var(--sa-muted)" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="var(--sa-muted)" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip cursor={{fill:'var(--sa-border)'}} {...TTip}/>
                <Bar dataKey="signups" fill="var(--sa-accent)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sa-card border border-sa-border rounded-2xl p-6 lg:p-8 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Plan Distribution</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">{planDist.reduce((a:number, p:any) => a + p.count, 0)}</span>
              <span className="text-[10px] text-sa-muted uppercase tracking-widest">Total Active</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={planDist.map((p:any, i:number) => ({...p, color: PLAN_COLORS[i % PLAN_COLORS.length]}))} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="count">
                {planDist.map((_:any, i:number) => <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]}/>)}
              </Pie><Tooltip {...TTip} formatter={(v:any,_:any,e:any) => [v, e?.payload?.plan]}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {planDist.map((p:any, i:number) => (
              <div key={p.plan} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: PLAN_COLORS[i % PLAN_COLORS.length]}}/>
                <span className="text-xs text-sa-muted">{p.plan} ({p.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trials + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-sa-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Clock size={18} className="text-amber-500"/>Trials Expiring Soon</h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full font-medium">{expiringTrials.length} pending</span>
          </div>
          <div className="divide-y divide-sa-border">
            {expiringTrials.length === 0 ? (
              <p className="p-6 text-sm text-sa-muted text-center">No trials expiring in the next 3 days</p>
            ) : expiringTrials.map((t:any) => {
              const hoursLeft = Math.max(0, Math.round((new Date(t.trial_ends_at).getTime() - Date.now()) / 3600000));
              return (
                <div key={t.id} className="p-4 flex items-center justify-between gap-4 hover:bg-sa-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sa-bg border border-sa-border flex items-center justify-center font-bold text-sa-muted shrink-0">
                      {(t.settings?.business_name ?? t.name).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate">{t.settings?.business_name ?? t.name}</p>
                      <p className="text-xs text-sa-muted">{t.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", hoursLeft < 24 ? "bg-red-500/10 text-red-500":"bg-sa-muted/10 text-sa-muted")}>
                      {hoursLeft}h left
                    </span>
                    <button onClick={() => handleExtend(t.id)} disabled={extending === t.id}
                      className="text-xs font-bold text-sa-accent hover:underline disabled:opacity-50">
                      {extending === t.id ? '...' : '+7 days'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 bg-sa-bg/50 text-center">
            <button onClick={() => setPage?.('tenants')} className="text-xs font-bold text-sa-muted hover:text-sa-text transition-colors">View All Tenants →</button>
          </div>
        </div>

        <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-sa-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><History size={18} className="text-sa-accent"/>Recent Activity</h3>
            <ArrowUpRight size={18} className="text-sa-muted"/>
          </div>
          <div className="divide-y divide-sa-border">
            {recentActivity.length === 0 ? (
              <p className="p-6 text-sm text-sa-muted text-center">No recent activity</p>
            ) : recentActivity.map((a:any, i:number) => {
              const iconMap: any = { 'tenant.suspend': ShieldAlert, 'tenant.unsuspend': ShieldCheck, 'tenant.impersonate': UserCog };
              const colorMap: any = { 'tenant.suspend':'text-red-500', 'tenant.unsuspend':'text-emerald-500', 'tenant.impersonate':'text-amber-500' };
              const Icon = iconMap[a.action] ?? ArrowUpRight;
              const color = colorMap[a.action] ?? 'text-blue-500';
              return (
                <div key={i} className="p-4 flex items-center justify-between gap-4 hover:bg-sa-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full bg-sa-bg border border-sa-border shrink-0", color)}><Icon size={16}/></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.description}{a.tenant && <span className="text-sa-muted"> — <span className="font-bold">{a.tenant.name}</span></span>}</p>
                      <p className="text-[10px] text-sa-muted">{new Date(a.created_at).toLocaleString()} · {a.super_admin?.name}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border shrink-0", `${color} border-current/20`)}>{a.action.split('.')[1]}</span>
                </div>
              );
            })}
          </div>
          <div className="p-4 bg-sa-bg/50 text-center">
            <button onClick={() => setPage?.('audit')} className="text-xs font-bold text-sa-muted hover:text-sa-text transition-colors">View Full Audit Log →</button>
          </div>
        </div>
      </div>
    </div>
  );
};
