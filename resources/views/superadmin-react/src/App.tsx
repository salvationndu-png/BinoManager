/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { TenantsList } from './components/TenantsList';
import { TenantDetail } from './components/TenantDetail';
import { PlansManagement } from './components/PlansManagement';
import { PaymentGateway } from './components/PaymentGateway';
import { AuditLog } from './components/AuditLog';
import { PlatformSettings } from './components/PlatformSettings';
import { AdminProfile } from './components/AdminProfile';
import { Login } from './components/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    if (activePage === 'tenants' && selectedTenantId) {
      return <TenantDetail onBack={() => setSelectedTenantId(null)} />;
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'tenants':
        return <div onClick={(e) => {
          // Simple hack to simulate clicking a tenant row for the demo
          const target = e.target as HTMLElement;
          if (target.closest('tr')) {
            setSelectedTenantId(1);
          }
        }}>
          <TenantsList />
        </div>;
      case 'plans':
        return <PlansManagement />;
      case 'gateway':
        return <PaymentGateway />;
      case 'audit':
        return <AuditLog />;
      case 'settings':
        return <PlatformSettings />;
      case 'profile':
        return <AdminProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout 
      activePage={activePage} 
      setActivePage={setActivePage}
      onLogout={() => setIsAuthenticated(false)}
      theme={theme}
      toggleTheme={toggleTheme}
    >
      {renderPage()}
    </AppLayout>
  );
}
