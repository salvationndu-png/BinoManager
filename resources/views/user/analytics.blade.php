@extends('layouts.modern')

@section('title', 'Analytics - Wholesale Manager')
@section('page-title', 'Business Analytics')
@section('page-subtitle', 'Profit/Loss, Inventory Valuation & Performance Metrics')

@section('content')
<div class="card p-6 mb-6">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 rounded-xl grid place-items-center text-white" style="background: var(--gradient-primary);">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Filter Analytics</h2>
      <p class="text-sm text-gray-500">Select date range for analysis</p>
    </div>
  </div>

  <form id="analyticsForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
      <input name="start_date" type="date" value="{{ now()->startOfMonth()->toDateString() }}" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
      <input name="end_date" type="date" value="{{ now()->toDateString() }}" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
    </div>
    <div class="flex items-end">
      <button type="submit" id="generateBtn" class="w-full px-4 py-3 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg" style="background: var(--gradient-primary);">
        Generate Report
      </button>
    </div>
  </form>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  <div class="card p-6">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-green-100 grid place-items-center">
        <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/></svg>
      </div>
      <div>
        <div class="text-sm text-gray-500">Total Profit</div>
        <div id="totalProfit" class="text-2xl font-bold text-green-600">₦0.00</div>
      </div>
    </div>
  </div>

  <div class="card p-6">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-blue-100 grid place-items-center">
        <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
      </div>
      <div>
        <div class="text-sm text-gray-500">Inventory Value</div>
        <div id="inventoryValue" class="text-2xl font-bold text-blue-600">₦0.00</div>
      </div>
    </div>
  </div>

  <div class="card p-6">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg bg-purple-100 grid place-items-center">
        <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
      </div>
      <div>
        <div class="text-sm text-gray-500">Avg Profit Margin</div>
        <div id="avgMargin" class="text-2xl font-bold text-purple-600">0%</div>
      </div>
    </div>
  </div>
</div>

<div class="card p-6 mb-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
  <div class="overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="px-3 py-3 text-left font-semibold text-gray-700">Product</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Qty Sold</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Revenue</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Cost</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Profit</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Margin</th>
        </tr>
      </thead>
      <tbody id="productTable" class="divide-y divide-gray-100">
        <tr>
          <td colspan="6" class="px-3 py-8 text-center text-gray-400">Generate report to view data</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<div class="card p-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Inventory Valuation</h3>
  <div class="overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="px-3 py-3 text-left font-semibold text-gray-700">Product</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Stock Qty</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Cost Price</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Selling Price</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Total Value</th>
          <th class="px-3 py-3 text-right font-semibold text-gray-700">Potential Profit</th>
        </tr>
      </thead>
      <tbody id="inventoryTable" class="divide-y divide-gray-100">
        <tr>
          <td colspan="6" class="px-3 py-8 text-center text-gray-400">Loading...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
@endsection

@push('scripts')
<script>
// Local toast helper (uses the shared #toastContainer in the layout)
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const colours = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto px-5 py-3 rounded-xl text-white text-sm font-medium shadow-xl animate-slide-up';
  toast.style.cssText = `background:${colours[type] ?? colours.success}; min-width:220px;`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 350); }, 3000);
}

document.addEventListener('DOMContentLoaded', loadInventoryValuation);

document.getElementById('analyticsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const startDate = this.start_date.value;
  const endDate = this.end_date.value;
  const btn = document.getElementById('generateBtn');
  
  if (new Date(startDate) > new Date(endDate)) {
    showToast('Start date cannot be after end date', 'error');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Loading...';
  document.getElementById('productTable').innerHTML = '<tr><td colspan="6" class="px-3 py-8 text-center text-gray-400">Loading...</td></tr>';
  
  fetch(`/analytics/profit-loss?start_date=${startDate}&end_date=${endDate}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('totalProfit').textContent = '₦' + Number(data.totalProfit).toLocaleString('en-NG', {minimumFractionDigits: 2});
        document.getElementById('avgMargin').textContent = data.avgMargin.toFixed(1) + '%';
        
        const tbody = document.getElementById('productTable');
        if (data.products.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="px-3 py-8 text-center text-gray-400">No sales in this period</td></tr>';
        } else {
          tbody.innerHTML = data.products.map(p => `
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-3 text-gray-900">${p.name}</td>
              <td class="px-3 py-3 text-right text-gray-700">${p.quantity}</td>
              <td class="px-3 py-3 text-right text-gray-700">₦${Number(p.revenue).toLocaleString()}</td>
              <td class="px-3 py-3 text-right text-gray-700">₦${Number(p.cost).toLocaleString()}</td>
              <td class="px-3 py-3 text-right font-medium ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}">₦${Number(p.profit).toLocaleString()}</td>
              <td class="px-3 py-3 text-right font-medium ${p.margin >= 0 ? 'text-green-600' : 'text-red-600'}">${p.margin.toFixed(1)}%</td>
            </tr>
          `).join('');
        }
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('productTable').innerHTML = '<tr><td colspan="6" class="px-3 py-8 text-center text-red-500">Error loading data</td></tr>';
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = 'Generate Report';
    });
});

function loadInventoryValuation() {
  fetch('/analytics/inventory-valuation')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('inventoryValue').textContent = '₦' + Number(data.totalValue).toLocaleString('en-NG', {minimumFractionDigits: 2});
        
        const tbody = document.getElementById('inventoryTable');
        if (data.inventory.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="px-3 py-8 text-center text-gray-400">No inventory</td></tr>';
        } else {
          tbody.innerHTML = data.inventory.map(item => `
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-3 text-gray-900">${item.name}</td>
              <td class="px-3 py-3 text-right text-gray-700">${item.quantity}</td>
              <td class="px-3 py-3 text-right text-gray-700">₦${Number(item.cost_price).toLocaleString()}</td>
              <td class="px-3 py-3 text-right text-gray-700">₦${Number(item.selling_price).toLocaleString()}</td>
              <td class="px-3 py-3 text-right font-medium text-blue-600">₦${Number(item.total_value).toLocaleString()}</td>
              <td class="px-3 py-3 text-right font-medium text-green-600">₦${Number(item.potential_profit).toLocaleString()}</td>
            </tr>
          `).join('');
        }
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('inventoryTable').innerHTML = '<tr><td colspan="6" class="px-3 py-8 text-center text-red-500">Error loading data</td></tr>';
    });
}
</script>
@endpush
