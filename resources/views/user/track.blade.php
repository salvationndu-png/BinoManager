@extends('layouts.modern')

@section('title', 'Track Sales - Wholesale Manager')
@section('page-title', 'Track Sales')
@section('page-subtitle', 'View sales reports and history')

@section('content')
<div class="card p-6 mb-6">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 rounded-xl grid place-items-center text-white" style="background: var(--gradient-primary);">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
    </div>
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Filter Sales Records</h2>
      <p class="text-sm text-gray-500">Select date range to view sales</p>
    </div>
  </div>

  <form id="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
      <input name="start_date" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
      <input name="end_date" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required>
    </div>

    <div class="flex items-end">
      <button type="submit" class="w-full px-4 py-3 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg" style="background: var(--gradient-primary);">
        <span class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          Filter Sales
        </span>
      </button>
    </div>
  </form>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div class="card p-6">
    <div class="flex items-center gap-3 mb-2">
      <div class="w-10 h-10 rounded-lg bg-blue-100 grid place-items-center">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      </div>
      <div>
        <div class="text-sm text-gray-500">Total Records</div>
        <div id="summaryRecords" class="text-2xl font-bold text-gray-900">—</div>
      </div>
    </div>
  </div>

  <div class="card p-6">
    <div class="flex items-center gap-3 mb-2">
      <div class="w-10 h-10 rounded-lg bg-green-100 grid place-items-center">
        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div>
        <div class="text-sm text-gray-500">Total Sales</div>
        <div id="summaryTotal" class="text-2xl font-bold text-gray-900">₦0.00</div>
      </div>
    </div>
  </div>
</div>

  <div class="card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Sales Records</h3>
      <div class="flex gap-2">
        <button id="exportBtn" onclick="exportToCSV()" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all" style="display: none;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export CSV
        </button>
        <button id="printBtn" onclick="printReport()" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all" style="display: none;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Report
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="px-3 py-3 text-left font-semibold text-gray-700">Date</th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700">Customer</th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700">Product</th>
            <th class="px-3 py-3 text-right font-semibold text-gray-700">Qty</th>
            <th class="px-3 py-3 text-right font-semibold text-gray-700">Price</th>
            <th class="px-3 py-3 text-right font-semibold text-gray-700">Total</th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700">Payment</th>
            <th class="px-3 py-3 text-left font-semibold text-gray-700">Sold By</th>
          </tr>
        </thead>

        <tbody id="salesTableBody" class="divide-y divide-gray-100">
          <tr>
            <td colspan="8" class="px-3 py-8 text-center text-gray-400">Use the filter to load sales records.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="totalAmountDisplay" class="mt-4 text-right text-gray-700 font-semibold"></div>
  </div>
</div>
@endsection

@push('scripts')
<script>
let currentSalesData = [];
let currentDateRange = { start: '', end: '' };

