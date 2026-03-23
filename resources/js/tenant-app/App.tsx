import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Analytics from './components/Analytics';
import Financials from './components/Financials';
import Reports from './components/Reports';
import Customers from './components/Customers';
import Team from './components/Team';
import Billing from './components/Billing';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Support from './components/Support';
import FeedbackButton from './components/FeedbackButton';
// import EmailVerificationBanner from './components/EmailVerificationBanner';
import { Page } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const bm = window.BinoManager;
  const isAdmin = bm?.user?.isAdmin ?? false;
  const planFeatures: string[] = bm?.planFeatures ?? ['sales', 'reports'];

  // Pages that require admin role
  const adminOnlyPages: Page[] = ['inventory', 'analytics', 'customers', 'financials', 'team', 'billing', 'settings'];

  // Pages that additionally require a specific plan feature
  const featureGatedPages: Partial<Record<Page, string>> = {
    analytics:  'analytics',
    customers:  'customers',
    financials: 'financials',
    team:       'team',
  };

  const canAccessPage = (p: Page): boolean => {
    if (!isAdmin && adminOnlyPages.includes(p)) return false;
    const requiredFeature = featureGatedPages[p];
    if (requiredFeature && !planFeatures.includes(requiredFeature)) return false;
    return true;
  };

  useEffect(() => {
    if (!canAccessPage(page)) setPage('dashboard');
  }, [page, isAdmin]);

  useEffect(() => {
    const handler = (e: Event) => {
      const target = (e as CustomEvent<Page>).detail;
      if (target && canAccessPage(target)) setPage(target);
    };
    document.addEventListener('bino:nav', handler);
    return () => document.removeEventListener('bino:nav', handler);
  }, [isAdmin, planFeatures.join(',')]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <Dashboard />;
      case 'inventory':  return <Inventory />;
      case 'sales':      return <Sales />;
      case 'analytics':  return <Analytics />;
      case 'reports':    return <Reports />;
      case 'financials': return <Financials />;
      case 'customers':  return <Customers />;
      case 'team':       return <Team />;
      case 'billing':    return <Billing />;
      case 'settings':   return <Settings />;
      case 'profile':    return <Profile />;
      case 'support':    return <Support />;
      default:           return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={page} setPage={setPage} planFeatures={planFeatures}>
        {renderPage()}
      </Layout>
      <FeedbackButton />
    </>
  );
}
