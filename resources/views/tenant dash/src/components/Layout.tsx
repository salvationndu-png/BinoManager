import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Database, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Users, 
  UserPlus, 
  CreditCard, 
  User,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { Page } from '../types';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  key?: string | number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full transition-colors rounded-lg",
      label ? "gap-3 px-4 py-3" : "justify-center p-3",
      active 
        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-primary-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-primary-400"
    )}
    title={!label ? active ? "Active" : "Menu Item" : undefined} // Simple tooltip for collapsed state
  >
    <Icon size={20} />
    {label && <span className="truncate">{label}</span>}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setPage: (page: Page) => void;
}

export default function Layout({ children, currentPage, setPage }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    if (isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'users', label: 'Users', icon: UserPlus },
    { id: 'team', label: 'Team', icon: Database },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 lg:relative lg:translate-x-0 dark:bg-zinc-900 dark:border-zinc-800",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary-600/20">B</div>
            {isSidebarOpen && <span className="text-xl font-bold tracking-tight text-primary-900 dark:text-primary-100">BinoManager</span>}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-zinc-400 hover:text-primary-600 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={isSidebarOpen ? item.label : ''}
              active={currentPage === item.id}
              onClick={() => {
                setPage(item.id as Page);
                // On mobile, close sidebar after selection
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-primary-600 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-primary-400">
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg relative dark:text-zinc-400 dark:hover:bg-zinc-800">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
            </button>
            <div className="h-8 w-px bg-zinc-200 mx-1 md:mx-2 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium dark:text-zinc-100">Alex Johnson</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Administrator</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-200 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img src="https://picsum.photos/seed/alex/100/100" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
