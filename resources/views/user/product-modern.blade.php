@extends('layouts.modern')

@section('title', 'Products - Wholesale Manager')
@section('page-title', 'Product Management')
@section('page-subtitle', 'Add and manage your products')

@section('content')
<div class="card p-6 max-w-2xl">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 rounded-xl grid place-items-center text-white" style="background: var(--gradient-primary);">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Add New Product</h2>
      <p class="text-sm text-gray-500">Create a new product entry</p>
    </div>
  </div>

  <form id="addProductForm" class="space-y-4">
    @csrf
    <div>
      <label for="productName" class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
      <input id="productName" name="productName" type="text" placeholder="e.g., Jeans Bundle" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required>
    </div>

    <div class="flex items-center gap-3">
      <button id="submitBtn" type="submit" class="px-6 py-3 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg" style="background: var(--gradient-primary);">
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          Add Product
        </span>
      </button>
    </div>
  </form>
</div>

<div class="card p-6">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="text-xl font-semibold text-gray-900">Product List</h3>
      <p class="text-sm text-gray-500">Manage your product catalog</p>
    </div>
    <div class="text-sm text-gray-500">
      Total: <span id="productCount" class="font-semibold text-gray-900">0</span>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
          <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody id="productList" class="divide-y divide-gray-100"></tbody>
    </table>
  </div>
</div>

<div id="toast" class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl opacity-0 transition-opacity duration-300 pointer-events-none z-50"></div>
@endsection

@push('scripts')
<script>
const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
const productList = document.getElementById('productList');
const productCount = document.getElementById('productCount');
const addForm = document.getElementById('addProductForm');
const productName = document.getElementById('productName');
const submitBtn = document.getElementById('submitBtn');

async function loadProducts() {
  if (!productList) return;
  try {
    const res = await fetch('/products-list');
    const data = await res.json();
    if (productCount) productCount.textContent = data.length;
    productList.innerHTML = '';
    data.forEach((product, i) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition-colors';
      tr.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-700">${i + 1}</td>
        <td class="px-4 py-3 text-sm text-gray-900 font-medium">${product.name}</td>
        <td class="px-4 py-3 text-sm text-right">
          <button class="delete-btn inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all" data-id="${product.id}" data-name="${product.name}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </td>
      `;
      productList.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// Toast helper
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const colours = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const el = document.createElement('div');
  el.className = 'pointer-events-auto px-5 py-3 rounded-xl text-white text-sm font-medium shadow-xl animate-slide-up';
  el.style.cssText = `background:${colours[type] ?? colours.success}; min-width:220px;`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 350); }, 3000);
}

// Styled confirm dialog
function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-10 h-10 rounded-full bg-red-100 grid place-items-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">Confirm Delete</h3>
            <p class="text-sm text-gray-600">${message}</p>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button id="_cfmCancel" class="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">Cancel</button>
          <button id="_cfmOk" class="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#_cfmOk').addEventListener('click', () => { overlay.remove(); resolve(true); });
    overlay.querySelector('#_cfmCancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
    overlay.querySelector('.absolute.inset-0').addEventListener('click', () => { overlay.remove(); resolve(false); });
  });
}

addForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = productName.value.trim();
  if (!name) { showToast('Please enter a product name', 'error'); return; }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Adding...</span>';

  try {
    const res = await fetch('/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) {
      productName.value = '';
      loadProducts();
      showToast('Product added!', 'success');
    } else {
      showToast(data.message || 'Failed to add product', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Add Product</span>';
  }
});

productList?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  const id   = btn.dataset.id;
  const name = btn.dataset.name || 'this product';

  const confirmed = await confirmDialog(`Delete "<strong>${name}</strong>"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/delete-product/${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-TOKEN': csrf }
    });
    const data = await res.json();
    if (data.success) {
      loadProducts();
      showToast('Product deleted', 'success');
    } else {
      showToast(data.message || 'Failed to delete', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred', 'error');
  }
});

loadProducts();
</script>
@endpush
