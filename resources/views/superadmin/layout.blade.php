<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'Super Admin') — Wholesale Manager Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <style>
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    :root { --sa-bg: #09090b; --sa-card: #111113; --sa-border: #27272a; --sa-accent: #10b981; }
    body { background: var(--sa-bg); color: #e4e4e7; }
    .sa-card { background: var(--sa-card); border: 1px solid var(--sa-border); border-radius: 12px; }
    .sa-sidebar { background: #0c0c0f; border-right: 1px solid var(--sa-border); }
    .sa-nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #a1a1aa; transition: all 0.15s; }
    .sa-nav-link:hover { background: #1c1c1f; color: #e4e4e7; }
    .sa-nav-link.active { background: #064e3b; color: #34d399; }
    .kpi { background: var(--sa-card); border: 1px solid var(--sa-border); border-radius: 12px; padding: 20px; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #f4f4f5; }
    .kpi-label { font-size: 12px; color: #71717a; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .badge-active { background: #064e3b; color: #34d399; }
    .badge-trial { background: #451a03; color: #fb923c; }
    .badge-grace { background: #450a0a; color: #f87171; }
    .badge-suspended { background: #27272a; color: #71717a; }
    .badge-cancelled { background: #27272a; color: #52525b; }
    .badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .btn-primary { background: #059669; color: white; font-weight: 600; padding: 8px 16px; border-radius: 8px; font-size: 13px; border: none; cursor: pointer; transition: background 0.15s; }
    .btn-primary:hover { background: #047857; }
    .btn-danger { background: #7f1d1d; color: #fca5a5; font-weight: 600; padding: 8px 16px; border-radius: 8px; font-size: 13px; border: none; cursor: pointer; transition: background 0.15s; }
    .btn-danger:hover { background: #991b1b; }
    .btn-ghost { background: #27272a; color: #d4d4d8; font-weight: 600; padding: 8px 16px; border-radius: 8px; font-size: 13px; border: none; cursor: pointer; transition: background 0.15s; }
    .btn-ghost:hover { background: #3f3f46; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--sa-border); }
    td { padding: 12px; font-size: 13px; color: #d4d4d8; border-bottom: 1px solid #1c1c1f; }
    tr:hover td { background: #111113; }
    input, select, textarea { background: #18181b; border: 1px solid #3f3f46; color: #e4e4e7; border-radius: 8px; padding: 8px 12px; font-size: 13px; width: 100%; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #059669; box-shadow: 0 0 0 2px rgba(5,150,105,0.2); }
  </style>
  @stack('styles')
</head>
<body class="h-full antialiased">

{{-- Impersonation banner --}}
@if(session('impersonating') || session(App\Http\Controllers\SuperAdmin\ImpersonateController::class . '::SESSION_KEY'))
<div class="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black text-sm font-bold py-2 px-4 flex items-center justify-between">
  <span>⚠️ IMPERSONATION MODE — You are viewing this workspace as a tenant admin</span>
  <form method="POST" action="{{ route('impersonate.stop') }}">
    @csrf
    <button type="submit" class="bg-black text-amber-400 text-xs font-bold px-3 py-1 rounded-lg">Stop Impersonating</button>
  </form>
</div>
<div class="h-9"></div>
@endif

<div class="flex h-screen">
  {{-- Sidebar --}}
  <div class="sa-sidebar w-56 flex-shrink-0 flex flex-col">
    <div class="h-16 flex items-center px-5 border-b border-zinc-800">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg grid place-items-center text-white font-black text-xs" style="background: linear-gradient(135deg, #047857, #059669)">SA</div>
        <div>
          <div class="text-white font-bold text-sm leading-none">Platform Admin</div>
          <div class="text-zinc-500 text-xs mt-0.5">404Softwares</div>
        </div>
      </div>
    </div>

    <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      <a href="{{ route('superadmin.dashboard') }}" class="sa-nav-link {{ request()->routeIs('superadmin.dashboard') ? 'active' : '' }}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        Dashboard
      </a>
      <a href="{{ route('superadmin.tenants.index') }}" class="sa-nav-link {{ request()->routeIs('superadmin.tenants.*') ? 'active' : '' }}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        Tenants
      </a>
      <a href="{{ route('superadmin.payments.index') }}" class="sa-nav-link {{ request()->routeIs('superadmin.payments.*') ? 'active' : '' }}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        Payment Gateways
      </a>
    </nav>

    <div class="p-3 border-t border-zinc-800">
      <div class="text-xs text-zinc-500 mb-2 px-2">{{ auth('super_admin')->user()->name }}</div>
      <form method="POST" action="{{ route('superadmin.logout') }}">
        @csrf
        <button class="sa-nav-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-950">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
      </form>
    </div>
  </div>

  {{-- Main --}}
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
    <header class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 flex-shrink-0" style="background: #0c0c0f;">
      <div>
        <div class="text-white font-bold text-base">@yield('page-title', 'Dashboard')</div>
        <div class="text-zinc-500 text-xs">@yield('page-subtitle', '')</div>
      </div>
      <div class="flex items-center gap-3 text-xs text-zinc-500">
        <span>{{ now()->format('D, M j Y') }}</span>
        <div class="w-px h-4 bg-zinc-700"></div>
        <span class="text-emerald-400">● Platform online</span>
      </div>
    </header>

    @if(session('success'))
    <div class="mx-6 mt-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
      <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
      {{ session('success') }}
    </div>
    @endif
    @if(session('error'))
    <div class="mx-6 mt-4 bg-red-950 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">{{ session('error') }}</div>
    @endif

    <main class="flex-1 overflow-y-auto p-6 space-y-6">
      @yield('content')
    </main>
  </div>
</div>

@stack('scripts')
</body>
</html>
