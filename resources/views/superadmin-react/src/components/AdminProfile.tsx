import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  History,
  ExternalLink,
  Edit3,
  LogOut,
  Smartphone,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const recentActivity = [
  { id: 1, action: 'suspend', desc: 'Suspended workspace "BadActor Ltd"', time: '2m ago' },
  { id: 2, action: 'unsuspend', desc: 'Restored workspace "GoodVibes Inc"', time: '15m ago' },
  { id: 3, action: 'impersonate', desc: 'Impersonated admin for "HelpDesk Pro"', time: '1h ago' },
  { id: 4, action: 'login', desc: 'Login successful', time: '1d ago' },
];

export const AdminProfile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Profile & Security</h2>
        <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-bold">
          <LogOut size={18} />
          Sign Out of All Devices
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-sa-card border border-sa-border rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sa-accent to-emerald-400 p-1 mb-6">
              <div className="w-full h-full rounded-full bg-sa-card flex items-center justify-center text-3xl font-bold text-sa-accent">
                SN
              </div>
            </div>
            <h3 className="text-xl font-bold mb-1">Salvation Ndu</h3>
            <p className="text-xs text-sa-muted uppercase tracking-widest font-bold mb-6">Super Admin</p>
            
            <div className="w-full space-y-3 pt-6 border-t border-sa-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sa-muted">Status</span>
                <span className="text-sa-accent font-bold flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-sa-muted">Joined</span>
                <span className="font-medium">March 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-sa-muted">Last Login</span>
                <span className="font-medium">2h ago</span>
              </div>
            </div>
          </div>

          <div className="bg-sa-card border border-sa-border rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-sa-muted uppercase tracking-widest">Active Sessions</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sa-bg border border-sa-border rounded-lg text-sa-accent">
                  <Globe size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">Chrome on MacOS</p>
                  <p className="text-[10px] text-sa-muted">Lagos, Nigeria • Current</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sa-bg border border-sa-border rounded-lg text-sa-muted">
                  <Smartphone size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">iPhone 15 Pro</p>
                  <p className="text-[10px] text-sa-muted">Lagos, Nigeria • 4h ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms & Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Details */}
          <div className="bg-sa-card border border-sa-border rounded-2xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User size={20} className="text-sa-accent" />
              Account Details
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={16} />
                    <input type="text" defaultValue="Salvation Ndu" className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent" />
                    <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 text-sa-muted" size={14} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={16} />
                    <input type="email" defaultValue="salvationndu@gmail.com" className="w-full bg-sa-bg border border-sa-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent" />
                  </div>
                </div>
              </div>
              <button className="bg-sa-bg border border-sa-border px-6 py-2 rounded-lg text-sm font-bold hover:bg-sa-border transition-colors">
                Update Profile
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-sa-card border border-sa-border rounded-2xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock size={20} className="text-amber-500" />
              Security & Password
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Current Password</label>
                  <input type="password" placeholder="••••••••••••" className="w-full bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">New Password</label>
                    <input type="password" placeholder="Min 12 characters" className="w-full bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Confirm New Password</label>
                    <input type="password" placeholder="••••••••••••" className="w-full bg-sa-bg border border-sa-border rounded-lg p-2 text-sm focus:outline-none focus:border-sa-accent" />
                  </div>
                </div>
              </div>
              <button className="bg-sa-bg border border-sa-border px-6 py-2 rounded-lg text-sm font-bold hover:bg-sa-border transition-colors">
                Change Password
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-sa-card border border-sa-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-sa-border flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <History size={18} className="text-sa-accent" />
                My Recent Activity
              </h3>
              <button className="text-xs font-bold text-sa-muted hover:text-white transition-colors">View All</button>
            </div>
            <div className="divide-y divide-sa-border">
              {recentActivity.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-sa-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-sa-bg border border-sa-border text-sa-muted">
                      <ArrowUpRight size={14} />
                    </div>
                    <p className="text-sm font-medium">{item.desc}</p>
                  </div>
                  <span className="text-xs text-sa-muted">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
