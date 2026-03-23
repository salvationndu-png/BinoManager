@extends('layouts.modern')

@section('title', 'Sales - Wholesale Manager')
@section('page-title', 'Record Sale')
@section('page-subtitle', 'Create sales transactions')

@section('content')
<div class="max-w-5xl mx-auto space-y-4">
  <form id="salesForm" class="space-y-4" autocomplete="off">
    @csrf

    {{-- Header row: customer, payment, date --}}
    <div class="card p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Customer</label>
          <select id="customerSelect" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
            <option value="">Walk-in Customer</option>
            <option value="other">Other (Enter Name)</option>
          </select>
        </div>

        <div id="customerNameDiv" style="display: none;">
          <label class="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
          <input id="customerNameInput" name="customer_name" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Enter name" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Payment</label>
          <select name="payment_type" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
            <option value="Cash">Cash</option>
            <option value="Transfer">Transfer</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input type="date" name="sale_date" value="{{ now()->toDateString() }}" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
        </div>
      </div>
    </div>

    {{-- Product options template (hidden, cloned by JS per row) --}}
    <template id="productOptions">
      <option value="" selected disabled>Select product</option>
      @foreach($products as $product)
        <option value="{{ $product->id }}"
          data-price="{{ $product->latestStock->price ?? 0 }}"
          data-stock="{{ $product->quantity }}">
          {{ $product->name }} ({{ $product->quantity }} in stock)
        </option>
      @endforeach
    </template>

    {{-- Item rows injected by sales.js --}}
    <div id="itemsContainer" class="space-y-2"></div>

    {{-- Footer: add item + grand total + submit --}}
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <button type="button" id="addItem"
        class="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition-all shadow-md hover:shadow-lg"
        style="background: var(--gradient-primary);">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
        Add Item
      </button>

      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-500">Total Sale</div>
        <div id="grandTotal" class="text-xl font-bold text-gray-900">₦0.00</div>
        <button id="submitBtn" type="submit"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all shadow-md">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Record Sale
        </button>
      </div>
    </div>
  </form>
</div>
@endsection

@push('scripts')
<script src="/js/sales.js"></script>
@endpush
