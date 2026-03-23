@extends('layouts.modern')

@section('title', 'Dashboard - Wholesale Manager')
@section('page-title')
  Welcome back, {{ Auth::user()->name }}! 👋
@endsection
@section('page-subtitle', "Here's what's happening today")

@push('styles')
<style>
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
  .skeleton { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 1000px 100%; animation: shimmer 2s infinite; }
  .dark .skeleton { background: linear-gradient(90deg, #0a0f1e 25%, #111827 50%, #0a0f1e 75%); }
</style>
@endpush

@section('content')
    
    <!-- STAT CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="stat-card success animate-slide-up transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-sm font-medium opacity-90 mb-1">Today's Sales</div>
            <div class="text-3xl font-bold">₦<span data-count="{{ $todaysSales }}">0</span></div>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm opacity-90">
          @if($salesChange >= 0)
          <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/></svg>
          <span>{{ number_format(abs($salesChange), 1) }}% from yesterday</span>
          @else
          <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"/></svg>
          <span>{{ number_format(abs($salesChange), 1) }}% from yesterday</span>
          @endif
        </div>
      </div>

      <div class="stat-card info animate-slide-up stagger-1 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-sm font-medium opacity-90 mb-1">Total Products</div>
            <div class="text-3xl font-bold"><span data-count="{{ $totalProducts }}">0</span></div>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm opacity-90">
          @if($productsChange >= 0)
          <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/></svg>
          <span>{{ number_format(abs($productsChange), 1) }}% from last month</span>
          @else
          <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"/></svg>
          <span>{{ number_format(abs($productsChange), 1) }}% from last month</span>
          @endif
        </div>
      </div>

      <div class="stat-card purple animate-slide-up stagger-2 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-sm font-medium opacity-90 mb-1">Total Stock</div>
            <div class="text-3xl font-bold"><span data-count="{{ $totalStock }}">0</span></div>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm opacity-90">
          <span>Bundles in stock</span>
        </div>
      </div>

      <div class="stat-card warning animate-slide-up stagger-3 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-sm font-medium opacity-90 mb-1">Low Stock Alert</div>
            <div class="text-3xl font-bold"><span data-count="{{ $lowStockCount }}">0</span></div>
          </div>
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </div>
        </div>
        <div class="flex items-center gap-1 text-sm opacity-90">
          <span>Products need restocking</span>
        </div>
      </div>
    </div>

    <!-- CHARTS ROW -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Sales Trend</h3>
          <button onclick="exportReport('sales')" class="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">Export</button>
        </div>
        <div id="chartLoader1" class="skeleton h-72 rounded-lg"></div>
        <div id="chartEmpty1" style="display:none;" class="h-72 flex flex-col items-center justify-center text-gray-400 rounded-lg border-2 border-dashed border-gray-200">
          <svg class="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <p class="text-sm font-medium">No sales data yet</p>
          <p class="text-xs mt-1">Record your first sale to see the trend</p>
        </div>
        <div id="chartContainer1" style="height: 300px; display: none;"><canvas id="salesTrendChart"></canvas></div>
      </div>

      <div class="card p-6 animate-fade-in">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          <button onclick="exportReport('products')" class="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">Export</button>
        </div>
        <div id="chartLoader2" class="skeleton h-72 rounded-lg"></div>
        <div id="chartEmpty2" style="display:none;" class="h-72 flex flex-col items-center justify-center text-gray-400 rounded-lg border-2 border-dashed border-gray-200">
          <svg class="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          <p class="text-sm font-medium">No products sold yet</p>
          <p class="text-xs mt-1">Sales data will appear here once recorded</p>
        </div>
        <div id="chartContainer2" style="height: 300px; display: none;"><canvas id="topProductsChart"></canvas></div>
      </div>
    </div>

    <!-- QUICK ACTIONS & ACTIVITY -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
        <div class="grid grid-cols-2 gap-3">
          <a href="{{ url('sales') }}" class="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 transition-all">
            <svg class="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <span class="text-sm font-medium text-green-900">New Sale</span>
          </a>
          
          @if(Auth::check() && Auth::user()->usertype == 1)
          <a href="{{ url('stock') }}" class="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all">
            <svg class="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span class="text-sm font-medium text-blue-900">Add Stock</span>
          </a>
          
          <a href="{{ url('product') }}" class="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all">
            <svg class="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span class="text-sm font-medium text-purple-900">New Product</span>
          </a>
          
          <a href="{{ url('admin/users') }}" class="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 transition-all">
            <svg class="w-8 h-8 text-amber-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            <span class="text-sm font-medium text-amber-900">Add User</span>
          </a>
          @endif
        </div>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🕐 Recent Activity</h3>
        <div class="space-y-3">
          @forelse($notifications as $notif)
          <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <div class="w-2 h-2 mt-2 rounded-full flex-shrink-0
              @if($notif['type'] == 'warning') bg-red-500
              @elseif($notif['type'] == 'success') bg-green-500
              @else bg-blue-500 @endif"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 font-medium">{{ $notif['title'] }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ $notif['message'] }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ $notif['time'] }}</p>
            </div>
          </div>
          @empty
          <div class="text-center py-6 text-gray-400">
            <svg class="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <p class="text-sm">No recent activity</p>
          </div>
          @endforelse
        </div>
      </div>
    </div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  const topProducts = @json($topProducts);
  const salesTrend  = @json($salesTrend);

  // Top Products chart
  const hasTopProducts = topProducts.data && topProducts.data.some(v => v > 0);
  if (!hasTopProducts) {
    document.getElementById('chartLoader2').style.display = 'none';
    document.getElementById('chartEmpty2').style.display = 'flex';
  } else {
    new Chart(document.getElementById('topProductsChart'), {
      type: 'doughnut',
      data: {
        labels: topProducts.labels,
        datasets: [{ data: topProducts.data, backgroundColor: ['#0b5e57','#16a34a','#f59e0b','#ef4444','#8b5cf6'] }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        animation: { onComplete: function() {
          document.getElementById('chartLoader2').style.display = 'none';
          document.getElementById('chartContainer2').style.display = 'block';
        }}
      }
    });
  }

  // Sales Trend chart
  const hasTrendData = salesTrend.data && salesTrend.data.some(v => v > 0);
  if (!hasTrendData) {
    document.getElementById('chartLoader1').style.display = 'none';
    document.getElementById('chartEmpty1').style.display = 'flex';
  } else {
    new Chart(document.getElementById('salesTrendChart'), {
      type: 'bar',
      data: {
        labels: salesTrend.labels,
        datasets: [{ label: '₦ Sales', data: salesTrend.data, backgroundColor: '#0b5e57', borderRadius: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
      plugins: { legend: { display: false } },
      animation: { onComplete: function() {
        document.getElementById('chartLoader1').style.display = 'none';
        document.getElementById('chartContainer1').style.display = 'block';
      }}
    }
  });
  } // end else hasTrendData
</script>
@endpush
