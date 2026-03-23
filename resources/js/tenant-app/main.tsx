import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// No CSS import here — the Laravel Vite plugin injects resources/css/app.css
// separately via the @vite directive in tenant-app.blade.php

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
