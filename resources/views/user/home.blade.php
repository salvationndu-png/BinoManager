<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Wholesale Manager Dashboard</title>

  <!-- Tailwind -->
  <!-- <script src="https://cdn.tailwindcss.com"></script> -->
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="{{ asset('build/assets/app.css') }}">
    <link rel="stylesheet" href="/css/nav.css">
    <link rel="stylesheet" href="/css/home.css">



</head>
<body class="bg-slate-50 text-slate-800 antialiased">

<!-- SIDEBAR -->
<aside id="sidebar"
       class="fixed inset-y-0 left-0 z-40 w-72 md:w-64 -translate-x-full md:translate-x-0
              glass-base text-slate-900 shadow-lg md:shadow-none
              transition-transform duration-300 ease-out flex flex-col"
       aria-label="Primary sidebar">

  <!-- brand + mobile close -->
  <div class="h-16 flex items-center justify-between px-6 glass-inner-line">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-md grid place-items-center text-white font-semibold"
           style="background: linear-gradient(135deg,#0f172a,#0b5e57);">
        LH
      </div>
      <div class="text-lg font-semibold tracking-wide">Wholesale Manager</div>
    </div>

    <!-- mobile close (kept id) -->
    <button id="closeSidebar" class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/40 focus-ring"
            aria-label="Close menu">
      <svg class="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.707 6.293a1 1 0 00-1.414 1.414L10.586 13l-5.293 5.293a1 1 0 001.414 1.414L12 14.414l5.293 5.293a1 1 0 001.414-1.414L13.414 13l5.293-5.293a1 1 0 00-1.414-1.414L12 11.586 6.707 6.293z"/>
      </svg>
    </button>
  </div>

  
  <!-- nav -->
  <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
    <!-- Dashboard (solid Home) -->
    <a href="{{ url('home') }}" aria-current="page"
       class="group nav-item flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-white/60 hover:backdrop-brightness-95 focus-ring nav-accent">
      <span class="w-9 h-9 flex items-center justify-center rounded-md icon-surface icon-chip nav-icon">
        <!-- Solid Home (kept filled) -->
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.707 2.293a1 1 0 0 1 1.414 0l8 8A1 1 0 0 1 20.293 12H19v7a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5H12v5a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-7H3.707a1 1 0 0 1-.707-1.707l8-8z" /></svg>
      </span>
      <div>
        <div class="font-medium nav-label">Dashboard</div>
        <div class="text-xs nav-sub">Overview & insights</div>
      </div>
    </a>

    @if(Auth::check() && Auth::user()->usertype == 1)
    <!-- Product (solid box) -->
    <a href="{{ url('product') }}"
       class="group nav-item flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-white/60 hover:backdrop-brightness-95 focus-ring">
      <span class="w-9 h-9 flex items-center justify-center rounded-md icon-surface icon-chip nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.25v7.5c0 .6-.33 1.16-.86 1.44L13 21.9a2 2 0 0 1-2 0l-7.14-4.71A1.5 1.5 0 0 1 3 15.75v-7.5c0-.6.33-1.16.86-1.44L11 2.1a2 2 0 0 1 2 0l7.14 4.71c.53.28.86.84.86 1.44zM12 3.98L5 8.13v7.12l7 4.61 7-4.61V8.13L12 3.98z"/><path d="M11 11.5h2v5h-2z"/></svg>
      </span>
      <div>
        <div class="font-medium nav-label">Add Product</div>
        <div class="text-xs nav-sub">Create product entries</div>
      </div>
    </a>

    <!-- Stock (solid archive) -->
    <a href="{{ url('stock') }}"
       class="group nav-item flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-white/60 hover:backdrop-brightness-95 focus-ring">
      <span class="w-9 h-9 flex items-center justify-center rounded-md icon-surface icon-chip nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5V9h-2V7.5c0-.28-.22-.5-.5-.5h-13c-.28 0-.5.22-.5.5V9H3V7.5z"/><path d="M21 11v5.5A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5V11h18zm-9 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
      </span>
      <div>
        <div class="font-medium nav-label">Record Stock</div>
        <div class="text-xs nav-sub">Inventory movements</div>
      </div>
    </a>
    @endif

    <!-- Sales (solid receipt) -->
    <a href="{{ url('sales') }}"
       class="group nav-item flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-white/60 hover:backdrop-brightness-95 focus-ring">
      <span class="w-9 h-9 flex items-center justify-center rounded-md icon-surface icon-chip nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a1 1 0 0 1 1 1v18l-3-1-3 1-3-1-3 1V3a1 1 0 0 1 1-1z"/><path d="M9 8h6v2H9zM9 12h6v2H9z" fill="#fff" /></svg>
      </span>
      <div>
        <div class="font-medium nav-label">Record Sale</div>
        <div class="text-xs nav-sub">Create transactions</div>
      </div>
    </a>

    <!-- Track (solid chart) -->
    <a href="{{ url('track') }}"
       class="group nav-item flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-white/60 hover:backdrop-brightness-95 focus-ring">
      <span class="w-9 h-9 flex items-center justify-center rounded-md icon-surface icon-chip nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3v18H3V3h18zm-3 8.5-3.5-3.5-4 4-2.5-2.5L6 15.5V18h12v-6.5z"/></svg>
      </span>
      <div>
        <div class="font-medium nav-label">View Sales</div>
        <div class="text-xs nav-sub">Reports & history</div>
      </div>
    </a>

    @if(Auth::check() && Auth::user()->usertype == 1)
    <!-- Manage Users -->
    <a href="{{ url('admin/users') }}"
       class="group nav-item flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-white/60 hover:backdrop-brightness-95 focus-ring">
      <span class="w-9 h-9 flex items-center justify-center rounded-md icon-surface icon-chip nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </span>
      <div>
        <div class="font-medium nav-label">Manage Users</div>
        <div class="text-xs nav-sub">User accounts</div>
      </div>
    </a>
    @endif
  </nav>

  <!-- bottom profile + logout -->
  <div class="px-4 py-4 border-t border-white/30 glass-inner-line">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 grid place-items-center text-white font-semibold">
        {{ strtoupper(substr(Auth::user()->name ?? 'U',0,1)) }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate nav-label">{{ Auth::user()->name ?? 'User' }}</div>
        <a href="{{ url('user/profile') }}" class="text-xs nav-sub hover:text-slate-700">Profile</a>
      </div>
      <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button class="ml-2 inline-flex items-center gap-2 py-2 px-3 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700 focus-ring" title="Logout">
          <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 17l5-5-5-5v3H8v4h8v3zM4 4h9v2H6v12h7v2H4z"/></svg>
          Logout
        </button>
      </form>
    </div>
  </div>
</aside>







  <!-- mobile overlay -->
  <div id="backdrop" class="fixed inset-0 bg-black/40 z-30 opacity-0 pointer-events-none transition-opacity"></div>

  <!-- MAIN (pad-left on md to avoid overlap) -->
  <div class="min-h-screen md:pl-64 flex flex-col">

    <!-- TOPBAR -->
    <header class="sticky top-0 z-20 border-b">
      <div class="h-16 flex items-center justify-between px-4 sm:px-6
                  bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <!-- mobile toggle -->
        <button id="openSidebar" class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                aria-label="Open menu" aria-expanded="false">
          <svg class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <h1 class="text-lg sm:text-xl font-semibold tracking-tight">Dashboard</h1>

        <!-- account dropdown -->
        <div class="relative">
          <button id="accountBtn" class="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 transition focus-ring" aria-expanded="false">
            <span class="sr-only">Open account menu</span>
            <span>👤 {{ Auth::user()->name ?? 'Account' }}</span>
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>
          </button>

          <div id="accountMenu" class="hidden absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg overflow-hidden animate-fade-in-up">
            <a href="{{ url('user/profile') }}" class="block px-4 py-2 hover:bg-slate-50">Profile</a>
            <div class="border-t"></div>
            <form method="POST" action="{{ route('logout') }}">
              @csrf
              <button type="submit" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600">Logout</button>
            </form>
          </div>
        </div> 
      </div>
    </header>

    <!-- PAGE CONTENT -->
    <main class="flex-1 p-4 sm:p-6 space-y-6">

      <!-- summary cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article class="bg-white rounded-2xl shadow p-5 ring-1 ring-slate-100 hover:shadow-md transition anim-fade-in-up">
          <div class="text-sm text-slate-500">Total Products</div>
          <div class="mt-1 text-3xl font-semibold text-indigo-600">{{ $totalProducts }}</div>
          <div class="text-xs text-slate-400 mt-1">Unique product categories</div>
        </article>

        <article style="background: linear-gradient(180deg, rgba(4, 88, 1, 0.69), rgba(4, 88, 1, 0.69)); " class="bg-white rounded-2xl shadow p-5 ring-1 ring-slate-100 hover:shadow-md transition anim-fade-in-up" style="animation-delay:.06s">
          <div class="text-sm text-gray-200">Total Stock (Bundles)</div>
          <div class="mt-1 text-3xl font-semibold text-white">{{ $totalStock }}</div>
          <div class="text-xs text-gray-200 mt-1">Bundles in stock</div>
        </article>

        <article class="bg-white rounded-2xl shadow p-5 ring-1 ring-slate-100 hover:shadow-md transition anim-fade-in-up" style="animation-delay:.12s">
          <div class="text-sm text-slate-500">Today's Sales</div>
          <div class="mt-1 text-3xl font-semibold text-amber-500">₦{{ number_format($todaysSales) }}</div>
          <div class="text-xs text-slate-400 mt-1">Gross sales today</div>
        </article>
      </section>

      <!-- charts -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl shadow p-5 ring-1 ring-slate-100 anim-fade-in-up">
          <h3 class="text-slate-600 font-medium mb-3">Top Selling Products</h3>
          <canvas id="topProductsChart" height="220"></canvas>
        </div>

        <div class="bg-white rounded-2xl shadow p-5 ring-1 ring-slate-100 anim-fade-in-up" style="animation-delay:.06s">
          <h3 class="text-slate-600 font-medium mb-3">Sales Trend</h3>
          <canvas id="salesTrendChart" height="220"></canvas>
        </div>
      </section>
    </main>

    <footer class="text-center text-slate-400 text-sm py-6">
      &copy; 2025 Wholesale Manager
    </footer>
  </div>

  <!-- SCRIPTS -->
  <script>
    // Chart data (from your controller)
    const topProducts = @json($topProducts);
    const salesTrend  = @json($salesTrend);



  </script>

  @vite(['resources/css/app.css', 'resources/js/app.js'])

</body>
<script src="/js/dashboard.js"></script>
</html>
