import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Users, AlertTriangle, Banknote, ArrowUpRight, ArrowDownRight, Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiGet } from '../lib/api';
import { cn } from '../lib/utils';

interface DashboardData {
  totalRevenue: number;
  revenueChange: number;
  totalProducts: number;
  productsChange: number;
  totalCustomers: number;
  customersChange: number;
  topSelling: { name: string; units: number; revenue: number } | null;
  todaysSales: number;
  salesChange: number;
  totalStock: number;
  outstandingBalance: number;
  lowStockCount: number;
  revenueTrend: { labels: string[]; data: number[] };
  topProducts: { labels: string[]; rev: number[] };
  recentSales: { product: string; customer: string; amount: number; method: string; ago: string }[];
  lowStockItems: { name: string; quantity: number }[];
  staffLeaderboard: { name: string; sales: number; count: number }[];
}

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });
const fmtK = (n: number) => n >= 1000 ? '₦' + (n / 1000).toFixed(0) + 'k' : fmt(n);

function KpiCard({ title, value, change, icon: Icon, iconBg, iconColor }: any) {
  const up = change > 0, down = change < 0;
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>
        {(up || down) && (
          <span className={cn("flex items-center gap-1 text-xs font-semibold",
            up ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
            {up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
            {up ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{title}</p>
      <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-zinc-900 dark:text-white truncate">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = window.BinoManager?.user?.isAdmin;

  useEffect(() => {
    apiGet<DashboardData>('/api/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const revenueChartData = data
    ? data.revenueTrend.labels.map((label, i) => ({ name: label, revenue: data.revenueTrend.data[i] }))
    : [];
  const topProdData = data
    ? data.topProducts.labels.map((label, i) => ({ name: label.length > 14 ? label.slice(0,14)+'…' : label, revenue: data.topProducts.rev[i] }))
    : [];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"/>)}
      </div>
      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"/>
        <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"/>
      </div>
    </div>
  );

  const user = window.BinoManager?.user;
  const planFeatures = window.BinoManager?.planFeatures ?? [];
  const tenantPlan = window.BinoManager?.tenant?.plan;
  const tenantPlanSlug = window.BinoManager?.tenant?.planSlug;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  
  // Debug: Log plan info
  console.log('🔍 Plan Debug:', { tenantPlan, tenantPlanSlug, planFeatures });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">
            {greet}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Today's Revenue" value={fmt(data?.todaysSales ?? 0)} change={data?.salesChange ?? 12.5}
          icon={Banknote} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
        {isAdmin && (
          <KpiCard title="Active Products" value={(data?.totalProducts ?? 0).toLocaleString()} change={data?.productsChange ?? 3.2}
            icon={Package} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
        )}
        {isAdmin && (
          <KpiCard title="Total Customers" value={(data?.totalCustomers ?? 0).toLocaleString()} change={data?.customersChange ?? 18.4}
            icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
        )}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Trophy size={24} className="text-amber-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Top Selling Product</p>
          {data?.topSelling ? (
            <>
              <p className="text-lg font-bold text-zinc-900 dark:text-white truncate mb-1">{data.topSelling.name}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{data.topSelling.units} units</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(data.topSelling.revenue)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400">No sales this month</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Revenue Trend</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Last 30 days</p>
            </div>
          </div>
          {revenueChartData.some(d => d.revenue > 0) ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b5e57" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0b5e57" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-zinc-800"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} dy={8} interval={4}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:11}} tickFormatter={fmtK}/>
                  <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 8px 24px rgba(0,0,0,.12)'}}
                    formatter={(v: any) => [fmt(v), 'Revenue']}/>
                  <Area type="monotone" dataKey="revenue" stroke="#0b5e57" strokeWidth={2.5} fill="url(#revGrad)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-zinc-300 dark:text-zinc-700 flex-col gap-2">
              <TrendingUp size={40} />
              <p className="text-sm text-zinc-400">No revenue data yet</p>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Top Products</h3>
            <p className="text-xs text-zinc-400 mb-5">This month by revenue</p>
            {topProdData.length > 0 ? (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProdData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-zinc-800"/>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} tickFormatter={fmtK}/>
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:10}} width={80}/>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} formatter={(v:any) => [fmt(v),'Revenue']}/>
                    <Bar dataKey="revenue" fill="#0b5e57" radius={[0,6,6,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-zinc-300 dark:text-zinc-700 flex-col gap-2">
                <Package size={40}/>
                <p className="text-sm text-zinc-400">No sales this month</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent sales */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4">Recent Sales</h3>
          <div className="space-y-1">
            {(data?.recentSales ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-400">No sales yet</p>
            ) : data?.recentSales.map((s, i) => {
              const colors = ['bg-teal-500','bg-blue-500','bg-purple-500','bg-amber-500','bg-rose-500'];
              return (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-zinc-50 dark:border-zinc-800 last:border-none">
                  <div className={`w-9 h-9 rounded-xl ${colors[i % colors.length]} grid place-items-center text-white text-xs font-bold flex-shrink-0`}>
                    {s.product.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.product}</p>
                    <p className="text-xs text-zinc-400 truncate">{s.customer}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{fmt(s.amount)}</p>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      s.method === 'Cash' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
                      {s.method}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Low stock - Admin only */}
          {isAdmin && (data?.lowStockItems ?? []).length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500"/> Low Stock
                </h3>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                  {data?.lowStockCount} items
                </span>
              </div>
              <div className="space-y-3">
                {data?.lowStockItems.map((item, i) => {
                  const pct = Math.max(4, Math.min(100, (item.quantity / 10) * 100));
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate pr-4">{item.name}</span>
                        <span className={`font-bold flex-shrink-0 ${item.quantity <= 3 ? 'text-rose-600' : 'text-amber-600'}`}>
                          {item.quantity} left
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.quantity <= 3 ? 'bg-rose-400' : 'bg-amber-400'}`} style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff leaderboard - Admin only */}
          {isAdmin && (data?.staffLeaderboard ?? []).length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4">🏆 Today's Leaderboard</h3>
              <div className="space-y-2">
                {data?.staffLeaderboard.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-none">
                    <span className="w-6 text-center text-sm font-bold text-zinc-400">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary-600 grid place-items-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                      <p className="text-xs text-zinc-400">{s.count} sale{s.count !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{fmt(s.sales)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
