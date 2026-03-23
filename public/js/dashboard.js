 // Chart data (from your controller)

    // Doughnut
    new Chart(document.getElementById('topProductsChart'), {
      type: 'doughnut',
      data: { labels: topProducts.labels, datasets: [{ data: topProducts.data, backgroundColor: ['#383ac4ff','#126831e0','#f59f0ba2','#ef4444a9','#8a5cf6a9'] }] },
      options: { plugins: { legend: { position: 'bottom' } } }
    });

    // Bar
    new Chart(document.getElementById('salesTrendChart'), {
      type: 'bar',
      data: { labels: salesTrend.labels, datasets: [{ label: '₦ Sales', data: salesTrend.data, backgroundColor: '#16a34a', borderRadius: 6 }] },
      options: { scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
    });

    // Elements
    const sidebar     = document.getElementById('sidebar');
    const openBtn     = document.getElementById('openSidebar');
    const closeBtn    = document.getElementById('closeSidebar');
    const backdrop    = document.getElementById('backdrop');
    const accountBtn  = document.getElementById('accountBtn');
    const accountMenu = document.getElementById('accountMenu');

    // open/close sidebar (mobile)
    function openSidebar() {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('pointer-events-none');
      backdrop.classList.add('opacity-100');
      document.documentElement.style.overflow = 'hidden'; // lock scrolling
      openBtn && openBtn.setAttribute('aria-expanded','true');
    }
    function closeSidebar() {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('pointer-events-none');
      backdrop.classList.remove('opacity-100');
      document.documentElement.style.overflow = ''; // restore scrolling
      openBtn && openBtn.setAttribute('aria-expanded','false');
    }

    openBtn && openBtn.addEventListener('click', openSidebar);
    closeBtn && closeBtn.addEventListener('click', closeSidebar);
    backdrop && backdrop.addEventListener('click', closeSidebar);

    // keep sidebar visible on desktop and reset states on resize
    const mql = window.matchMedia('(min-width: 768px)');
    function handleResize() {
      if (mql.matches) {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.add('pointer-events-none');
        backdrop.classList.remove('opacity-100');
        document.documentElement.style.overflow = '';
        openBtn && openBtn.setAttribute('aria-expanded','false');
      } else {
        // start closed on smaller screens
        sidebar.classList.add('-translate-x-full');
      }
    }
    handleResize();
    mql.addEventListener ? mql.addEventListener('change', handleResize) : window.addEventListener('resize', handleResize);

    // account dropdown
    function closeDropdown() { accountMenu.classList.add('hidden'); accountBtn.setAttribute('aria-expanded','false'); }
    function toggleDropdown() {
      const isHidden = accountMenu.classList.contains('hidden');
      accountMenu.classList.toggle('hidden');
      accountBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    }
    accountBtn && accountBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(); });
    document.addEventListener('click', (e) => {
      if (!accountMenu.classList.contains('hidden')) {
        const inside = accountMenu.contains(e.target) || accountBtn.contains(e.target);
        if (!inside) closeDropdown();
      }
    });

    // close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeSidebar(); closeDropdown(); }
    });

    // Accessibility: focus first nav link when opening
    openBtn && openBtn.addEventListener('click', () => {
      const firstLink = sidebar.querySelector('nav a');
      if (firstLink) firstLink.focus();
    });