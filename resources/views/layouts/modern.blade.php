<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'BinoManager')</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <link rel="stylesheet" href="/css/design-system.css">
  @stack('styles')
  <style>
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    .dark body { background: #0a0f1e; color: #e2e8f0; }
    .dark .bg-gray-50 { background: #0a0f1e !important; }
    .dark .bg-white { background: #111827 !important; border-color: transparent; }
    .dark .text-gray-900 { color: #f1f5f9 !important; }
    .dark .text-gray-700 { color: #cbd5e1 !important; }
    .dark .text-gray-600 { color: #94a3b8 !important; }
    .dark .text-gray-500 { color: #64748b !important; }
    .dark .border-gray-200 { border-color: #1e293b !important; }
    .dark .border-gray-100 { border-color: #1e293b !important; }
    .dark .bg-gray-100 { background: #1e293b !important; }
    .dark .hover\:bg-gray-100:hover { background: #1e293b !important; }
    .dark .hover\:bg-gray-200:hover { background: #334155 !important; }
    .dark .card { background: #111827 !important; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
  </style>
</head>
<body class="bg-gray-50 antialiased transition-colors duration-300" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

@php
  /*
   * Build the tenant query-param string used on every internal link.
   *
   * Why use the BOUND tenant (app('current.tenant')) rather than the raw
   * request query param?
   *
   * Because on localhost, the tenant can be resolved from the SESSION even
   * when ?tenant= is absent from the current URL (e.g. direct navigation to
   * /team).  Using the bound tenant means every link in the sidebar always
   * carries the correct ?tenant= param — so the NEXT page request can also
   * resolve from the query param (which re-seeds the session), preventing
   * silent fallback chains that are harder to debug.
   *
   * In production (subdomain routing) $currentTenant is still set by the
   * middleware, but $tp will equal '' because the tenant is resolved from the
   * host header, not from a query param.
   */
  $isLocalDev  = config('app.env') === 'local' && config('tenancy.central_domain') === 'localhost';
  $activeTenant = isset($currentTenant) ? $currentTenant : (app()->bound('current.tenant') ? app('current.tenant') : null);
  $tp = ($isLocalDev && $activeTenant) ? '?tenant=' . $activeTenant->slug : '';

  $isAdmin = Auth::check() && Auth::user()->usertype == 1;
@endphp

{{-- ── Super admin impersonation banner ─────────────────────────────────── --}}
@if(\Illuminate\Support\Facades\Session::has('impersonating_as_super_admin_id'))
<div class="fixed top-0 left-0 right-0 z-[999] bg-amber-500 text-black text-xs font-bold py-2 px-4 flex items-center justify-between" style="height:36px;">
  <span>⚠️ IMPERSONATION MODE — You are viewing this workspace as the tenant admin</span>
  <form method="POST" action="{{ route('impersonate.stop') }}">
    @csrf
    <button type="submit" class="bg-black text-amber-300 text-xs font-bold px-3 py-1 rounded-lg ml-4">Exit Impersonation</button>
  </form>
</div>
<div style="height:36px;"></div>
@endif

<aside id="sidebar" class="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 -translate-x-full md:translate-x-0 transition-transform duration-300 shadow-xl flex flex-col">
  {{-- Logo / business name --}}
  <div class="h-16 flex items-center px-5 border-b border-gray-200 flex-shrink-0">
    <div class="flex items-center gap-3">
      @if($activeTenant?->settings?->logo_path)
        <img src="{{ Storage::url($activeTenant->settings->logo_path) }}" class="w-10 h-10 rounded-xl object-cover shadow-lg" alt="Logo">
      @else
        <div class="w-10 h-10 rounded-xl grid place-items-center text-white font-bold text-lg shadow-lg flex-shrink-0" style="background: var(--gradient-primary);">
          {{ $activeTenant ? strtoupper(substr($activeTenant->name, 0, 2)) : 'BM' }}
        </div>
      @endif
      <div class="font-bold text-base text-gray-900 leading-tight truncate">
        {{ $activeTenant ? ($activeTenant->settings?->business_name ?? $activeTenant->name) : 'BinoManager' }}
      </div>
    </div>
  </div>

  {{-- Navigation --}}
  <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-1">

    {{-- ── Main ───────────────────────────────────────────────────────── --}}
    <p class="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Main</p>

    <a href="{{ url('home') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('home') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('home')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>
      <span class="font-medium">Dashboard</span>
    </a>

    @if($isAdmin)
    <a href="{{ url('product') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('product') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('product')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
      </svg>
      <span class="font-medium">Products</span>
    </a>

    <a href="{{ url('stock') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('stock') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('stock')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
        <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/>
      </svg>
      <span class="font-medium">Stock</span>
    </a>

    <a href="{{ url('customers') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('customers') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('customers')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
      <span class="font-medium">Customers</span>
    </a>
    @endif

    <a href="{{ url('sales') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('sales') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('sales')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L13 7.586l-1.293-1.293z" clip-rule="evenodd"/>
      </svg>
      <span class="font-medium">Sales</span>
    </a>

    <a href="{{ url('track') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('track') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('track')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
      </svg>
      <span class="font-medium">Reports</span>
    </a>

    <a href="{{ url('analytics') . $tp }}"
       class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
              {{ request()->is('analytics') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
       @if(request()->is('analytics')) style="background: var(--gradient-primary);" @endif>
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
      </svg>
      <span class="font-medium">Analytics</span>
    </a>

    {{-- ── Admin section ────────────────────────────────────────────────── --}}
    @if($isAdmin)
    <div class="pt-4">
      <p class="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Admin</p>

      <a href="{{ url('admin/users') . $tp }}"
         class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
                {{ request()->is('admin/users') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
         @if(request()->is('admin/users')) style="background: var(--gradient-primary);" @endif>
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
        <span class="font-medium">Users</span>
      </a>

      <a href="{{ url('team') . $tp }}"
         class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
                {{ request()->is('team') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
         @if(request()->is('team')) style="background: var(--gradient-primary);" @endif>
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <span class="font-medium">Team</span>
      </a>

      <a href="{{ url('settings') . $tp }}"
         class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
                {{ request()->is('settings*') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
         @if(request()->is('settings*')) style="background: var(--gradient-primary);" @endif>
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="font-medium">Settings</span>
      </a>

      <a href="{{ url('billing') . $tp }}"
         class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all
                {{ request()->is('billing*') ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}"
         @if(request()->is('billing*')) style="background: var(--gradient-primary);" @endif>
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
        <span class="font-medium">Billing</span>
      </a>
    </div>
    @endif

  </nav>

  {{-- Sidebar user footer --}}
  <div class="p-4 border-t border-gray-200 flex-shrink-0">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-9 h-9 rounded-full grid place-items-center text-white font-semibold shadow-md flex-shrink-0" style="background: var(--gradient-primary);">
        {{ strtoupper(substr(Auth::user()->name ?? 'U', 0, 1)) }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-gray-900 truncate">{{ Auth::user()->name ?? 'User' }}</div>
        <div class="text-xs text-gray-400">{{ $isAdmin ? 'Admin' : 'Sales Staff' }}</div>
      </div>
    </div>
    {{-- Logout clears the _bino_tenant session key so the next person to
         visit this browser does not get auto-routed to the previous workspace --}}
    <form method="POST" action="{{ route('logout') }}">
      @csrf
      <button class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-medium transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Logout
      </button>
    </form>
  </div>
</aside>

<div id="backdrop" class="fixed inset-0 bg-black/50 z-30 opacity-0 pointer-events-none transition-opacity md:hidden"></div>

<div class="min-h-screen md:pl-64 flex flex-col">
  <header class="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-white/90 backdrop-blur-lg border-b border-gray-200 flex-shrink-0">
    <div class="flex items-center gap-4">
      <button id="openSidebar" class="md:hidden p-2 rounded-lg hover:bg-gray-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div>
        <h1 class="text-lg font-semibold text-gray-900">@yield('page-title')</h1>
        <p class="text-sm text-gray-500">@yield('page-subtitle')</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="toggleDarkMode()" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Toggle Dark Mode">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      </button>

      {{-- Notifications --}}
      <div class="relative">
        <button id="notifBtn" class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if(isset($notifications) && count($notifications) > 0)
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          @endif
        </button>
        <div id="notifMenu" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
          <div class="p-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900 text-sm">Notifications</h3>
          </div>
          <div class="max-h-80 overflow-y-auto divide-y divide-gray-50">
            @forelse(isset($notifications) ? $notifications : [] as $notif)
            <div class="p-4 hover:bg-gray-50 cursor-pointer">
              <div class="flex gap-3">
                <div class="w-2 h-2 mt-1.5 rounded-full flex-shrink-0
                  @if($notif['type'] === 'warning') bg-amber-400
                  @elseif($notif['type'] === 'success') bg-emerald-500
                  @else bg-blue-500 @endif"></div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ $notif['title'] }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ $notif['message'] }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ $notif['time'] }}</p>
                </div>
              </div>
            </div>
            @empty
            <div class="p-8 text-center text-gray-400">
              <svg class="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
              <p class="text-sm">All caught up!</p>
            </div>
            @endforelse
          </div>
        </div>
      </div>

      {{-- Profile dropdown --}}
      <div class="relative">
        <button id="profileBtn" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <div class="w-8 h-8 rounded-full grid place-items-center text-white font-semibold text-sm shadow" style="background: var(--gradient-primary);">
            {{ Auth::check() ? strtoupper(substr(Auth::user()->name ?? 'U', 0, 1)) : 'U' }}
          </div>
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div id="profileMenu" class="hidden absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
          <div class="p-4 border-b border-gray-100">
            <div class="text-sm font-semibold text-gray-900 truncate">{{ Auth::user()->name ?? '' }}</div>
            <div class="text-xs text-gray-400 truncate">{{ Auth::user()->email ?? '' }}</div>
            <span class="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full
              {{ $isAdmin ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500' }}">
              {{ $isAdmin ? 'Admin' : 'Sales Staff' }}
            </span>
          </div>
          <div class="p-2">
            <a href="{{ route('profile.show') }}"
               class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile Settings
            </a>
            @if($isAdmin)
            <a href="{{ url('billing') . $tp }}"
               class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Billing
            </a>
            @endif
          </div>
          <div class="p-2 border-t border-gray-100">
            <form method="POST" action="{{ route('logout') }}">
              @csrf
              <button type="submit" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </header>

  {{-- Trial warning banner --}}
  @if(isset($tenantTrialDaysLeft) && $tenantTrialDaysLeft !== null)
  <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-6 py-2.5 flex items-center justify-between flex-shrink-0">
    <span class="font-medium">
      ⏳ Free trial ends in <strong>{{ $tenantTrialDaysLeft }} day{{ $tenantTrialDaysLeft != 1 ? 's' : '' }}</strong> — upgrade to keep your data.
    </span>
    <a href="{{ url('billing') . $tp }}" class="ml-4 bg-white text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors whitespace-nowrap">
      Upgrade →
    </a>
  </div>
  @endif

  {{-- Grace period warning --}}
  @if(isset($tenantGraceWarning) && $tenantGraceWarning)
  <div class="bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm px-6 py-2.5 flex items-center justify-between flex-shrink-0">
    <span class="font-medium">⚠️ Payment failed — update your payment method before the grace period ends.</span>
    <a href="{{ url('billing') . $tp }}" class="ml-4 bg-white text-red-600 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap">
      Fix Now →
    </a>
  </div>
  @endif

  <main class="flex-1 p-6 space-y-6">
    @yield('content')
  </main>

  <footer class="text-center text-gray-400 text-xs py-4 border-t border-gray-100">
    &copy; {{ date('Y') }} BinoManager &mdash; 404Softwares
  </footer>
</div>

<div id="toastContainer" class="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none"></div>

<script>
  // Sidebar mobile toggle
  const sidebar   = document.getElementById('sidebar');
  const backdrop  = document.getElementById('backdrop');
  document.getElementById('openSidebar')?.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
  });
  backdrop?.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  });

  // Dark mode
  function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark') ? '1' : '0');
  }
  if (localStorage.getItem('darkMode') === '1') {
    document.documentElement.classList.add('dark');
  }

  // Notification dropdown
  const notifBtn  = document.getElementById('notifBtn');
  const notifMenu = document.getElementById('notifMenu');
  notifBtn?.addEventListener('click', e => {
    e.stopPropagation();
    notifMenu.classList.toggle('hidden');
    profileMenu?.classList.add('hidden');
  });

  // Profile dropdown
  const profileBtn  = document.getElementById('profileBtn');
  const profileMenu = document.getElementById('profileMenu');
  profileBtn?.addEventListener('click', e => {
    e.stopPropagation();
    profileMenu.classList.toggle('hidden');
    notifMenu?.classList.add('hidden');
  });

  document.addEventListener('click', () => {
    notifMenu?.classList.add('hidden');
    profileMenu?.classList.add('hidden');
  });
</script>
<script src="/js/dashboard-enhanced.js"></script>
@stack('scripts')
</body>
</html>
