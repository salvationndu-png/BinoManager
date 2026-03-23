import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-primary-50 rounded-lg dark:bg-primary-900/20">
        <Icon size={24} className="text-primary-600 dark:text-primary-400" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        isPositive 
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
          : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
      )}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <p className="text-sm text-zinc-500 font-medium dark:text-zinc-400">{title}</p>
    <h3 className="text-2xl font-bold mt-1 dark:text-zinc-100">{value}</h3>
  </div>
);

import { cn } from '../lib/utils';

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight dark:text-zinc-100">Dashboard Overview</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base dark:text-zinc-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Download
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
            New Sale
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value="$128,430.00" 
          change="+12.5%" 
          isPositive={true} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Active Products" 
          value="1,240" 
          change="+3.2%" 
          isPositive={true} 
          icon={Package} 
        />
        <StatCard 
          title="Total Customers" 
          value="8,432" 
          change="+18.4%" 
          isPositive={true} 
          icon={Users} 
        />
        <StatCard 
          title="Net Profit" 
          value="$42,890.00" 
          change="-2.1%" 
          isPositive={false} 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg dark:text-zinc-100">Revenue Performance</h3>
            <select className="bg-zinc-50 border-none text-sm rounded-lg px-3 py-1 focus:ring-0 dark:bg-zinc-800 dark:text-zinc-300">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717a', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717a', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'white'
                  }}
                  itemStyle={{ color: '#1e3a8a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <h3 className="font-bold text-lg mb-6 dark:text-zinc-100">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { user: 'Sarah Connor', action: 'Purchased 5x Widget A', time: '2 mins ago', amount: '+$450.00' },
              { user: 'John Doe', action: 'Restocked Widget B', time: '15 mins ago', amount: '-$1,200.00' },
              { user: 'Mike Ross', action: 'New team member joined', time: '1 hour ago', amount: null },
              { user: 'Harvey Specter', action: 'Purchased 10x Widget C', time: '3 hours ago', amount: '+$1,200.00' },
              { user: 'Louis Litt', action: 'Subscription renewed', time: '5 hours ago', amount: '+$99.00' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-xs font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {item.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-zinc-100">{item.user}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.amount && <p className={cn("text-xs font-bold", item.amount.startsWith('+') ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{item.amount}</p>}
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-zinc-500 hover:text-primary-600 transition-colors border-t border-zinc-100 pt-4 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-primary-400">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
