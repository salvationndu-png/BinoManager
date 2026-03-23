let customers = [];
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    const el = document.createElement('div');
    el.className = `pointer-events-auto px-5 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${bg}`;
    el.style.minWidth = '220px';
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 350); }, 3000);
}

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

document.addEventListener('DOMContentLoaded', loadCustomers);

async function loadCustomers() {
    try {
        const response = await fetch('/customers/list');
        const data = await response.json();
        customers = data;
        renderCustomers();
        updateStats();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function renderCustomers() {
    const tbody = document.getElementById('customersTable');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-sm font-medium text-gray-900">${customer.name}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${customer.business_name || '-'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${customer.phone || '-'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 text-right">₦${Number(customer.credit_limit || 0).toLocaleString()}</td>
            <td class="px-4 py-3 text-sm font-medium text-right ${customer.outstanding_balance > 0 ? 'text-red-600' : 'text-gray-700'}">₦${Number(customer.outstanding_balance || 0).toLocaleString()}</td>
            <td class="px-4 py-3 text-sm text-gray-700 text-right">₦${Number(customer.sales_sum_total || 0).toLocaleString()}</td>
            <td class="px-4 py-3 text-center">
                ${customer.outstanding_balance > 0 ? `
                <button onclick="openPaymentModal(${customer.id})" class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Record Payment">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </button>
                ` : ''}
                <button onclick="editCustomer(${customer.id})" class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button onclick="deleteCustomer(${customer.id}, '${(customer.name || '').replace(/'/g, "\\'")}')" class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    document.getElementById('totalCustomers').textContent = customers.length;
    
    const totalCredit = customers.reduce((sum, c) => sum + Number(c.credit_limit || 0), 0);
    document.getElementById('totalCredit').textContent = '₦' + totalCredit.toLocaleString();
    
    const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.outstanding_balance || 0), 0);
    document.getElementById('totalOutstanding').textContent = '₦' + totalOutstanding.toLocaleString();
}

function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Add Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('customerModal').classList.remove('hidden');
    document.getElementById('customerModal').classList.add('flex');
}

function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('modalTitle').textContent = 'Edit Customer';
    document.getElementById('customerId').value = customer.id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone || '';
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerBusiness').value = customer.business_name || '';
    document.getElementById('customerAddress').value = customer.address || '';
    document.getElementById('customerCredit').value = customer.credit_limit || 0;
    
    document.getElementById('customerModal').classList.remove('hidden');
    document.getElementById('customerModal').classList.add('flex');
}

function closeModal() {
    document.getElementById('customerModal').classList.add('hidden');
    document.getElementById('customerModal').classList.remove('flex');
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('customerId').value;
    const data = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        business_name: document.getElementById('customerBusiness').value,
        address: document.getElementById('customerAddress').value,
        credit_limit: document.getElementById('customerCredit').value || 0,
    };

    try {
        const url = id ? `/customers/${id}` : '/customers';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            closeModal();
            loadCustomers();
            showToast(result.message);
        } else {
            showToast(result.message || 'Error saving customer', 'error');
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        showToast('Error saving customer', 'error');
    }
});

async function deleteCustomer(id, name) {
    const confirmed = await confirmDialog(`Delete customer "<strong>${name || 'this customer'}</strong>"? This cannot be undone.`);
    if (!confirmed) return;

    try {
        const response = await fetch(`/customers/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        const result = await response.json();
        
        if (result.success) {
            loadCustomers();
            showToast(result.message);
        } else {
            showToast(result.message || 'Error deleting customer', 'error');
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        showToast('Error deleting customer', 'error');
    }
}

// Close modal on backdrop click
document.getElementById('customerModal').addEventListener('click', (e) => {
    if (e.target.id === 'customerModal') closeModal();
});

// Payment Modal Functions
function openPaymentModal(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    document.getElementById('paymentCustomerId').value = customerId;
    document.getElementById('paymentCustomerName').textContent = customer.name;
    document.getElementById('paymentOutstanding').textContent = '₦' + Number(customer.outstanding_balance).toLocaleString();
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentAmount').max = customer.outstanding_balance;
    document.getElementById('paymentMethod').value = 'Cash';
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('paymentNotes').value = '';
    
    document.getElementById('paymentModal').classList.remove('hidden');
    document.getElementById('paymentModal').classList.add('flex');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    document.getElementById('paymentModal').classList.remove('flex');
}

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerId = document.getElementById('paymentCustomerId').value;
    const data = {
        amount: document.getElementById('paymentAmount').value,
        payment_method: document.getElementById('paymentMethod').value,
        payment_date: document.getElementById('paymentDate').value,
        notes: document.getElementById('paymentNotes').value
    };

    try {
        const response = await fetch(`/customers/${customerId}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            closePaymentModal();
            loadCustomers();
            showToast(result.message);
        } else {
            showToast(result.message || 'Error recording payment', 'error');
        }
    } catch (error) {
        console.error('Error recording payment:', error);
        showToast('Error recording payment', 'error');
    }
});

document.getElementById('paymentModal').addEventListener('click', (e) => {
    if (e.target.id === 'paymentModal') closePaymentModal();
});
