import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Upload, 
  Palette, 
  Layout as LayoutIcon, 
  Globe, 
  Bell, 
  Save,
  Check
} from 'lucide-react';

export default function Settings() {
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Settings</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">Configure your business branding and dashboard preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          {isSaved ? <Check size={18} /> : <Save size={18} />}
          {isSaved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Branding Section */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <Palette className="text-zinc-400 dark:text-zinc-500" size={20} />
            <h2 className="text-lg font-bold dark:text-zinc-100">Business Branding</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Business Logo</label>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500">
                  <Upload size={24} />
                </div>
                <div className="space-y-2">
                  <button className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm font-bold rounded-lg hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                    Upload New Logo
                  </button>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Recommended: 512x512px SVG or PNG</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Primary Brand Color</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <input 
                  type="text" 
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-mono dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Business Display Name</label>
              <input 
                type="text" 
                defaultValue="BinoManager"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* Dashboard Preferences */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <LayoutIcon className="text-zinc-400 dark:text-zinc-500" size={20} />
            <h2 className="text-lg font-bold dark:text-zinc-100">Dashboard Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Default Dashboard View</label>
              <select className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500">
                <option>Sales Overview</option>
                <option>Inventory Status</option>
                <option>Financial Summary</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Chart Style</label>
              <select className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500">
                <option>Smooth Area (Default)</option>
                <option>Sharp Line</option>
                <option>Bar Chart</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold dark:text-zinc-100">Show Recent Activity Feed</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Display the latest business actions on the dashboard</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-600 rounded dark:bg-zinc-800 dark:border-zinc-700" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold dark:text-zinc-100">Enable Real-time Updates</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Automatically refresh data without page reload</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-600 rounded dark:bg-zinc-800 dark:border-zinc-700" />
              </div>
            </div>
          </div>
        </section>

        {/* Localization & Regional */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <Globe className="text-zinc-400 dark:text-zinc-500" size={20} />
            <h2 className="text-lg font-bold dark:text-zinc-100">Localization</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Currency</label>
              <select className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>NGN (₦)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Timezone</label>
              <select className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-primary-500">
                <option>(GMT-08:00) Pacific Time</option>
                <option>(GMT+00:00) London</option>
                <option>(GMT+01:00) Lagos</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
