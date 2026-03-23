import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './superadmin.css';

// Normalize URL: both /superadmin and /superadmin/app serve the same SPA.
// Canonicalise to /superadmin so bookmarks and refreshes are consistent.
if (window.location.pathname === '/superadmin/app') {
  window.history.replaceState({}, '', '/superadmin');
}

const root = document.getElementById('superadmin-root');
if (root) {
  createRoot(root).render(<App />);
}
