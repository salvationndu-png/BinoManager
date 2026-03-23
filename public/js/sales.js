// /js/sales.js
let customers = [];

document.addEventListener('DOMContentLoaded', function () {
  loadCustomers();
  const itemsContainer = document.getElementById('itemsContainer');
  const addItemBtn = document.getElementById('addItem');
  const grandTotalEl = document.getElementById('grandTotal');
  const salesForm = document.getElementById('salesForm');
  const CSRF = document.querySelector('meta[name="csrf-token"]').content;
  const toastContainer = document.getElementById('toastContainer');

  // ------------------- Load Customers -------------------
  async function loadCustomers() {
    try {
      const response = await fetch('/customers-for-sales');
      customers = await response.json();
      populateCustomerDropdown();
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }

  function populateCustomerDropdown() {
    const select = document.getElementById('customerSelect');
    if (!select) return;

    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = customer.business_name ? `${customer.name} (${customer.business_name})` : customer.name;
      option.dataset.creditLimit = customer.credit_limit;
      option.dataset.outstanding = customer.outstanding_balance;
      select.appendChild(option);
    });
  }

  // Handle customer selection
  document.getElementById('customerSelect')?.addEventListener('change', function() {
    const nameDiv = document.getElementById('customerNameDiv');
    const nameInput = document.getElementById('customerNameInput');
    
    if (this.value === 'other') {
      nameDiv.style.display = 'block';
      nameInput.required = true;
    } else {
      nameDiv.style.display = 'none';
      nameInput.required = false;
      nameInput.value = '';
    }
    
    checkCreditWarning();
    validateCreditSale();
  });

  // Handle payment type change
  document.querySelector('select[name="payment_type"]')?.addEventListener('change', function() {
    checkCreditWarning();
    validateCreditSale();
  });

  function validateCreditSale() {
    const paymentType = document.querySelector('select[name="payment_type"]').value;
    const customerSelect = document.getElementById('customerSelect');
    const customerId = customerSelect?.value;
    const submitBtn = document.getElementById('submitBtn');
    
    if (paymentType === 'Credit' && (!customerId || customerId === 'other' || customerId === '')) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  function checkCreditWarning() {
    const paymentType = document.querySelector('select[name="payment_type"]').value;
    const customerSelect = document.getElementById('customerSelect');
    const customerId = customerSelect?.value;
    
    // Remove existing warning
    const existingWarning = document.getElementById('creditWarning');
    if (existingWarning) existingWarning.remove();
    
    // Show customer info if registered customer is selected
    if (customerId && customerId !== 'other' && customerId !== '') {
      const customer = customers.find(c => c.id == customerId);
      if (customer) {
        const remaining = Number(customer.credit_limit) - Number(customer.outstanding_balance);
        const isCredit = paymentType === 'Credit';
        const warning = document.createElement('div');
        warning.id = 'creditWarning';
        warning.className = `col-span-full p-3 rounded-xl flex items-start gap-2 ${isCredit ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`;
        
        warning.innerHTML = `
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5 ${isCredit ? 'text-red-600' : 'text-blue-600'}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
          <div class="text-sm ${isCredit ? 'text-red-800' : 'text-blue-800'}">
            <strong>${isCredit ? 'Credit Sale:' : 'Customer:'}</strong> ${customer.name} | Credit Limit: ₦${Number(customer.credit_limit).toLocaleString()} | Outstanding: ₦${Number(customer.outstanding_balance).toLocaleString()} | Available: ₦${remaining.toLocaleString()}
          </div>
        `;
        
        // Insert warning after the first card
        const firstCard = document.querySelector('.card');
        if (firstCard && firstCard.nextElementSibling) {
          firstCard.parentNode.insertBefore(warning, firstCard.nextElementSibling);
        }
      }
    } else if (paymentType === 'Credit') {
      const warning = document.createElement('div');
      warning.id = 'creditWarning';
      warning.className = 'col-span-full p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2';
      warning.innerHTML = `
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        <div class="text-sm text-red-800">
          <strong>Credit Sale Not Allowed:</strong> Credit sales can only be made to registered customers. Please select a customer or change payment type.
        </div>
      `;
      const firstCard = document.querySelector('.card');
      if (firstCard && firstCard.nextElementSibling) {
        firstCard.parentNode.insertBefore(warning, firstCard.nextElementSibling);
      }
    }
  }

  // ------------------- Toast -------------------
  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    const el = document.createElement('div');
    el.className = `relative px-3 py-2 rounded-md text-white ${bg} shadow-lg flex items-center justify-between anim-fade-in-up`;
    // amazonq-ignore-next-line
    el.innerHTML = `
      <span>${message}</span>
      <button class="ml-2 text-white font-bold" style="line-height:1" onclick="this.parentElement.remove()">×</button>
    `;
    toastContainer.appendChild(el);
    setTimeout(() => el.classList.add('opacity-0'), 2400);
    setTimeout(() => el.remove(), 3000);
  }
  

  // ------------------- Number Utilities -------------------
  function parseNumber(str) {
    if (str == null) return NaN;
    const cleaned = String(str).replace(/[^0-9.\-]+/g, '');
    return cleaned === '' ? NaN : parseFloat(cleaned);
  }

  function formatDisplayNumber(n) {
    if (n == null || isNaN(Number(n))) return '';
    return Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatNaira(n) {
    const disp = formatDisplayNumber(n);
    return disp === '' ? '₦0.00' : '₦' + disp;
  }

  // ------------------- Thermal POS Receipt -------------------
  function printThermalReceipt(items, grandTotal) {
    const receiptContent = `
      <div style="width: 80mm; font-family: monospace; font-size: 12px; padding: 10px;">
        <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 5px;">LOVE HILLS</div>
        <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">Love Hills Plaza, Mandilas<br>Lagos Island</div>
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">SALES RECEIPT</div>
        <div style="font-size: 11px; margin-bottom: 10px;">Date: ${new Date().toLocaleString()}</div>
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        <table style="width: 100%; font-size: 11px;">
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="text-align: left;">${item.product}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₦${item.price}</td>
                <td style="text-align: right;">₦${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        <div style="text-align: right; font-weight: bold; font-size: 14px; margin: 10px 0;">TOTAL: ₦${grandTotal}</div>
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        <div style="text-align: center; font-size: 11px; margin-top: 15px;">Thank you for shopping with us!</div>
        <div style="text-align: center; font-size: 10px; margin-top: 5px;">Please come again</div>
      </div>
    `;

    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write('<html><head><title>Receipt</title></head><body>');
    printWindow.document.write(receiptContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  // ------------------- Item Card -------------------
  function addItemCard() {
    const tpl = document.getElementById('productOptions');
    const opts = tpl ? tpl.innerHTML : '<option value="" disabled>Select product</option>';

    const row = document.createElement('div');
    row.className = 'item-card flex flex-col md:flex-row md:items-center gap-2 md:gap-3 bg-white rounded-md shadow p-2';
    row.innerHTML = `
      <select name="product[]" class="product-select w-full md:w-[220px] h-10 px-2 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">${opts}</select>
      <div class="relative w-full md:w-28">
        <input name="quantity[]" type="number" min="1" class="quantity w-full h-10 px-2 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Qty" required />
        <span class="available-qty absolute -bottom-4 left-0 text-xs text-gray-400 whitespace-nowrap hidden" data-available="0"></span>
      </div>
      <input name="price[]" type="text" readonly class="price w-full md:w-28 h-10 px-2 rounded-md border border-slate-200 text-sm bg-slate-50" placeholder="Price auto-filled" required />
      <div class="flex items-center justify-between md:flex-col md:items-end w-full md:w-28">
        <div class="text-xs text-slate-500">Line Total</div>
        <div class="item-total font-semibold text-gray-900">₦0.00</div>
      </div>
      <button type="button" class="removeItem flex-shrink-0 w-8 h-8 rounded-lg grid place-items-center text-rose-500 hover:bg-rose-50 transition-colors" title="Remove item">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    itemsContainer.appendChild(row);
    row.querySelector('.product-select')?.focus();
  }

  // ------------------- Totals -------------------
  function renderLineTotal(card) {
    const qty = Number(card.querySelector('.quantity').value) || 0;
    const priceRaw = parseNumber(card.querySelector('.price').value) || 0;
    card.querySelector('.item-total').textContent = formatNaira(qty * priceRaw);
  }

  function updateTotals() {
    let total = 0;
    document.querySelectorAll('.item-card').forEach(card => {
      const qty = Number(card.querySelector('.quantity').value) || 0;
      const priceRaw = parseNumber(card.querySelector('.price').value) || 0;
      total += qty * priceRaw;
    });
    grandTotalEl.textContent = formatNaira(total);
  }

  function clampQtyToAvailable(card) {
    const qtyInput = card.querySelector('.quantity');
    const availEl = card.querySelector('.available-qty');
    const available = Number(availEl.dataset.available || 0);
    const val = qtyInput.valueAsNumber || 0;
    if (val > available) {
      qtyInput.value = available;
      showToast('Quantity exceeds available stock. Adjusted to max available.', 'error');
    }
  }

  // ------------------- Event Delegation -------------------
  itemsContainer.addEventListener('change', async function (e) {
    const select = e.target.closest('.product-select');
    if (!select) return;

    const card = select.closest('.item-card');
    const option = select.selectedOptions[0];
    const priceInput = card.querySelector('.price');
    const availEl = card.querySelector('.available-qty');

    const optPrice = option?.dataset?.price;
    if (optPrice != null && optPrice !== '') {
      const num = parseNumber(optPrice);
      priceInput.value = isNaN(num) ? '' : formatDisplayNumber(num);
      renderLineTotal(card);
      updateTotals();
    }

    const productId = select.value;
    if (!productId) return;

    try {
      const res = await fetch(`/get-product-details/${productId}`);
      const data = await res.json();

      if (data?.success) {
        const available = Number(data.quantity || 0);
        availEl.dataset.available = available;
        availEl.textContent = `${available} in stock`;
        availEl.className = `available-qty absolute -bottom-4 left-0 text-xs whitespace-nowrap font-medium ${available > 0 ? 'text-emerald-600' : 'text-red-500'}`;

        if (data.price != null && data.price !== '') {
          const pnum = parseNumber(data.price);
          if (!isNaN(pnum)) priceInput.value = formatDisplayNumber(pnum);
        }

        clampQtyToAvailable(card);
        renderLineTotal(card);
        updateTotals();
      } else {
        availEl.textContent = 'Stock unknown';
        availEl.className = 'available-qty absolute -bottom-4 left-0 text-xs whitespace-nowrap text-gray-400';
        availEl.dataset.available = '';
        showToast(data?.message || 'Could not fetch product details.', 'error');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      availEl.textContent = '';
      availEl.dataset.available = '';
      showToast('Error fetching product details.', 'error');
    }
  });

  itemsContainer.addEventListener('input', function (e) {
    const t = e.target;
    if (t.classList.contains('quantity') || t.classList.contains('price')) {
      const card = t.closest('.item-card');
      if (t.classList.contains('quantity')) clampQtyToAvailable(card);
      renderLineTotal(card);
      updateTotals();
    }
  });

  itemsContainer.addEventListener('click', function (e) {
    const rem = e.target.closest('.removeItem');
    if (rem) {
      rem.closest('.item-card').remove();
      updateTotals();
    }
  });

  addItemBtn?.addEventListener('click', addItemCard);

  // ------------------- Submit Form -------------------
  salesForm?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn && (submitBtn.disabled = true, submitBtn.textContent = 'Recording...');

    const priceInputs = Array.from(salesForm.querySelectorAll('.price'));
    const backupDisplay = priceInputs.map(i => i.value);
    priceInputs.forEach(inp => {
      const n = parseNumber(inp.value);
      inp.value = isNaN(n) ? '' : n.toFixed(2);
    });

    const formData = new FormData(salesForm);
    
    // Add customer_id if a customer is selected
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect && customerSelect.value && customerSelect.value !== 'other') {
      formData.append('customer_id', customerSelect.value);
    }

    try {
      const res = await fetch('/add-sale', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': CSRF },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        showToast('Sale recorded successfully!', 'success');

        const items = Array.from(document.querySelectorAll('.item-card')).map(card => {
          const product = card.querySelector('.product-select').selectedOptions[0]?.textContent || '';
          const quantity = card.querySelector('.quantity').value || '0';
          const priceNum = parseNumber(card.querySelector('.price').value) || 0;
          const totalNum = quantity * priceNum;
          return {
            product,
            quantity,
            price: formatDisplayNumber(priceNum),
            total: formatDisplayNumber(totalNum)
          };
        });

        const grandTotalNum = parseNumber(grandTotalEl.textContent) || 0;
        printThermalReceipt(items, formatDisplayNumber(grandTotalNum));

        salesForm.reset();
        itemsContainer.innerHTML = '';
        grandTotalEl.textContent = '₦0.00';
        addItemCard();
      } else {
        showToast(data.message || 'Failed to record sale.', 'error');
      }
    } catch (err) {
      console.error('submit error', err);
      showToast('Error recording sale.', 'error');
    } finally {
      priceInputs.forEach((inp, i) => document.body.contains(inp) && (inp.value = backupDisplay[i] ?? inp.value));
      submitBtn && (submitBtn.disabled = false, submitBtn.textContent = '✅ Record Sale');
    }
  });

  // ------------------- Init -------------------
  addItemCard();
});
