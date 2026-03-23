import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, BarChart3,
  Users, CreditCard, User, Settings, Menu, X, Bell, LogOut,
  Sun, Moon, ChevronDown, UsersRound, Landmark, MessageSquare
} from 'lucide-react';
import { Page } from '../types';
import { cn } from '../lib/utils';
import TrialCountdown from './TrialCountdown';

interface SidebarItemProps {
  icon: React.ElementType; label: string; active: boolean;
  onClick: () => void; badge?: number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) => (
  <button onClick={onClick} className={cn(
    "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
    active
      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
  )}>
    <Icon size={18} className="flex-shrink-0" />
    <span className="truncate flex-1 text-left">{label}</span>
    {badge != null && badge > 0 && (
      <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
        {badge}
      </span>
    )}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setPage: (p: Page) => void;
  planFeatures: string[];
}

export default function Layout({ children, currentPage, setPage, planFeatures }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  const bm = window.BinoManager;
  const user = bm?.user;
  const tenant = bm?.tenant;
  const isAdmin = user?.isAdmin ?? false;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const nav = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, adminOnly: false, feature: null },
    { id: 'inventory',  label: 'Inventory',  icon: Package,         adminOnly: true,  feature: null },
    { id: 'sales',      label: 'Sales',      icon: ShoppingCart,    adminOnly: false, feature: null },
    { id: 'reports',    label: 'Reports',    icon: FileText,        adminOnly: false, feature: null },
    { id: 'analytics',  label: 'Analytics',  icon: BarChart3,       adminOnly: true,  feature: 'analytics' },
    { id: 'customers',  label: 'Customers',  icon: Users,           adminOnly: true,  feature: 'customers' },
    { id: 'financials', label: 'Financials', icon: Landmark,        adminOnly: true,  feature: 'financials' },
    { id: 'team',       label: 'Team',       icon: UsersRound,      adminOnly: true,  feature: 'team' },
    { id: 'billing',    label: 'Billing',    icon: CreditCard,      adminOnly: true,  feature: null },
    { id: 'support',    label: 'Support',    icon: MessageSquare,   adminOnly: false, feature: null },
    { id: 'settings',   label: 'Settings',   icon: Settings,        adminOnly: true,  feature: null },
    { id: 'profile',    label: 'Profile',    icon: User,            adminOnly: false, feature: null },
  ].filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.feature && !planFeatures.includes(item.feature)) return false;
    return true;
  });

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'BM';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0 w-60" : "-translate-x-full lg:translate-x-0 lg:w-[72px]"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {tenant?.logoUrl
              ? <img src={tenant.logoUrl} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" alt="Logo" />
              : <div className="w-8 h-8 bg-primary-600 rounded-xl grid place-items-center text-white font-bold text-sm shadow-lg shadow-primary-600/20 flex-shrink-0">
                  {tenant?.name ? tenant.name.slice(0,2).toUpperCase() : 'BM'}
                </div>
            }
            {sidebarOpen && (
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {tenant?.name ?? 'BinoManager'}
              </span>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => (
            <SidebarItem key={item.id} icon={item.icon} label={sidebarOpen ? item.label : ''}
              active={currentPage === item.id}
              onClick={() => { setPage(item.id as Page); if (window.innerWidth < 1024) setSidebarOpen(false); }}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <form method="POST" action={bm?.logoutUrl ?? '/logout'}>
            <input type="hidden" name="_token" value={bm?.csrf ?? ''} />
            <button type="submit" className={cn(
              "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              "text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            )}>
              <LogOut size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(s => !s)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
              <Menu size={20} />
            </button>
            {/* Trial countdown */}
            {tenant?.status === 'trialing' && tenant?.trialEndsAt && (
              <TrialCountdown 
                trialEndsAt={tenant.trialEndsAt} 
                onUpgradeClick={() => setPage('billing')} 
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsDark(d => !d)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="h-7 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* Profile dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-600 grid place-items-center text-white text-xs font-bold shadow">
                  {initials}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{user?.name ?? 'User'}</p>
                  <p className="text-[10px] text-zinc-400">{isAdmin ? 'Admin' : 'Sales Staff'}</p>
                </div>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user?.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setPage('profile'); setProfileOpen(false); }}
                        className="flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <User size={16} /> Profile Settings
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setPage('billing'); setProfileOpen(false); }}
                          className="flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          <CreditCard size={16} /> Billing
                        </button>
                      )}
                    </div>
                    <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                      <form method="POST" action={bm?.logoutUrl ?? '/logout'}>
                        <input type="hidden" name="_token" value={bm?.csrf ?? ''} />
                        <button type="submit" className="flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
