document.getElementById('filterForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this;
    const startDate = form.start_date.value;
    const endDate = form.end_date.value;

    const salesTableBody = document.getElementById('salesTableBody');
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');

    salesTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted small">Loading...</td></tr>`;
    totalAmountDisplay.textContent = '';

    fetch(`/track-sales-data?start_date=${startDate}&end_date=${endDate}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let rows = '';
                if (data.sales.length === 0) {
                    rows = `<tr><td colspan="7" class="text-center text-muted small">No sales found for this range.</td></tr>`;
                } else {
                    data.sales.forEach(sale => {
                        const date = new Date(sale.sale_date).toISOString().split('T')[0];
                        const productName = sale.product ? sale.product.name : 'N/A';
                        const userName = sale.user ? sale.user.name : 'Unknown';
                        rows += `
                            <tr>
                                <td>${date}</td>
                                <td>${productName}</td>
                                <td>${sale.quantity}</td>
                                <td>₦${Number(sale.price).toLocaleString()}</td>
                                <td>₦${Number(sale.total).toLocaleString()}</td>
                                <td>${sale.payment_type}</td>
                                <td>${userName}</td>
                            </tr>`;
                    });
                }
                salesTableBody.innerHTML = rows;
                totalAmountDisplay.textContent = `Total Sales: ₦${Number(data.totalAmount).toLocaleString()}`;
            } else {
                salesTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger small">Error fetching sales data.</td></tr>`;
            }
        })
        .catch(error => {
            console.error(error);
            salesTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger small">Error fetching sales data.</td></tr>`;
        });
});

    // Sidebar open/close (mobile)
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');

    openSidebarBtn && openSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
    });

    closeSidebarBtn && closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    });

    backdrop && backdrop.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    });

    // account dropdown
    const accountBtn = document.getElementById('accountBtn');
    const accountMenu = document.getElementById('accountMenu');
    accountBtn && accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accountMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!accountMenu.classList.contains('hidden')) {
        if (!accountMenu.contains(e.target) && !accountBtn.contains(e.target)) accountMenu.classList.add('hidden');
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') accountMenu.classList.add('hidden'); });


    document.addEventListener('DOMContentLoaded', () => {
      const tbody = document.getElementById('salesTableBody');
      const searchInput = document.getElementById('salesSearch');
     
    
      const summaryRecords = document.getElementById('summaryRecords');
      const summaryTotal = document.getElementById('summaryTotal');
      const totalAmountDisplay = document.getElementById('totalAmountDisplay');

      // utility: parse currency like "₦1,234.00" or "1234.00" to number
      function parseCurrency(text) {
        if (!text) return 0;
        const cleaned = text.replace(/[^0-9.\-]/g, '');
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
      }

      // compute summary from current visible rows
      function computeSummary() {
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.querySelectorAll('td').length > 0);
        // if placeholder (single row with colspan), treat as 0
        if (rows.length === 1 && rows[0].children.length === 1) {
          summaryRecords.textContent = '0';
          summaryTotal.textContent = '₦0.00';
          totalAmountDisplay.textContent = '';
          return;
        }

        let records = 0;
        let total = 0;
        rows.forEach(r => {
          const cells = r.querySelectorAll('td');
          if (cells.length < 5) return; // skip malformed
          const totalCell = cells[4]; // 5th column = Total
          const totalVal = parseCurrency(totalCell.textContent);
          if (!isNaN(totalVal)) { total += totalVal; records++; }
        });

        summaryRecords.textContent = records.toString();
        summaryTotal.textContent = '₦' + total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalAmountDisplay.textContent = `Total: ₦${total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
      }

      // simple search filter over current DOM rows (does not change server data)
      function applySearchFilter() {
        const q = (searchInput.value || '').trim().toLowerCase();
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(r => {
          // placeholder row (single td) should remain visible when no query
          if (r.children.length === 1) {
            r.style.display = q ? 'none' : '';
            return;
          }
          const text = r.textContent.toLowerCase();
          r.style.display = text.includes(q) ? '' : 'none';
        });
        computeSummary();
      }

 

      // clear filters & search
      function clearUi() {
        searchInput.value = '';
        computeSummary();
      }

      // observe table changes (your track.js will insert rows) and recompute summary
      const observer = new MutationObserver(muts => {
        // add subtle class for new rows & compute summary
        muts.forEach(m => {
          if (m.addedNodes && m.addedNodes.length) {
            m.addedNodes.forEach(node => {
              if (node.nodeType === 1 && node.matches('tr')) {
                node.classList.add('table-row-appear');
                // ensure numeric cells appear right aligned
                node.querySelectorAll('td:nth-child(3), td:nth-child(4), td:nth-child(5)').forEach(td => td.classList.add('text-right'));
                node.querySelectorAll('td').forEach(td => td.classList.add('px-3', 'py-2'));
              }
            });
          }
        });
        // small timeout to allow your script to finish any formatting
        setTimeout(computeSummary, 60);
      });
      observer.observe(tbody, { childList: true, subtree: false });

      // initial compute in case track.js already rendered before DOMContentLoaded
      computeSummary();
    });


