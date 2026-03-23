import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Layers,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Product } from '../types';
import { motion } from 'motion/react';

const mockProducts: Product[] = [
  { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', price: 299.99, stock: 45, sku: 'SKU-001' },
  { id: '2', name: 'Ergonomic Office Chair', category: 'Furniture', price: 189.50, stock: 12, sku: 'SKU-002' },
  { id: '3', name: 'Mechanical Keyboard', category: 'Electronics', price: 129.00, stock: 89, sku: 'SKU-003' },
  { id: '4', name: 'Smart Watch Pro', category: 'Electronics', price: 199.00, stock: 34, sku: 'SKU-004' },
  { id: '5', name: 'Designer Desk Lamp', category: 'Furniture', price: 89.00, stock: 15, sku: 'SKU-005' },
];

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function Analytics() {
  const inventoryMetrics = useMemo(() => {
    const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalItems = mockProducts.reduce((sum, p) => sum + p.stock, 0);
    
    const categoryValuation: Record<string, number> = {};
    mockProducts.forEach(p => {
      categoryValuation[p.category] = (categoryValuation[p.category] || 0) + (p.price * p.stock);
    });

    const pieData = Object.entries(categoryValuation).map(([name, value]) => ({ name, value }));
    
    return { totalValue, totalItems, pieData };
  }, []);

  const performanceData = [
    { name: 'Headphones', sales: 120, revenue: 35998, margin: 42 },
    { name: 'Chair', sales: 45, revenue: 8527, margin: 35 },
    { name: 'Keyboard', sales: 89, revenue: 11481, margin: 28 },
    { name: 'Watch', sales: 67, revenue: 13333, margin: 45 },
    { name: 'Lamp', sales: 32, revenue: 2848, margin: 30 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Business Analytics</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">Inventory valuation and product performance insights.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
              <DollarSign size={20} />
            </div>
            <h4 className="font-bold text-sm text-zinc-500 dark:text-zinc-400">Total Inventory Value</h4>
          </div>
          <p className="text-3xl font-bold tracking-tight dark:text-zinc-100">${inventoryMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2 dark:text-emerald-400">
            <ArrowUpRight size={14} />
            +5.2% from last week
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
              <Package size={20} />
            </div>
            <h4 className="font-bold text-sm text-zinc-500 dark:text-zinc-400">Total Stock Units</h4>
          </div>
          <p className="text-3xl font-bold tracking-tight dark:text-zinc-100">{inventoryMetrics.totalItems.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-rose-600 text-xs font-bold mt-2 dark:text-rose-400">
            <ArrowDownRight size={14} />
            -2.1% from last week
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
              <Activity size={20} />
            </div>
            <h4 className="font-bold text-sm text-zinc-500 dark:text-zinc-400">Avg. Product Margin</h4>
          </div>
          <p className="text-3xl font-bold tracking-tight dark:text-zinc-100">36.4%</p>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2 dark:text-emerald-400">
            <ArrowUpRight size={14} />
            +1.4% from last month
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Valuation by Category */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-8">
            <PieChartIcon className="text-zinc-400 dark:text-zinc-500" size={20} />
            <h3 className="font-bold text-lg dark:text-zinc-100">Valuation by Category</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryMetrics.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {inventoryMetrics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    color: 'var(--tooltip-text, #000)'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance Chart */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-zinc-400 dark:text-zinc-500" size={20} />
            <h3 className="font-bold text-lg dark:text-zinc-100">Product Performance (Revenue)</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: 'currentColor' }}
                  className="text-zinc-900 dark:text-zinc-400"
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.1 }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    color: 'var(--tooltip-text, #000)'
                  }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex items-center gap-3 dark:bg-zinc-900 dark:border-zinc-800">
          <Layers className="text-zinc-400 dark:text-zinc-500" size={20} />
          <h3 className="font-bold text-lg dark:text-zinc-100">Detailed Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/30 dark:bg-zinc-900 dark:border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Product Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Units Sold</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Total Revenue</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Profit Margin</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right dark:text-zinc-500">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {performanceData.map((item, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 font-medium dark:text-zinc-400">
                    {item.sales}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden max-w-[100px] dark:bg-zinc-800">
                        <div 
                          className="h-full bg-primary-600 rounded-full" 
                          style={{ width: `${item.margin}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.margin}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${index % 2 === 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                      {index % 2 === 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {Math.floor(Math.random() * 15) + 2}%
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
}
