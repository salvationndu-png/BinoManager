// Number counting animation
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

// Dark mode toggle — targets <html> element, same as layout inline script
function initDarkMode() {
  if (localStorage.getItem('darkMode') === '1') {
    document.documentElement.classList.add('dark');
  }

  window.toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark') ? '1' : '0');
  };
}

// Toast notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-xl text-white z-50 animate-slide-up ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case 'k': e.preventDefault(); document.getElementById('searchInput')?.focus(); break;
      case 'd': e.preventDefault(); toggleDarkMode(); break;
    }
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  
  // Animate stat numbers
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    animateValue(el, 0, target, 1000);
  });
});

// Export functionality
window.exportReport = (type) => {
  if (type === 'sales') {
    // Pull the 7-day trend data rendered into the page by Laravel
    const canvas = document.getElementById('salesTrendChart');
    if (!canvas) { showToast('Chart not ready yet', 'error'); return; }

    const chart = Chart.getChart(canvas);
    if (!chart) { showToast('Chart not ready yet', 'error'); return; }

    const labels = chart.data.labels;
    const values = chart.data.datasets[0].data;

    let csv = 'Day,Sales (₦)\n';
    labels.forEach((label, i) => {
      csv += `"${label}","${values[i]}"\n`;
    });

    downloadCSV(csv, `sales_trend_${today()}.csv`);
    showToast('Sales trend exported', 'success');
  }

  if (type === 'products') {
    const canvas = document.getElementById('topProductsChart');
    if (!canvas) { showToast('Chart not ready yet', 'error'); return; }

    const chart = Chart.getChart(canvas);
    if (!chart) { showToast('Chart not ready yet', 'error'); return; }

    const labels = chart.data.labels;
    const values = chart.data.datasets[0].data;

    let csv = 'Product,Units Sold\n';
    labels.forEach((label, i) => {
      csv += `"${label}","${values[i]}"\n`;
    });

    downloadCSV(csv, `top_products_${today()}.csv`);
    showToast('Top products exported', 'success');
  }
};

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().split('T')[0];
}
