import React from 'react';
import { Search, Filter, Mail, Phone, Calendar, MoreVertical, Download } from 'lucide-react';

const customers = [
  { name: 'Robert Fox', email: 'robert@example.com', phone: '(201) 555-0124', joined: 'Mar 12, 2024', spent: '$2,450.00' },
  { name: 'Jane Cooper', email: 'jane@example.com', phone: '(205) 555-0100', joined: 'Feb 28, 2024', spent: '$1,200.00' },
  { name: 'Wade Warren', email: 'wade@example.com', phone: '(207) 555-0119', joined: 'Jan 15, 2024', spent: '$4,890.00' },
  { name: 'Cameron Williamson', email: 'cameron@example.com', phone: '(208) 555-0112', joined: 'Dec 02, 2023', spent: '$850.00' },
  { name: 'Brooklyn Simmons', email: 'brooklyn@example.com', phone: '(209) 555-0104', joined: 'Nov 22, 2023', spent: '$3,120.00' },
];

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Customers</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">View and manage your customer database.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-4 justify-between bg-zinc-50/50 dark:bg-zinc-900/50 dark:border-zinc-800">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900/50 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Total Spent</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {customers.map((customer, i) => (
                <tr key={i} className="hover:bg-zinc-50 transition-colors group dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 font-bold text-xs dark:bg-zinc-800 dark:text-zinc-100">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-sm dark:text-zinc-100">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Mail size={12} />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Phone size={12} />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {customer.joined}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{customer.spent}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
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
