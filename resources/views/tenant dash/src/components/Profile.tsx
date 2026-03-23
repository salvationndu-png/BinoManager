import React from 'react';
import { Settings, User, Mail, Shield, Bell, Globe, Camera } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Profile Settings</h1>
        <p className="text-zinc-500 mt-1 dark:text-zinc-400">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-2">
          {[
            { id: 'personal', label: 'Personal Info', icon: User, active: true },
            { id: 'security', label: 'Security', icon: Shield, active: false },
            { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
            { id: 'preferences', label: 'Preferences', icon: Globe, active: false },
          ].map(item => (
            <button 
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                item.active 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-8 dark:bg-zinc-900 dark:border-zinc-800">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-zinc-100 overflow-hidden border-4 border-white shadow-md dark:bg-zinc-800 dark:border-zinc-700">
                  <img src="https://picsum.photos/seed/alex/200/200" alt="Profile" referrerPolicy="no-referrer" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-zinc-100">Alex Johnson</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Administrator • San Francisco, CA</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                    Change Photo
                  </button>
                  <button className="px-3 py-1.5 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition-colors dark:text-rose-400 dark:hover:bg-rose-500/10">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">First Name</label>
                <input 
                  type="text" 
                  defaultValue="Alex"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Last Name</label>
                <input 
                  type="text" 
                  defaultValue="Johnson"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                  <input 
                    type="email" 
                    defaultValue="alex.johnson@binomanager.com"
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Bio</label>
                <textarea 
                  rows={4}
                  defaultValue="Product lead at BinoManager. Passionate about building tools that help small businesses thrive in the digital age."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3 dark:border-zinc-800">
              <button className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                Cancel
              </button>
              <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