document.getElementById('filterForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this;
    const startDate = form.start_date.value;
    const endDate = form.end_date.value;
    currentDateRange = { start: startDate, end: endDate };

    const salesTableBody = document.getElementById('salesTableBody');
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');
    const summaryRecords = document.getElementById('summaryRecords');
    const summaryTotal = document.getElementById('summaryTotal');
    const printBtn = document.getElementById('printBtn');
    const exportBtn = document.getElementById('exportBtn');

    salesTableBody.innerHTML = `<tr><td colspan="8" class="px-3 py-8 text-center text-gray-400">Loading...</td></tr>`;
    totalAmountDisplay.textContent = '';
    printBtn.style.display = 'none';
    exportBtn.style.display = 'none';

    fetch(`/track-sales-data?start_date=${startDate}&end_date=${endDate}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentSalesData = data.sales;
                let rows = '';
                if (data.sales.length === 0) {
                    rows = `<tr><td colspan="8" class="px-3 py-8 text-center text-gray-400">No sales found for this range.</td></tr>`;
                } else {
                    data.sales.forEach(sale => {
                        const date = new Date(sale.sale_date).toISOString().split('T')[0];
                        const productName = sale.product ? sale.product.name : 'N/A';
                        const userName = sale.user ? sale.user.name : 'Unknown';
                        const customerName = sale.customer ? sale.customer.name : (sale.customer_name || '<span class="text-gray-400 text-xs">Walk-in</span>');
                        const paymentBadge = sale.payment_type === 'Credit' 
                            ? `<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">Credit</span>`
                            : `<span class="text-sm text-gray-700">${sale.payment_type}</span>`;
                        rows += `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-3 py-3 text-sm text-gray-700">${date}</td>
                                <td class="px-3 py-3 text-sm text-gray-700">${customerName}</td>
                                <td class="px-3 py-3 text-sm text-gray-900">${productName}</td>
                                <td class="px-3 py-3 text-sm text-gray-700 text-right">${sale.quantity}</td>
                                <td class="px-3 py-3 text-sm text-gray-700 text-right">₦${Number(sale.price).toLocaleString()}</td>
                                <td class="px-3 py-3 text-sm text-gray-900 font-medium text-right">₦${Number(sale.total).toLocaleString()}</td>
                                <td class="px-3 py-3">${paymentBadge}</td>
                                <td class="px-3 py-3 text-sm text-gray-700">${userName}</td>
                            </tr>`;
                    });
                    printBtn.style.display = 'inline-flex';
                    exportBtn.style.display = 'inline-flex';
                }
                salesTableBody.innerHTML = rows;
                totalAmountDisplay.textContent = `Total Sales: ₦${Number(data.totalAmount).toLocaleString()}`;
                summaryRecords.textContent = data.sales.length;
                summaryTotal.textContent = `₦${Number(data.totalAmount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
                salesTableBody.innerHTML = `<tr><td colspan="8" class="px-3 py-8 text-center text-red-500">Error fetching sales data.</td></tr>`;
            }
        })
        .catch(error => {
            console.error(error);
            salesTableBody.innerHTML = `<tr><td colspan="8" class="px-3 py-8 text-center text-red-500">Error fetching sales data.</td></tr>`;
        });
});

function printReport() {
    const summaryTotal = document.getElementById('summaryTotal').textContent;
    const printContent = `
        <html>
        <head>
            <title>Sales Report</title>
            <style>
                body { font-family: monospace; width: 80mm; margin: 0; padding: 10px; font-size: 12px; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-top: 1px dashed #000; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 2px 0; }
                .right { text-align: right; }
                .total { font-size: 14px; font-weight: bold; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="center bold" style="font-size: 16px;">WHOLESALE MANAGER</div>
            <div class="center" style="font-size: 11px;">Sales Report — Powered by 404Softwares</div>
            <div class="line"></div>
            <div class="center bold">SALES REPORT</div>
            <div style="font-size: 11px; margin: 10px 0;">Period: ${currentDateRange.start} to ${currentDateRange.end}</div>
            <div class="line"></div>
            <table>
                ${currentSalesData.map(sale => {
                    const date = new Date(sale.sale_date).toISOString().split('T')[0];
                    const productName = sale.product ? sale.product.name : 'N/A';
                    return `
                        <tr>
                            <td colspan="2">${date} - ${productName}</td>
                        </tr>
                        <tr>
                            <td>${sale.quantity} x ₦${Number(sale.price).toLocaleString()}</td>
                            <td class="right">₦${Number(sale.total).toLocaleString()}</td>
                        </tr>
                        <tr><td colspan="2" style="height: 5px;"></td></tr>
                    `;
                }).join('')}
            </table>
            <div class="line"></div>
            <div class="center total">TOTAL: ${summaryTotal}</div>
            <div class="line"></div>
            <div class="center" style="font-size: 11px; margin-top: 15px;">Generated: ${new Date().toLocaleString()}</div>
            <div class="center" style="font-size: 10px; margin-top: 5px;">Thank you!</div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function exportToCSV() {
    if (currentSalesData.length === 0) return;

    const headers = ['Date', 'Customer', 'Product', 'Quantity', 'Price', 'Total', 'Payment Type', 'Sold By'];
    const rows = currentSalesData.map(sale => [
        new Date(sale.sale_date).toISOString().split('T')[0],
        sale.customer ? sale.customer.name : (sale.customer_name || 'Walk-in'),
        sale.product ? sale.product.name : 'N/A',
        sale.quantity,
        Number(sale.price),
        Number(sale.total),
        sale.payment_type || 'Cash',
        sale.user ? sale.user.name : 'Unknown'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `sales_report_${currentDateRange.start}_to_${currentDateRange.end}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
</script>
@endpush
