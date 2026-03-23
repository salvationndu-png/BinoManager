import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical,
  Mail,
  Phone,
  ArrowUpRight
} from 'lucide-react';
import { Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const mockCustomers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', creditLimit: 5000, outstandingBalance: 1200, status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1 987 654 321', creditLimit: 2000, outstandingBalance: 1950, status: 'active' },
  { id: '3', name: 'Robert Wilson', email: 'robert@example.com', phone: '+1 555 000 111', creditLimit: 10000, outstandingBalance: 0, status: 'active' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+1 444 222 333', creditLimit: 1500, outstandingBalance: 1600, status: 'blocked' },
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    creditLimit: 0,
    outstandingBalance: 0,
    status: 'active'
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      creditLimit: Number(newCustomer.creditLimit) || 0,
      outstandingBalance: Number(newCustomer.outstandingBalance) || 0,
      status: 'active'
    };
    setCustomers([customer, ...customers]);
    setIsAdding(false);
    setNewCustomer({ name: '', email: '', phone: '', creditLimit: 0, outstandingBalance: 0, status: 'active' });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Customer Management</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">Manage customer profiles, credit limits, and balances.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          <UserPlus size={20} />
          Add New Customer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Search customers by name or email..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const creditUsedPercent = (customer.outstandingBalance / customer.creditLimit) * 100;
          const isOverLimit = customer.outstandingBalance > customer.creditLimit;

          return (
            <motion.div 
              layout
              key={customer.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all overflow-hidden group dark:bg-zinc-900 dark:border-zinc-800"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-primary-600 group-hover:text-white transition-all dark:bg-zinc-800 dark:text-zinc-500 dark:group-hover:bg-primary-600 dark:group-hover:text-white">
                      <span className="text-lg font-bold">{customer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{customer.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1 dark:text-zinc-400">
                        <span className={`w-2 h-2 rounded-full ${customer.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {customer.status === 'active' ? 'Active Account' : 'Account Blocked'}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-lg transition-colors dark:hover:bg-zinc-800">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Mail size={16} className="text-zinc-400 dark:text-zinc-500" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Phone size={16} className="text-zinc-400 dark:text-zinc-500" />
                    {customer.phone}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 space-y-4 dark:border-zinc-800">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 dark:text-zinc-500">Outstanding Balance</p>
                      <p className={`text-xl font-bold ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        ${customer.outstandingBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 dark:text-zinc-500">Credit Limit</p>
                      <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">${customer.creditLimit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-zinc-400 dark:text-zinc-500">Credit Utilization</span>
                      <span className={isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-600 dark:text-zinc-400'}>
                        {creditUsedPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-rose-500' : creditUsedPercent > 80 ? 'bg-amber-500' : 'bg-primary-600'}`}
                        style={{ width: `${Math.min(100, creditUsedPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center dark:bg-zinc-900/50 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  {isOverLimit || customer.status === 'blocked' ? (
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] uppercase dark:text-rose-400">
                      <AlertCircle size={14} />
                      Ineligible for Credit
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase dark:text-emerald-400">
                      <CheckCircle2 size={14} />
                      Eligible for Credit
                    </div>
                  )}
                </div>
                <button className="text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1 dark:text-zinc-100">
                  View History
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden dark:bg-zinc-900 dark:border dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 bg-primary-900 text-white flex justify-between items-center dark:bg-primary-950 dark:border-zinc-800">
                <h3 className="font-bold text-lg">Add New Customer</h3>
                <button onClick={() => setIsAdding(false)} className="text-primary-300 hover:text-white transition-colors">
                  <AlertCircle className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase dark:text-zinc-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      value={newCustomer.name}
                      onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase dark:text-zinc-400">Email</label>
                      <input 
                        required
                        type="email" 
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase dark:text-zinc-400">Phone</label>
                      <input 
                        required
                        type="tel" 
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1 dark:text-zinc-400">
                        <CreditCard size={12} />
                        Credit Limit
                      </label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                        value={newCustomer.creditLimit}
                        onChange={e => setNewCustomer({...newCustomer, creditLimit: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1 dark:text-zinc-400">
                        <DollarSign size={12} />
                        Initial Balance
                      </label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                        value={newCustomer.outstandingBalance}
                        onChange={e => setNewCustomer({...newCustomer, outstandingBalance: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
