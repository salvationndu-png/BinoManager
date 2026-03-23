import React, { useState } from 'react';
import { BarChart3, TrendingUp, Package, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiGet } from '../lib/api';
import { cn } from '../lib/utils';

const COLORS = ['#0b5e57','#2563eb','#7c3aed','#d97706','#e11d48','#0891b2'];
const fmt = (n: number) => '₦' + n.toLocaleString('en-NG', {minimumFractionDigits:2});
const fmtK = (n: number) => n >= 1000 ? '₦'+(n/1000).toFixed(0)+'k' : '₦'+n;

interface ProfitData { totalProfit: number; avgMargin: number; products: {name:string;revenue:number;cost:number;profit:number;margin:number;quantity:number}[] }
interface InvData { totalValue: number; inventory: {name:string;total_value:number;quantity:number;price:number;cost_price:number}[] }

export default function Analytics() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0,10));
  const [profitData, setProfitData] = useState<ProfitData|null>(null);
  const [invData, setInvData] = useState<InvData|null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const [plResponse, invResponse] = await Promise.all([
        apiGet(`/analytics/profit-loss?start_date=${startDate}&end_date=${endDate}`),
        apiGet('/analytics/inventory-valuation'),
      ]);
      // Extract data from API response wrapper
      const pl = plResponse.success ? {
        totalProfit: plResponse.totalProfit,
        avgMargin: plResponse.avgMargin,
        products: plResponse.products
      } : null;
      const inv = invResponse.success ? {
        totalValue: invResponse.totalValue,
        inventory: invResponse.inventory
      } : null;
      setProfitData(pl); setInvData(inv); setLoaded(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const pieData = invData?.inventory.slice(0,6).map(i => ({ name: i.name.length > 16 ? i.name.slice(0,16)+'…' : i.name, value: i.total_value })) ?? [];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Business Analytics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Profit/loss, margins and inventory valuation</p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
          </div>
          <button onClick={generate} disabled={loading}
            className="py-2.5 px-6 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating…</> : <><BarChart3 size={16}/>Generate Report</>}
          </button>
        </div>
      </div>

      {loaded && profitData && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Profit', value: fmt(profitData.totalProfit), icon: TrendingUp, green: profitData.totalProfit >= 0 },
              { label: 'Avg Margin', value: profitData.avgMargin.toFixed(1) + '%', icon: ArrowUpRight, green: profitData.avgMargin >= 0 },
              { label: 'Products Sold', value: profitData.products.length.toString(), icon: Package, green: true },
            ].map((k, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${k.green ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                  <k.icon size={18} className={k.green ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}/>
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.green ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Revenue vs Profit by Product</h3>
              <p className="text-xs text-zinc-400 mb-4">{startDate} → {endDate}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData.products.slice(0,8).map(p => ({name: p.name.length>14?p.name.slice(0,14)+'…':p.name, revenue: p.revenue, profit: p.profit}))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" className="dark:stroke-zinc-800"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} tickFormatter={fmtK}/>
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} formatter={(v:any,n:string) => [fmt(v), n.charAt(0).toUpperCase()+n.slice(1)]}/>
                    <Bar dataKey="revenue" fill="#0b5e57" radius={[4,4,0,0]} name="Revenue"/>
                    <Bar dataKey="profit" fill="#10b981" radius={[4,4,0,0]} name="Profit"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {pieData.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Inventory Valuation</h3>
                <p className="text-xs text-zinc-400 mb-4">Total: {fmt(invData?.totalValue ?? 0)}</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,percent}) => `${(percent*100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={(v:any) => fmt(v)}/>
                      <Legend formatter={(v) => <span className="text-xs text-zinc-500 dark:text-zinc-400">{v}</span>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Profit table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Product Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    {['Product','Qty Sold','Revenue','Cost','Profit','Margin'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {profitData.products.map((p, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 font-semibold text-sm text-zinc-800 dark:text-zinc-200">{p.name}</td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{p.quantity}</td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{fmt(p.revenue)}</td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{fmt(p.cost)}</td>
                      <td className="px-5 py-3 font-bold text-sm"><span className={p.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{fmt(p.profit)}</span></td>
                      <td className="px-5 py-3 text-sm"><span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", p.margin >= 30 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{p.margin.toFixed(1)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loaded && !loading && (
        <div className="py-16 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-zinc-200 dark:text-zinc-700"/>
          <p className="text-zinc-400 font-medium">Select a date range and click Generate Report</p>
        </div>
      )}
    </div>
  );
}
