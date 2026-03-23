@extends('layouts.modern')

@section('title', 'Stock - Wholesale Manager')
@section('page-title', 'Stock Management')
@section('page-subtitle', 'Manage inventory and stock levels')

@section('content')
<div class="card p-6 max-w-4xl">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 rounded-xl grid place-items-center text-white" style="background: var(--gradient-primary);">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Add Stock</h2>
      <p class="text-sm text-gray-500">Record new inventory</p>
    </div>
  </div>

  <form id="stockForm" class="space-y-4">
    @csrf
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Product</label>
        <select name="product_id" id="productSelect" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          <option value="">Select Product</option>
          @foreach($products as $product)
            <option value="{{ $product->id }}">{{ $product->name }}</option>
          @endforeach
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <input type="number" name="quantity" id="quantityInput" placeholder="10" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
        <input type="number" inputmode="decimal" step="0.01" min="0.01" name="price" id="priceInput" placeholder="5000" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
        <input type="number" inputmode="decimal" step="0.01" min="0.01" name="cost_price" id="costPriceInput" placeholder="4000" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input type="date" name="date" id="dateInput" value="{{ now()->toDateString() }}" required class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
      </div>

      <div class="flex items-end">
        <button type="submit" id="submitBtn" class="w-full px-4 py-3 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg" style="background: var(--gradient-primary);">
          Add Stock
        </button>
      </div>
    </div>
  </form>
</div>

<div class="card p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-900">Current Stock</h3>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b border-gray-200">
          <th class="px-3 py-3 font-medium">#</th>
          <th class="px-3 py-3 font-medium">Product Name</th>
          <th class="px-3 py-3 font-medium text-right">Qty</th>
          <th class="px-3 py-3 font-medium text-right">Cost Price</th>
          <th class="px-3 py-3 font-medium text-right">Selling Price</th>
          <th class="px-3 py-3 font-medium text-center">Actions</th>
        </tr>
      </thead>
      <tbody id="stockTable" class="divide-y divide-gray-100"></tbody>
    </table>
  </div>
</div>

<div id="incrementModal" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true">
  <div class="absolute inset-0 bg-black/50" data-modal-close></div>
  <div class="relative mx-auto mt-20 w-[92%] max-w-md rounded-xl bg-white shadow-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h5 class="text-lg font-semibold text-gray-900">Increase Stock Quantity</h5>
      <button class="p-2 rounded-lg hover:bg-gray-100" data-modal-close>
        <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="space-y-3">
      <p class="text-gray-700"><strong>Product:</strong> <span id="modalProductName"></span></p>
      <p class="text-gray-700"><strong>Current Quantity:</strong> <span id="modalCurrentQuantity"></span></p>
      <div>
        <label for="additionalQuantity" class="block text-sm font-medium text-gray-700 mb-2">Additional Quantity</label>
        <input type="number" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" id="additionalQuantity" min="1">
      </div>
    </div>
    <div class="mt-5 flex justify-end gap-2">
      <button class="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-medium transition-all" data-modal-close>Cancel</button>
      <button type="button" id="saveIncrementBtn" class="px-4 py-2 rounded-xl text-white font-medium transition-all shadow-md" style="background: var(--gradient-primary);">Save</button>
    </div>
  </div>
</div>

<div id="priceModal" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true">
  <div class="absolute inset-0 bg-black/50" data-modal-close></div>
  <div class="relative mx-auto mt-20 w-[92%] max-w-md rounded-xl bg-white shadow-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h5 class="text-lg font-semibold text-gray-900">Edit Price</h5>
      <button class="p-2 rounded-lg hover:bg-gray-100" data-modal-close>
        <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div>
      <input type="number" inputmode="decimal" step="0.01" min="0.01" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" id="editPriceInput">
    </div>
    <div class="mt-5 flex justify-end gap-2">
      <button class="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-medium transition-all" data-modal-close>Cancel</button>
      <button type="button" id="savePriceBtn" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all shadow-md">Save</button>
    </div>
  </div>
</div>
@endsection

@push('scripts')
<script>
  function showModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
  function hideModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
  
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-modal-close]')) {
      const modal = e.target.closest('[role="dialog"]');
      if (modal) hideModal(modal.id);
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const top = document.querySelector('[role="dialog"]:not(.hidden)');
      if (top) hideModal(top.id);
    }
  });
</script>
<script src="/js/stock.js"></script>
@endpush
