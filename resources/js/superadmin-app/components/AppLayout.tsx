import React, { useState, ReactNode } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Settings, History,
  UserCircle, Package, LogOut, Search, Bell, ChevronRight,
  Sun, Moon, Menu, X, MessageSquare, Mail
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SAPage } from '../types';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={cn(
    "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
    active ? "bg-sa-accent/10 text-sa-accent" : "text-sa-muted hover:bg-sa-card hover:text-sa-text"
  )}>
    <Icon size={20} className={cn("transition-colors", active ? "text-sa-accent" : "group-hover:text-sa-text")} />
    <span className="font-medium text-sm">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sa-accent shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
  </button>
);

interface LayoutProps {
  children: ReactNode;
  activePage: SAPage;
  setActivePage: (p: SAPage) => void;
  theme: 'light'|'dark';
  toggleTheme: () => void;
}

export const AppLayout = ({ children, activePage, setActivePage, theme, toggleTheme }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sa = window.SuperAdmin;
  const initials = sa?.admin?.name?.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2) ?? 'SA';

  const nav = (page: SAPage) => { setActivePage(page); setMobileOpen(false); };

  const handleLogout = async () => {
    const form = document.createElement('form');
    form.method = 'POST'; form.action = sa?.logoutUrl ?? '/superadmin/logout';
    const t = document.createElement('input'); t.type='hidden'; t.name='_token'; t.value=sa?.csrf ?? '';
    form.appendChild(t); document.body.appendChild(form); form.submit();
  };

  return (
    <div className="flex min-h-screen bg-sa-bg overflow-hidden relative">
      {mobileOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-sa-border flex flex-col shrink-0 bg-sa-bg z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sa-accent flex items-center justify-center">
                <span className="font-bold text-sa-bg text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">BinoManager</h1>
            </div>
            <button className="lg:hidden text-sa-muted hover:text-sa-text" onClick={() => setMobileOpen(false)}><X size={20}/></button>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-sa-muted uppercase tracking-wider mb-4 px-4">Main Menu</p>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activePage==='dashboard'} onClick={() => nav('dashboard')} />
            <SidebarItem icon={Users} label="Tenants" active={activePage==='tenants'||activePage==='tenant-detail'} onClick={() => nav('tenants')} />
            <SidebarItem icon={Package} label="Plans & Pricing" active={activePage==='plans'} onClick={() => nav('plans')} />
            <SidebarItem icon={CreditCard} label="Payment Gateway" active={activePage==='gateway'} onClick={() => nav('gateway')} />
            <SidebarItem icon={Mail} label="Email Settings" active={activePage==='email'} onClick={() => nav('email')} />
            <div className="pt-8 pb-4">
              <p className="text-[10px] font-bold text-sa-muted uppercase tracking-wider mb-4 px-4">System</p>
              <SidebarItem icon={History} label="Audit Log" active={activePage==='audit'} onClick={() => nav('audit')} />
              <SidebarItem icon={MessageSquare} label="Support Inbox" active={activePage==='feedback'} onClick={() => nav('feedback')} />
              <SidebarItem icon={Settings} label="Platform Settings" active={activePage==='settings'} onClick={() => nav('settings')} />
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-sa-border">
          <div className="px-4 py-3 mb-2 bg-sa-card/30 border border-sa-border/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Platform Status</span>
              <span className="flex h-2 w-2 rounded-full bg-sa-accent animate-pulse" />
            </div>
            <p className="text-[10px] text-sa-muted">All systems operational</p>
          </div>
          <SidebarItem icon={UserCircle} label="My Profile" active={activePage==='profile'} onClick={() => nav('profile')} />
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-2">
            <LogOut size={20}/><span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-sa-border flex items-center justify-between px-4 lg:px-8 shrink-0 bg-sa-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-sa-muted hover:text-white p-2 -ml-2" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
            <div className="hidden sm:flex items-center gap-2 text-sa-muted text-sm">
              <span>SuperAdmin</span><ChevronRight size={14}/>
              <span className="text-sa-text capitalize">{activePage.replace('-',' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <button onClick={toggleTheme} className="p-2 text-sa-muted hover:text-sa-accent rounded-lg hover:bg-sa-card transition-colors">
              {theme==='light' ? <Moon size={20}/> : <Sun size={20}/>}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-muted" size={18}/>
              <input type="text" placeholder="Search platform..." className="bg-sa-card border border-sa-border rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-sa-accent transition-colors w-48 lg:w-64"/>
            </div>
            <button className="relative text-sa-muted hover:text-sa-text transition-colors">
              <Bell size={20}/>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-sa-accent rounded-full border-2 border-sa-bg"/>
            </button>
            <div className="flex items-center gap-3 lg:pl-6 lg:border-l lg:border-sa-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{sa?.admin?.name ?? 'Super Admin'}</p>
                <p className="text-[10px] text-sa-muted uppercase tracking-tighter">Platform Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sa-accent to-emerald-400 flex items-center justify-center font-bold text-sa-bg text-xs">
                {initials}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
