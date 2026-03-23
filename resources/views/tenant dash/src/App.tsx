import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Analytics from './components/Analytics';
import Billing from './components/Billing';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Team from './components/Team';
import Users from './components/Users';
import Reports from './components/Reports';
import Customers from './components/Customers';
import { Page } from './types';

// Placeholder components for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center dark:bg-zinc-800">
      <span className="text-4xl font-bold dark:text-zinc-600">?</span>
    </div>
    <div className="text-center">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <p className="mt-2 dark:text-zinc-400">This module is currently under development.</p>
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'customers':
        return <Customers />;
      case 'users':
        return <Users />;
      case 'team':
        return <Team />;
      case 'billing':
        return <Billing />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
