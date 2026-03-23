// public/js/stock.js  (updated to stronger toast colors + badge pills)

// -------------- Helpers --------------
function createSpinner(size = 'sm') {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return `<svg class="${s} animate-spin inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.15" stroke-width="4"></circle>
    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
  </svg>`;
}

// SVG icons used in toasts/badges
const ICON_CHECK = `<svg class="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 6L8.5 13.5 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_X = `<svg class="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_WARN = `<svg class="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 4v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg>`;

// showToast: strong color variants (success = green, error = red, warn = amber)
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.error('Toast container not found');
    alert(message); // Fallback
    return;
  }

  const id = 'toast-' + Date.now();
  const wrapper = document.createElement('div');
  wrapper.id = id;
  wrapper.style.pointerEvents = 'auto';

  // styling: strong colors for quick scanning
  let bgColor = '';
  let textColor = 'text-white';
  let icon = '';
  
  if (type === 'error') {
    bgColor = 'bg-red-600';
    icon = ICON_X;
  } else if (type === 'warn') {
    bgColor = 'bg-amber-500';
    icon = ICON_WARN;
  } else {
    bgColor = 'bg-emerald-600';
    icon = ICON_CHECK;
  }

  wrapper.className = `flex items-center gap-3 rounded-lg shadow-lg max-w-sm px-4 py-3 ${bgColor} ${textColor}`;
  wrapper.style.animation = 'slideInRight 0.3s ease-out';
  
  const iconSpan = document.createElement('span');
  iconSpan.className = 'shrink-0';
  iconSpan.innerHTML = icon;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'flex-1 text-sm font-medium';
  messageDiv.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Close toast');
  closeBtn.className = 'ml-2 p-1 rounded hover:bg-white/20 transition-colors';
  closeBtn.innerHTML = '&times;';
  closeBtn.style.fontSize = '20px';
  closeBtn.addEventListener('click', () => wrapper.remove());
  
  wrapper.appendChild(iconSpan);
  wrapper.appendChild(messageDiv);
  wrapper.appendChild(closeBtn);
  container.appendChild(wrapper);

  // auto remove after 4s
  setTimeout(() => {
    wrapper.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => wrapper.remove(), 300);
  }, 4000);
}

function formatPrice(p) {
  if (p === null || p === undefined || p === '') return '—';
  const num = Number(p);
  if (Number.isFinite(num)) {
    return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return p;
}

// -------------- DOM helpers for modals --------------
function showModalById(id) { const el = document.getElementById(id); if (el) { el.classList.remove('hidden'); document.body.classList.add('overflow-hidden'); const f = el.querySelector('input, button, select, textarea'); if (f) f.focus(); } }
function hideModalById(id) { const el = document.getElementById(id); if (el) { el.classList.add('hidden'); if (!document.querySelector('[role="dialog"]:not(.hidden)')) document.body.classList.remove('overflow-hidden'); } }

// -------------- Load stock --------------
async function loadStock() {
  try {
    const res = await fetch('/stock-list');
    if (!res.ok) throw new Error('Network error');
    const json = await res.json();
    
    // Handle paginated response - data is in json.data
    const data = json.data || json;

    const table = document.getElementById('stockTable');
    table.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      table.innerHTML = '<tr><td colspan="6" class="px-3 py-8 text-center text-gray-500">No stock entries found</td></tr>';
      return;
    }

    data.forEach((item, index) => {
      const tr = document.createElement('tr');

      // badge pills (strong, accessible)
      let badgeHTML = '';
      if (Number(item.quantity) === 0) {
        badgeHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white ml-2">
                       ${ICON_X}<span class="ml-1">Sold Out</span>
                     </span>`;
      } else if (Number(item.quantity) < 10) {
        badgeHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white ml-2">
                       ${ICON_WARN}<span class="ml-1">Low Stock</span>
                     </span>`;
      }

      tr.innerHTML = `
        <td class="px-3 py-3 text-sm text-gray-700 align-middle">${index + 1}</td>
        <td class="px-3 py-3 align-middle">
          <span class="text-sm font-medium text-gray-900">${escapeHtml(item.product_name ?? 'Unknown')}</span>
          ${badgeHTML}
        </td>
        <td class="px-3 py-3 text-sm text-gray-700 text-right align-middle">${item.quantity ?? 0}</td>
        <td class="px-3 py-3 text-sm text-gray-500 text-right align-middle price-cell">${formatPrice(item.cost_price ?? 0)}</td>
        <td class="px-3 py-3 text-sm font-medium text-gray-900 text-right align-middle price-cell">${formatPrice(item.price)}</td>
        <td class="px-3 py-3 align-middle">
          <div class="flex items-center justify-center gap-1">
            <button class="inc-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors focus-ring"
                    data-id="${item.id}" data-product="${escapeAttr(item.product_name ?? '')}" data-qty="${item.quantity ?? 0}" aria-label="Increase stock">
              + Stock
            </button>
            <button class="price-button inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors focus-ring ml-1"
                    data-id="${item.id}" data-price="${item.price ?? ''}" aria-label="Edit price">
              Edit ₦
            </button>
            <button class="delete-button inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors focus-ring ml-1"
                    data-id="${item.id}" aria-label="Delete">
              ${trashSvg()}
            </button>
          </div>
        </td>
      `;

      table.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    showToast('Failed to load stock data.', 'error');
  }
}

// -------------- Utility small helpers --------------
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeAttr(s = '') {
  return String(s).replace(/"/g, '&quot;');
}
function trashSvg() {
  return `<svg class="w-4 h-4 text-current" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5.5 5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3.1a1 1 0 0 1 .95-.684h2.9A1 1 0 0 1 9.4 2H12.5a1 1 0 0 1 1 1zm-10 1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4.5z"/></svg>`;
}

