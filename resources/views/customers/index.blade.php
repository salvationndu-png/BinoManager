@extends('layouts.modern')

@section('title', 'Customers - Wholesale Manager')
@section('page-title', 'Customer Management')
@section('page-subtitle', 'Manage your wholesale customers')

@section('content')
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  <div class="stat-card info animate-slide-up">
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="text-sm font-medium opacity-90 mb-1">Total Customers</div>
        <div id="totalCustomers" class="text-3xl font-bold">0</div>
      </div>
      <div class="p-3 bg-white/20 rounded-lg">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
      </div>
    </div>
    <div class="text-sm opacity-75">Registered accounts</div>
  </div>

  <div class="stat-card success animate-slide-up stagger-1">
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="text-sm font-medium opacity-90 mb-1">Total Credit Limit</div>
        <div id="totalCredit" class="text-3xl font-bold">₦0</div>
      </div>
      <div class="p-3 bg-white/20 rounded-lg">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg>
      </div>
    </div>
    <div class="text-sm opacity-75">Combined credit allowance</div>
  </div>

  <div class="stat-card warning animate-slide-up stagger-2">
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="text-sm font-medium opacity-90 mb-1">Outstanding Balance</div>
        <div id="totalOutstanding" class="text-3xl font-bold">₦0</div>
      </div>
      <div class="p-3 bg-white/20 rounded-lg">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      </div>
    </div>
    <div class="text-sm opacity-75">Total unpaid credit</div>
  </div>
</div>

<div class="card p-6">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-semibold text-gray-900">Customers</h3>
    <button onclick="openCreateModal()" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg" style="background: var(--gradient-primary);">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      Add Customer
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Business</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
          <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Credit Limit</th>
          <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Outstanding</th>
          <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Sales</th>
          <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody id="customersTable" class="divide-y divide-gray-100">
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-gray-400">Loading customers...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- Create/Edit Modal -->
<div id="customerModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div class="p-6 border-b border-gray-200">
      <h3 id="modalTitle" class="text-xl font-semibold text-gray-900">Add Customer</h3>
    </div>
    
    <form id="customerForm" class="p-6 space-y-4">
      <input type="hidden" id="customerId">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input type="text" id="customerName" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input type="tel" id="customerPhone" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" id="customerEmail" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input type="text" id="customerBusiness" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea id="customerAddress" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Credit Limit (₦)</label>
        <input type="number" id="customerCredit" min="0" step="0.01" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" class="flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all" style="background: var(--gradient-primary);">
          Save Customer
        </button>
        <button type="button" onclick="closeModal()" class="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all">
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Payment Modal -->
<div id="paymentModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-xl font-semibold text-gray-900">Record Payment</h3>
    </div>
    
    <form id="paymentForm" class="p-6 space-y-4">
      <input type="hidden" id="paymentCustomerId">
      
      <div class="p-3 bg-blue-50 rounded-xl">
        <div class="text-xs text-gray-600">Customer</div>
        <div id="paymentCustomerName" class="text-base font-semibold text-gray-900"></div>
        <div class="text-xs text-gray-600 mt-1">Outstanding Balance</div>
        <div id="paymentOutstanding" class="text-lg font-bold text-red-600"></div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Amount (₦) *</label>
        <input type="number" id="paymentAmount" required min="0.01" step="0.01" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
        <select id="paymentMethod" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="Cash">Cash</option>
          <option value="Transfer">Transfer</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
        <input type="date" id="paymentDate" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea id="paymentNotes" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Optional notes..."></textarea>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" class="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all">
          Record Payment
        </button>
        <button type="button" onclick="closePaymentModal()" class="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all">
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
@endsection

@push('scripts')
<script src="/js/customers.js"></script>
@endpush
