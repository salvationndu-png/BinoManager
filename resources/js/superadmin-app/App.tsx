import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { TenantsList } from './components/TenantsList';
import { TenantDetail } from './components/TenantDetail';
import { PlansManagement } from './components/PlansManagement';
import { PaymentGateway } from './components/PaymentGateway';
import { AuditLog } from './components/AuditLog';
import { PlatformSettings } from './components/PlatformSettings';
import { AdminProfile } from './components/AdminProfile';
import { FeedbackInbox } from './components/FeedbackInbox';
import EmailSettings from './components/EmailSettings';
import { SAPage } from './types';

export default function App() {
  const [page, setPage] = useState<SAPage>('dashboard');
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light'|'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('sa-theme') as 'light'|'dark'|null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('sa-theme', theme);
  }, [theme]);

  // Handle bino:nav events from child components
  useEffect(() => {
    const handler = (e: Event) => setPage((e as CustomEvent<SAPage>).detail);
    document.addEventListener('bino:sa-nav', handler);
    return () => document.removeEventListener('bino:sa-nav', handler);
  }, []);

  const navigateTo = (p: SAPage) => {
    if (p !== 'tenant-detail') setSelectedTenantId(null);
    setPage(p);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <Dashboard setPage={navigateTo}/>;
      case 'tenants':       return <TenantsList setPage={navigateTo} setSelectedTenantId={(id) => { setSelectedTenantId(id); setPage('tenant-detail'); }}/>;
      case 'tenant-detail': return selectedTenantId ? <TenantDetail tenantId={selectedTenantId} setPage={navigateTo}/> : <TenantsList setPage={navigateTo} setSelectedTenantId={(id) => { setSelectedTenantId(id); setPage('tenant-detail'); }}/>;
      case 'plans':         return <PlansManagement/>;
      case 'gateway':       return <PaymentGateway/>;
      case 'email':         return <EmailSettings/>;
      case 'audit':         return <AuditLog/>;
      case 'feedback':      return <FeedbackInbox/>;
      case 'settings':      return <PlatformSettings/>;
      case 'profile':       return <AdminProfile/>;
      default:              return <Dashboard setPage={navigateTo}/>;
    }
  };

  return (
    <AppLayout activePage={page} setActivePage={navigateTo} theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
      {renderPage()}
    </AppLayout>
  );
}
