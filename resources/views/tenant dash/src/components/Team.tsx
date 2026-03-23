import React from 'react';
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, UserPlus } from 'lucide-react';

const team = [
  { name: 'Alex Johnson', role: 'Administrator', email: 'alex@binomanager.com', status: 'Active', avatar: 'https://picsum.photos/seed/alex/100/100' },
  { name: 'Sarah Miller', role: 'Sales Manager', email: 'sarah@binomanager.com', status: 'Active', avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { name: 'Michael Chen', role: 'Inventory Lead', email: 'michael@binomanager.com', status: 'Away', avatar: 'https://picsum.photos/seed/michael/100/100' },
  { name: 'Emma Wilson', role: 'Support Agent', email: 'emma@binomanager.com', status: 'Active', avatar: 'https://picsum.photos/seed/emma/100/100' },
  { name: 'David Smith', role: 'Accountant', email: 'david@binomanager.com', status: 'Offline', avatar: 'https://picsum.photos/seed/david/100/100' },
];

export default function Team() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Team Members</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">Manage your staff and their access permissions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
          <UserPlus size={18} />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex justify-between items-start">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
                  <img src={member.avatar} alt={member.name} referrerPolicy="no-referrer" />
                </div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${
                  member.status === 'Active' ? 'bg-emerald-500' : member.status === 'Away' ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}></div>
              </div>
              <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold text-lg dark:text-zinc-100">{member.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.role}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <Mail size={16} />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <Phone size={16} />
                <span>+1 (555) 000-0000</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              <button className="flex-1 py-2 bg-zinc-50 text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                View Profile
              </button>
              <button className="flex-1 py-2 bg-zinc-50 text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                Permissions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
