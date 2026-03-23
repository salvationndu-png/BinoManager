  // Elements that must match your dashboard shell
    const sidebar     = document.getElementById('sidebar');
    const openBtn     = document.getElementById('openSidebar');
    const closeBtn    = document.getElementById('closeSidebar');
    const backdrop    = document.getElementById('backdrop');
    const accountBtn  = document.getElementById('accountBtn');
    const accountMenu = document.getElementById('accountMenu');

    // Add Product elements
    const addForm     = document.getElementById('addProductForm');
    const productName = document.getElementById('productName');
    const submitBtn   = document.getElementById('submitBtn');
    const productList = document.getElementById('productList');

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Sidebar open/close (mobile)
    function openSidebar() {
      if (!sidebar) return;
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('pointer-events-none');
      backdrop.classList.add('opacity-100');
      document.documentElement.style.overflow = 'hidden';
      openBtn && openBtn.setAttribute('aria-expanded','true');
    }
    function closeSidebar() {
      if (!sidebar) return;
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('pointer-events-none');
      backdrop.classList.remove('opacity-100');
      document.documentElement.style.overflow = '';
      openBtn && openBtn.setAttribute('aria-expanded','false');
    }
    openBtn && openBtn.addEventListener('click', openSidebar);
    closeBtn && closeBtn.addEventListener('click', closeSidebar);
    backdrop && backdrop.addEventListener('click', closeSidebar);

    const mql = window.matchMedia('(min-width: 768px)');
    function handleResize() {
      if (!sidebar) return;
      if (mql.matches) {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.add('pointer-events-none');
        backdrop.classList.remove('opacity-100');
        document.documentElement.style.overflow = '';
        openBtn && openBtn.setAttribute('aria-expanded','false');
      } else {
        sidebar.classList.add('-translate-x-full');
      }
    }
    handleResize();
    (mql.addEventListener ? mql.addEventListener('change', handleResize) : window.addEventListener('resize', handleResize));

    function closeDropdown() { if (!accountMenu || !accountBtn) return; accountMenu.classList.add('hidden'); accountBtn.setAttribute('aria-expanded','false'); }
    function toggleDropdown() {
      if (!accountMenu || !accountBtn) return;
      const isHidden = accountMenu.classList.contains('hidden');
      accountMenu.classList.toggle('hidden');
      accountBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    }
    accountBtn && accountBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(); });
    document.addEventListener('click', (e) => {
      if (!accountMenu || !accountBtn) return;
      if (!accountMenu.classList.contains('hidden')) {
        if (!accountMenu.contains(e.target) && !accountBtn.contains(e.target)) closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeSidebar(); closeDropdown(); }
    });

    openBtn && openBtn.addEventListener('click', () => {
      const firstLink = sidebar.querySelector('nav a');
      if (firstLink) firstLink.focus();
    });

    // ---------- Toast (uses shared layout container) ----------
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const colours = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto px-5 py-3 rounded-xl text-white text-sm font-medium shadow-xl animate-slide-up';
      toast.style.cssText = `background:${colours[type] ?? colours.success}; min-width:220px;`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 350);
      }, 3000);
    }

    // ---------- Styled confirm dialog (no native confirm()) ----------
    function confirmDialog(message) {
      return new Promise((resolve) => {
        // Create modal
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

    // ---------- Products CRUD ----------
    async function loadProducts() {
      if (!productList) return;
      try {
        const res = await fetch('/products-list', { headers: { 'Accept':'application/json' }});
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        productList.innerHTML = '';
        const countEl = document.getElementById('productCount');
        if (countEl) countEl.textContent = data.length;
        (data || []).forEach((product, i) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 transition-colors';
          tr.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-700">${i + 1}</td>
            <td class="px-4 py-3 text-sm text-gray-900 font-medium">${escapeHtml(product.name ?? '')}</td>
            <td class="px-4 py-3 text-sm text-right">
              <button class="delete-btn inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all text-sm" data-id="${product.id}" data-name="${escapeHtml(product.name ?? '')}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete
              </button>
            </td>
          `;
          productList.appendChild(tr);
        });
      } catch (err) {
        console.error(err);
        showToast('Failed to load products', 'error');
      }
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
    }

    function spinner(label = 'Saving...') {
      return `<span class="inline-flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
        ${label}
      </span>`;
    }

    // Add product
    addForm && addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!productName || !submitBtn) return;
      const name = productName.value.trim();
      if (!name) { showToast('Please enter a product name', 'error'); return; }

      submitBtn.disabled = true;
      const original = submitBtn.innerHTML;
      submitBtn.innerHTML = spinner('Adding...');
      try {
        const res = await fetch('/add-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
          body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data?.success) {
          productName.value = '';
          await loadProducts();
          showToast('Product added successfully!', 'success');
        } else {
          showToast(data?.message || 'Failed to add product', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('An error occurred', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }
    });

    // Delete product
    productList && productList.addEventListener('click', async (e) => {
      const btn = e.target.closest('.delete-btn');
      if (!btn) return;
      const id   = btn.dataset.id;
      const name = btn.dataset.name || 'this product';
      if (!id) return;

      const confirmed = await confirmDialog(`Delete "<strong>${name}</strong>"? This cannot be undone.`);
      if (!confirmed) return;

      try {
        const res = await fetch(`/delete-product/${id}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) }
        });
        const data = await res.json();
        if (data?.success) {
          await loadProducts();
          showToast('Product deleted', 'success');
        } else {
          showToast(data?.message || 'Failed to delete product', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('An error occurred', 'error');
      }
    });

    loadProducts();