// -------------- Event delegation for table actions --------------
document.addEventListener('click', function (e) {
  const del = e.target.closest('.delete-button');
  const inc = e.target.closest('.inc-button');
  const price = e.target.closest('.price-button');

  if (del) {
    deleteStock(del.dataset.id, del);
    return;
  }
  if (inc) {
    openIncrementModal(inc.dataset.id, inc.dataset.product, inc.dataset.qty);
    return;
  }
  if (price) {
    openPriceModal(price.dataset.id, price.dataset.price);
    return;
  }
});

// -------------- Styled confirm dialog (no native confirm()) --------------
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
          <button id="_cfmOk"     class="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#_cfmOk').addEventListener('click', () => { overlay.remove(); resolve(true); });
    overlay.querySelector('#_cfmCancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
    overlay.querySelector('.absolute.inset-0').addEventListener('click', () => { overlay.remove(); resolve(false); });
  });
}

// -------------- Delete stock --------------
async function deleteStock(stockId, btn) {
  const confirmed = await confirmDialog('Delete this stock entry? This cannot be undone.');
  if (!confirmed) return;
  const original = btn.innerHTML;
  btn.innerHTML = createSpinner('sm');
  btn.disabled = true;

  try {
    const res = await fetch(`/delete-stock/${stockId}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
    });
    const data = await res.json();
    if (data.success) {
      await loadStock();
      showToast('Stock deleted successfully!', 'success');
    } else {
      showToast(data.message || 'Failed to delete stock.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred while deleting stock.', 'error');
  } finally {
    btn.innerHTML = original;
    btn.disabled = false;
  }
}

// -------------- Submit new stock --------------
document.addEventListener('DOMContentLoaded', () => {
  const stockForm = document.getElementById('stockForm');
  if (stockForm) {
    stockForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `${createSpinner('sm')} Uploading...`;

      const payload = {
        product_id: document.getElementById('productSelect').value,
        quantity: document.getElementById('quantityInput').value,
        price: document.getElementById('priceInput').value,
        cost_price: document.getElementById('costPriceInput').value,
        date: document.getElementById('dateInput').value,
      };

      try {
        const res = await fetch('/add-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          await loadStock();
          stockForm.reset();
          document.getElementById('dateInput').value = new Date().toISOString().slice(0,10);
          showToast('Stock added successfully!', 'success');
        } else {
          showToast(data.message || 'Failed to add stock.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('An error occurred while adding stock.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Initial load
  loadStock();
});

// -------------- Increment modal logic --------------
let currentStockId = null;
function openIncrementModal(stockId, productName, currentQuantity) {
  currentStockId = stockId;
  document.getElementById('modalProductName').textContent = productName || '';
  document.getElementById('modalCurrentQuantity').textContent = currentQuantity ?? '0';
  document.getElementById('additionalQuantity').value = '';
  showModalById('incrementModal');
}

document.getElementById('saveIncrementBtn').addEventListener('click', async function () {
  const btn = this;
  const additionalQuantity = Number(document.getElementById('additionalQuantity').value);
  if (!additionalQuantity || additionalQuantity <= 0) { showToast('Enter a valid quantity', 'error'); return; }

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${createSpinner('sm')} Saving...`;

  try {
    const res = await fetch(`/update-stock/${currentStockId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      },
      body: JSON.stringify({ additional_quantity: additionalQuantity })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Stock updated!', 'success');
      await loadStock();
      hideModalById('incrementModal');
    } else {
      showToast(data.message || 'Failed to update stock.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});

// -------------- Edit price modal --------------
let currentPriceStockId = null;
function openPriceModal(stockId, currentPrice) {
  currentPriceStockId = stockId;
  const num = Number(currentPrice);
  document.getElementById('editPriceInput').value = Number.isFinite(num) ? num.toFixed(2) : (currentPrice ?? '');
  showModalById('priceModal');
}

document.getElementById('savePriceBtn').addEventListener('click', async function () {
  const btn = this;
  const newPriceRaw = (document.getElementById('editPriceInput').value || '').toString().trim();
  if (!newPriceRaw) { showToast('Enter valid price', 'error'); return; }

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `${createSpinner('sm')} Saving...`;

  try {
    const res = await fetch(`/update-price/${currentPriceStockId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      },
      body: JSON.stringify({ price: newPriceRaw })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Price updated!', 'success');
      await loadStock();
      hideModalById('priceModal');
    } else {
      showToast(data.message || 'Failed to update price.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Error updating price.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});
