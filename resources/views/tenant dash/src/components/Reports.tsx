import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  Package,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Sale, Product } from '../types';
import { motion } from 'motion/react';

// Mock Products for reference
const mockProducts: Product[] = [
  { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', price: 299.99, stock: 45, sku: 'SKU-001' },
  { id: '2', name: 'Ergonomic Office Chair', category: 'Furniture', price: 189.50, stock: 12, sku: 'SKU-002' },
  { id: '3', name: 'Mechanical Keyboard', category: 'Electronics', price: 129.00, stock: 89, sku: 'SKU-003' },
];

// Generate mock sales data for the last 30 days
const generateMockSales = (): Sale[] => {
  const sales: Sale[] = [];
  const now = new Date();
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 30));
    
    const itemsCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let total = 0;
    
    for (let j = 0; j < itemsCount; j++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      items.push({
        productId: product.id,
        quantity,
        price: product.price
      });
      total += product.price * quantity;
    }
    
    sales.push({
      id: `SALE-${1000 + i}`,
      date: date.toISOString(),
      items,
      total,
      customer: ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown'][Math.floor(Math.random() * 4)]
    });
  }
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const mockSales = generateMockSales();

export default function Reports() {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const filteredSales = useMemo(() => {
    return mockSales.filter(sale => {
      const saleDate = sale.date.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [startDate, endDate]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculate top products
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        if (product) {
          if (!productSales[product.id]) {
            productSales[product.id] = { name: product.name, quantity: 0, revenue: 0 };
          }
          productSales[product.id].quantity += item.quantity;
          productSales[product.id].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return { totalRevenue, totalSales, avgOrderValue, topProducts };
  }, [filteredSales]);

  const chartData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    // Initialize all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dailyData[d.toISOString().split('T')[0]] = 0;
    }

    filteredSales.forEach(sale => {
      const date = sale.date.split('T')[0];
      if (dailyData[date] !== undefined) {
        dailyData[date] += sale.total;
      }
    });

    return Object.entries(dailyData).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      amount
    }));
  }, [filteredSales, startDate, endDate]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Sales Reports</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">Analyze your business performance and sales trends.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-xl border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700">
            <Calendar size={16} className="text-zinc-400 dark:text-zinc-500" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none dark:text-zinc-100"
            />
          </div>
          <span className="text-zinc-300 dark:text-zinc-600">to</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-xl border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700">
            <Calendar size={16} className="text-zinc-400 dark:text-zinc-500" />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none dark:text-zinc-100"
            />
          </div>
          <button className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-500/10 dark:text-emerald-400">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full dark:bg-emerald-500/10 dark:text-emerald-400">
              <ArrowUpRight size={14} />
              12.5%
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</p>
          <h3 className="text-3xl font-bold mt-1 dark:text-zinc-100">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl dark:bg-primary-900/20 dark:text-primary-400">
              <ShoppingCart size={24} />
            </div>
            <div className="flex items-center gap-1 text-primary-600 text-xs font-bold bg-primary-50 px-2 py-1 rounded-full dark:bg-primary-900/20 dark:text-primary-400">
              <ArrowUpRight size={14} />
              8.2%
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Sales</p>
          <h3 className="text-3xl font-bold mt-1 dark:text-zinc-100">{stats.totalSales}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-500/10 dark:text-amber-400">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-full dark:bg-rose-500/10 dark:text-rose-400">
              <ArrowDownRight size={14} />
              3.1%
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg. Order Value</p>
          <h3 className="text-3xl font-bold mt-1 dark:text-zinc-100">${stats.avgOrderValue.toFixed(2)}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg dark:text-zinc-100">Revenue Over Time</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-bold bg-primary-600 text-white rounded-lg">Daily</button>
              <button className="px-3 py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg dark:text-zinc-400 dark:hover:bg-zinc-800">Weekly</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-zinc-500 dark:text-zinc-500"
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-zinc-500 dark:text-zinc-500"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg, #fff)', 
                    color: 'var(--tooltip-text, #000)',
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <h3 className="font-bold text-lg mb-6 dark:text-zinc-100">Top Products</h3>
          <div className="space-y-6">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary-600 group-hover:text-white transition-all dark:bg-zinc-800 dark:text-zinc-500 dark:group-hover:bg-primary-600 dark:group-hover:text-white">
                  <Package size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate dark:text-zinc-100">{product.name}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5 dark:text-zinc-400">{product.quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold dark:text-zinc-100">${product.revenue.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600 mt-0.5 dark:text-emerald-400">
                    <ArrowUpRight size={10} />
                    {Math.floor(Math.random() * 20) + 5}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-zinc-50 text-zinc-900 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            View All Products
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800">
          <h3 className="font-bold text-lg dark:text-zinc-100">Transaction History</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/30 dark:bg-zinc-900 dark:border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Items</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right dark:text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredSales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm dark:text-zinc-100">{sale.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium dark:text-zinc-100">{sale.customer}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-wider dark:bg-emerald-500/10 dark:text-emerald-400">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-center dark:bg-zinc-900 dark:border-zinc-800">
          <button className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-100">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
