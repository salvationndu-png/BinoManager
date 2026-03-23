import React, { useState } from 'react';
import { FileText, Search, X, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { apiGet } from '../lib/api';
import { cn } from '../lib/utils';

interface SaleRow {
  // Raw Eloquent model fields from getTrackSalesData (with product + user eager loaded)
  product?: { name: string };
  product_name?: string;       // fallback if pre-serialized
  customer_name?: string;
  customer?: { name: string };
  payment_type: string;
  sale_date: string;
  quantity: number;
  price: number;
  total: number;
  user?: { name: string };
  user_name?: string;          // fallback if pre-serialized
}

// Helper to get display values from either eager-loaded or pre-serialized shape
const productName = (s: SaleRow) => s.product?.name ?? s.product_name ?? 'Unknown';
const customerName = (s: SaleRow) => s.customer_name ?? s.customer?.name ?? 'Walk-in';
const staffName = (s: SaleRow) => s.user?.name ?? s.user_name ?? '-';

const fmt = (n: number) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [start, setStart] = useState(monthStart);
  const [end, setEnd] = useState(today);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<SaleRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/track-sales-data?start_date=${start}&end_date=${end}`);
      setData(res.sales ?? res.data ?? []);
    } catch {
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const filtered = (data ?? []).filter(s =>
    productName(s).toLowerCase().includes(search.toLowerCase()) ||
    customerName(s).toLowerCase().includes(search.toLowerCase()) ||
    (s.payment_type ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((sum, s) => sum + Number(s.total), 0);
  const totalQty = filtered.reduce((sum, s) => sum + Number(s.quantity), 0);

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Customer', 'Staff', 'Payment', 'Quantity', 'Price', 'Total'];
    const rows = filtered.map(s => [
      s.sale_date,
      productName(s),
      customerName(s),
      staffName(s),
      s.payment_type,
      s.quantity,
      s.price,
      s.total
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales-report-${start}-to-${end}.csv`;
    link.click();
  };

  // Print thermal receipt
  const printThermal = () => {
    const tenantName = window.BinoManager?.tenant?.name ?? 'BinoManager';
    const win = window.open('', '_blank', 'width=380,height=600');
    if (!win) return;
    
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:'Courier New',monospace;font-size:11px;width:300px;margin:auto;padding:10px}
      h2{text-align:center;font-size:14px;margin:0 0 4px}
      .sub{text-align:center;font-size:9px;color:#666;margin:0 0 8px}
      hr{border:1px dashed #ccc;margin:6px 0}
      table{width:100%;border-collapse:collapse;font-size:10px}
      td{padding:2px 0}
      .right{text-align:right}
      .total{font-weight:bold;font-size:12px;border-top:2px solid #000;padding-top:4px}
      .footer{text-align:center;font-size:9px;color:#888;margin-top:10px}
    </style></head><body>
    <h2>${tenantName}</h2>
    <p class="sub">Sales Report</p>
    <p class="sub">${start} to ${end}</p>
    <hr/>
    <table>
      <tr><td><b>Transactions:</b></td><td class="right">${filtered.length}</td></tr>
      <tr><td><b>Units Sold:</b></td><td class="right">${totalQty}</td></tr>
    </table>
    <hr/>
    <table>
      ${filtered.map(s => `
        <tr>
          <td colspan="2"><b>${productName(s)}</b></td>
        </tr>
        <tr>
          <td>${s.sale_date} · ${s.payment_type}</td>
          <td class="right">${fmt(Number(s.total))}</td>
        </tr>
      `).join('')}
    </table>
    <hr/>
    <table><tr class="total"><td>TOTAL REVENUE</td><td class="right">${fmt(totalRevenue)}</td></tr></table>
    <p class="footer">Generated: ${new Date().toLocaleString()}<br/>Powered by BinoManager</p>
    </body></html>`);
    
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 250);
  };

  // Download PDF (using browser print to PDF)
  const downloadPDF = () => {
    const tenantName = window.BinoManager?.tenant?.name ?? 'BinoManager';
    const win = window.open('', '_blank');
    if (!win) return;
    
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Arial,sans-serif;margin:40px;color:#333}
      h1{font-size:24px;margin:0 0 8px;color:#1a1a1a}
      .meta{font-size:12px;color:#666;margin-bottom:20px}
      .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:20px 0;padding:20px;background:#f5f5f5;border-radius:8px}
      .summary div{text-align:center}
      .summary .label{font-size:10px;text-transform:uppercase;color:#666;font-weight:bold;letter-spacing:1px}
      .summary .value{font-size:20px;font-weight:bold;color:#1a1a1a;margin-top:4px}
      table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12px}
      th{background:#1a1a1a;color:white;padding:10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px}
      td{padding:8px 10px;border-bottom:1px solid #e5e5e5}
      tr:hover{background:#f9f9f9}
      .right{text-align:right}
      .total-row{font-weight:bold;background:#f5f5f5;border-top:2px solid #1a1a1a}
      .footer{margin-top:40px;padding-top:20px;border-top:2px solid #e5e5e5;font-size:10px;color:#999;text-align:center}
    </style></head><body>
    <h1>${tenantName}</h1>
    <div class="meta">Sales Report: ${start} to ${end}<br/>Generated: ${new Date().toLocaleString()}</div>
    
    <div class="summary">
      <div><div class="label">Transactions</div><div class="value">${filtered.length}</div></div>
      <div><div class="label">Total Revenue</div><div class="value">${fmt(totalRevenue)}</div></div>
      <div><div class="label">Units Sold</div><div class="value">${totalQty}</div></div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Product</th><th>Customer</th><th>Staff</th><th>Payment</th><th class="right">Qty</th><th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(s => `
          <tr>
            <td>${s.sale_date}</td>
            <td>${productName(s)}</td>
            <td>${customerName(s)}</td>
            <td>${staffName(s)}</td>
            <td>${s.payment_type}</td>
            <td class="right">${s.quantity}</td>
            <td class="right">${fmt(Number(s.total))}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="6" class="right">TOTAL REVENUE</td>
          <td class="right">${fmt(totalRevenue)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">Powered by BinoManager</div>
    </body></html>`);
    
    win.document.close();
    setTimeout(() => win.print(), 250);
  };

  const paymentColors: Record<string, string> = {
    Cash: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Transfer: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Credit: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Sales Reports</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Filter and analyse all sales transactions</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          {[
            { label: 'Start Date', val: start, set: setStart },
            { label: 'End Date', val: end, set: setEnd },
          ].map(f => (
            <div key={f.label} className="space-y-1.5 flex-1 sm:flex-initial">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">{f.label}</label>
              <input type="date" value={f.val} onChange={e => f.set(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none" />
            </div>
          ))}
          <button onClick={load} disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20 w-full sm:w-auto">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Loading…</span></>
              : <><FileText size={16} /><span>Generate Report</span></>}
          </button>
        </div>
      </div>

      {/* Results */}
      {data !== null && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Summary strip */}
          <div className="px-4 sm:px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
            <div className="flex flex-wrap gap-2">
              <button onClick={exportCSV} disabled={filtered.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 transition-all flex-1 sm:flex-initial">
                <FileSpreadsheet size={14}/> <span className="hidden sm:inline">Export CSV</span><span className="sm:hidden">CSV</span>
              </button>
              <button onClick={printThermal} disabled={filtered.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition-all flex-1 sm:flex-initial">
                <Printer size={14}/> <span className="hidden sm:inline">Print Receipt</span><span className="sm:hidden">Print</span>
              </button>
              <button onClick={downloadPDF} disabled={filtered.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-40 transition-all flex-1 sm:flex-initial">
                <Download size={14}/> <span className="hidden sm:inline">Download PDF</span><span className="sm:hidden">PDF</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
            {[
              { label: 'Transactions', value: String(filtered.length) },
              { label: 'Total Revenue', value: fmt(totalRevenue) },
              { label: 'Units Sold', value: String(totalQty) },
            ].map(s => (
              <div key={s.label} className="px-2 sm:px-5 py-3 text-center">
                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative w-full sm:max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Filter results…"
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
                  {['Date', 'Product', 'Customer', 'Staff', 'Payment', 'Qty', 'Total'].map((h, i) => (
                    <th key={i} className={cn(
                      "px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500",
                      ['Qty', 'Total'].includes(h) ? 'text-right' : ''
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-400">
                      No records found for this period
                    </td>
                  </tr>
                ) : filtered.map((s, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{s.sale_date}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 max-w-[160px] truncate">{productName(s)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">{customerName(s)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">{staffName(s)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", paymentColors[s.payment_type] ?? 'bg-zinc-100 text-zinc-500')}>
                        {s.payment_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">{s.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-zinc-900 dark:text-zinc-100">{fmt(Number(s.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data === null && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-300 dark:text-zinc-700">
          <FileText size={48} className="mb-4" />
          <p className="text-base font-medium text-zinc-400">Select a date range and click Generate Report</p>
        </div>
      )}
    </div>
  );
}
