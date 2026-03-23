import React, { useState } from 'react';
import { FileText, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { apiGet } from '../lib/api';
import { cn } from '../lib/utils';

const fmt = (n: number) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });
const pct = (n: number) => n.toFixed(1) + '%';

interface FinancialData {
  period: { start: string; end: string };
  profit_loss: {
    revenue: number; cogs: number; gross_profit: number;
    net_profit: number; gross_margin: number;
  };
  cash_flow: {
    cash_inflow: number; credit_inflow: number; stock_outflow: number;
    net_cash_flow: number;
    by_payment: { cash: number; transfer: number; credit: number };
    monthly: { month: string; cash: number; transfer: number; credit: number; total: number }[];
  };
  balance_sheet: {
    assets: { inventory: number; accounts_receivable: number; total: number };
    liabilities: { total: number };
    equity: { retained_earnings: number };
  };
  summary: { total_transactions: number; total_revenue: number; net_profit: number; gross_margin: number };
}

type Tab = 'pl' | 'cashflow' | 'balance';

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className={cn("text-xl font-bold mt-1", positive === true ? 'text-emerald-600' : positive === false ? 'text-rose-600' : 'text-zinc-900 dark:text-zinc-100')}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Row({ label, value, bold, indent, positive, border }: { label: string; value: number; bold?: boolean; indent?: boolean; positive?: boolean; border?: boolean }) {
  const isPos = positive !== undefined ? positive : value >= 0;
  return (
    <div className={cn("flex justify-between items-center py-2.5 px-4", bold ? 'bg-zinc-50 dark:bg-zinc-800/60' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20', border && 'border-t-2 border-zinc-200 dark:border-zinc-700')}>
      <span className={cn("text-sm dark:text-zinc-300", bold ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-600', indent && 'pl-4')}>{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", bold ? 'text-zinc-900 dark:text-zinc-100 font-bold' : isPos ? 'text-zinc-800 dark:text-zinc-200' : 'text-rose-600')}>{fmt(value)}</span>
    </div>
  );
}

function generatePDF(data: FinancialData, tenantName: string) {
  const { profit_loss: pl, cash_flow: cf, balance_sheet: bs, period } = data;
  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Financial Statements — ${tenantName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:40px;max-width:800px;margin:auto}
    .header{border-bottom:3px solid #1a1a1a;padding-bottom:16px;margin-bottom:24px}
    .header h1{font-size:22px;font-weight:800;letter-spacing:-0.5px}
    .header .sub{font-size:11px;color:#666;margin-top:4px}
    .badge{display:inline-block;background:#2563eb;color:white;font-size:9px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;margin-top:6px}
    .section{margin-bottom:32px}
    .section-title{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#2563eb;border-bottom:1px solid #e5e5e5;padding-bottom:6px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse}
    td{padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:11px}
    td:last-child{text-align:right;font-weight:600;font-variant-numeric:tabular-nums}
    .bold td{font-weight:800;background:#f8f8f8;font-size:12px}
    .total td{font-weight:800;background:#1a1a1a;color:white;font-size:12px;border-bottom:none}
    .positive{color:#059669}
    .negative{color:#dc2626}
    .indent td:first-child{padding-left:24px;color:#555}
    .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}
    .summary-card{background:#f8f8f8;border-radius:6px;padding:12px;text-align:center}
    .summary-card .lbl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:700}
    .summary-card .val{font-size:16px;font-weight:800;margin-top:4px;color:#1a1a1a}
    .footer{margin-top:40px;padding-top:16px;border-top:2px solid #e5e5e5;font-size:9px;color:#999;text-align:center}
    .disclaimer{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:10px 14px;font-size:10px;color:#92400e;margin-top:24px}
    @media print{body{padding:20px}.disclaimer{break-inside:avoid}}
  </style></head><body>
  <div class="header">
    <h1>${tenantName}</h1>
    <div class="sub">Financial Statements &nbsp;|&nbsp; Period: ${period.start} to ${period.end}</div>
    <div class="sub">Generated: ${new Date().toLocaleString('en-NG')}</div>
    <span class="badge">Prepared by BinoManager</span>
  </div>

  <div class="summary-grid">
    <div class="summary-card"><div class="lbl">Total Revenue</div><div class="val">${fmt(pl.revenue)}</div></div>
    <div class="summary-card"><div class="lbl">Gross Profit</div><div class="val ${pl.gross_profit >= 0 ? 'positive' : 'negative'}">${fmt(pl.gross_profit)}</div></div>
    <div class="summary-card"><div class="lbl">Net Profit</div><div class="val ${pl.net_profit >= 0 ? 'positive' : 'negative'}">${fmt(pl.net_profit)}</div></div>
    <div class="summary-card"><div class="lbl">Gross Margin</div><div class="val">${pct(pl.gross_margin)}</div></div>
  </div>

  <div class="section">
    <div class="section-title">Profit &amp; Loss Statement</div>
    <table>
      <tr><td>Revenue from Sales</td><td>${fmt(pl.revenue)}</td></tr>
      <tr class="indent"><td>Cost of Goods Sold (COGS)</td><td>(${fmt(pl.cogs)})</td></tr>
      <tr class="bold"><td>Gross Profit</td><td class="${pl.gross_profit >= 0 ? 'positive' : 'negative'}">${fmt(pl.gross_profit)}</td></tr>
      <tr class="indent"><td>Operating Expenses</td><td>-</td></tr>
      <tr class="total"><td>Net Profit / (Loss)</td><td>${fmt(pl.net_profit)}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Cash Flow Statement</div>
    <table>
      <tr><td colspan="2"><strong>Operating Activities</strong></td></tr>
      <tr class="indent"><td>Cash Sales</td><td>${fmt(cf.by_payment.cash)}</td></tr>
      <tr class="indent"><td>Transfer Sales</td><td>${fmt(cf.by_payment.transfer)}</td></tr>
      <tr class="indent"><td>Credit Sales (not yet received)</td><td>${fmt(cf.by_payment.credit)}</td></tr>
      <tr class="bold"><td>Total Cash Inflow</td><td>${fmt(cf.cash_inflow)}</td></tr>
      <tr><td colspan="2"><strong>Investing / Purchasing Activities</strong></td></tr>
      <tr class="indent"><td>Stock Purchases</td><td>(${fmt(cf.stock_outflow)})</td></tr>
      <tr class="total"><td>Net Cash Flow</td><td class="${cf.net_cash_flow >= 0 ? 'positive' : 'negative'}">${fmt(cf.net_cash_flow)}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Balance Sheet</div>
    <table>
      <tr><td colspan="2"><strong>Assets</strong></td></tr>
      <tr class="indent"><td>Inventory (at cost)</td><td>${fmt(bs.assets.inventory)}</td></tr>
      <tr class="indent"><td>Accounts Receivable (Credit Sales)</td><td>${fmt(bs.assets.accounts_receivable)}</td></tr>
      <tr class="bold"><td>Total Assets</td><td>${fmt(bs.assets.total)}</td></tr>
      <tr><td colspan="2"><strong>Liabilities</strong></td></tr>
      <tr class="indent"><td>Total Liabilities</td><td>${fmt(bs.liabilities.total)}</td></tr>
      <tr><td colspan="2"><strong>Equity</strong></td></tr>
      <tr class="indent"><td>Retained Earnings</td><td>${fmt(bs.equity.retained_earnings)}</td></tr>
      <tr class="total"><td>Total Liabilities + Equity</td><td>${fmt(bs.assets.total)}</td></tr>
    </table>
  </div>

  <div class="disclaimer">
    <strong>Note:</strong> These financial statements are generated from sales and inventory data recorded in BinoManager.
    They are intended as management accounts to support business decisions and loan/grant applications.
    For statutory filing purposes, please have these reviewed by a certified accountant.
  </div>

  <div class="footer">
    ${tenantName} &nbsp;|&nbsp; Powered by BinoManager &nbsp;|&nbsp; ${new Date().getFullYear()}
  </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

export default function Financials() {
  const today = new Date().toISOString().slice(0, 10);
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const [start, setStart] = useState(yearStart);
  const [end, setEnd] = useState(today);
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('pl');
  const tenantName = window.BinoManager?.tenant?.name ?? 'BinoManager';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiGet(`/api/financials?start=${start}&end=${end}`);
      setData(res);
    } catch {
      setError('Failed to load financial data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pl',       label: 'Profit & Loss' },
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'balance',  label: 'Balance Sheet' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Financial Statements</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">P&amp;L, Cash Flow &amp; Balance Sheet - ready for bank or tax use</p>
        </div>
        {data && (
          <button onClick={() => generatePDF(data, tenantName)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all w-full sm:w-auto sm:whitespace-nowrap">
            <Download size={15}/> Export PDF
          </button>
        )}
      </div>

      {/* Date filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
        <div className="flex flex-col gap-3">
          {/* Date inputs */}
          <div className="flex flex-col sm:flex-row gap-3">
            {[{ label: 'From', val: start, set: setStart }, { label: 'To', val: end, set: setEnd }].map(f => (
              <div key={f.label} className="space-y-1 flex-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{f.label}</label>
                <input type="date" value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none"/>
              </div>
            ))}
          </div>
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'This Year',  s: yearStart, e: today },
              { label: 'This Month', s: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10), e: today },
              { label: 'Last Month', s: new Date(new Date().getFullYear(), new Date().getMonth()-1, 1).toISOString().slice(0,10),
                e: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().slice(0,10) },
            ].map(p => (
              <button key={p.label} onClick={() => { setStart(p.s); setEnd(p.e); }}
                className="px-3 py-2 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex-1 sm:flex-initial">
                {p.label}
              </button>
            ))}
          </div>
          
          {/* Generate button */}
          <button onClick={load} disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20 w-full sm:w-auto sm:self-end">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Loading…</span></>
              : <><RefreshCw size={14}/><span>Generate</span></>}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle size={16}/> {error}
        </div>
      )}

      {!data && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-300 dark:text-zinc-700">
          <FileText size={48} className="mb-4"/>
          <p className="text-base font-medium text-zinc-400">Select a period and click Generate</p>
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Revenue" value={fmt(data.summary.total_revenue)}
              sub={`${data.summary.total_transactions} transactions`}/>
            <StatCard label="Gross Profit" value={fmt(data.profit_loss.gross_profit)}
              sub={`Margin: ${pct(data.profit_loss.gross_margin)}`}
              positive={data.profit_loss.gross_profit >= 0}/>
            <StatCard label="Net Profit" value={fmt(data.summary.net_profit)}
              positive={data.summary.net_profit >= 0}/>
            <StatCard label="Net Cash Flow" value={fmt(data.cash_flow.net_cash_flow)}
              sub="Cash + Transfer − Stock"
              positive={data.cash_flow.net_cash_flow >= 0}/>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row border-b border-zinc-100 dark:border-zinc-800">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn("flex-1 py-3 text-xs sm:text-sm font-semibold transition-all",
                    tab === t.id
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200')}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {/* P&L */}
              {tab === 'pl' && (
                <>
                  <div className="px-4 py-3 bg-zinc-50/60 dark:bg-zinc-800/30">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Profit &amp; Loss Statement &nbsp;·&nbsp; {data.period.start} to {data.period.end}</p>
                  </div>
                  <Row label="Revenue from Sales" value={data.profit_loss.revenue}/>
                  <Row label="Cost of Goods Sold (COGS)" value={-data.profit_loss.cogs} indent positive={false}/>
                  <Row label="Gross Profit" value={data.profit_loss.gross_profit} bold border
                    positive={data.profit_loss.gross_profit >= 0}/>
                  <Row label="Operating Expenses" value={0} indent/>
                  <Row label="Net Profit / (Loss)" value={data.profit_loss.net_profit} bold border
                    positive={data.profit_loss.net_profit >= 0}/>
                  <div className="px-4 py-3 bg-zinc-50/40 dark:bg-zinc-800/20">
                    <p className="text-xs text-zinc-400">Gross Margin: <strong className="text-zinc-700 dark:text-zinc-300">{pct(data.profit_loss.gross_margin)}</strong></p>
                  </div>
                </>
              )}

              {/* Cash Flow */}
              {tab === 'cashflow' && (
                <>
                  <div className="px-4 py-3 bg-zinc-50/60 dark:bg-zinc-800/30">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cash Flow Statement &nbsp;·&nbsp; {data.period.start} to {data.period.end}</p>
                  </div>
                  <div className="px-4 py-2.5"><p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Inflows</p></div>
                  <Row label="Cash Sales" value={data.cash_flow.by_payment.cash} indent/>
                  <Row label="Transfer Sales" value={data.cash_flow.by_payment.transfer} indent/>
                  <Row label="Credit Sales (receivable)" value={data.cash_flow.by_payment.credit} indent/>
                  <Row label="Total Inflow" value={data.cash_flow.cash_inflow + data.cash_flow.credit_inflow} bold/>
                  <div className="px-4 py-2.5"><p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Outflows</p></div>
                  <Row label="Stock Purchases" value={-data.cash_flow.stock_outflow} indent positive={false}/>
                  <Row label="Net Cash Flow" value={data.cash_flow.net_cash_flow} bold border
                    positive={data.cash_flow.net_cash_flow >= 0}/>

                  {/* Monthly breakdown */}
                  {data.cash_flow.monthly.length > 0 && (
                    <>
                      <div className="px-4 py-3 bg-zinc-50/60 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Monthly Breakdown</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800">
                              {['Month','Cash','Transfer','Credit','Total'].map(h => (
                                <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right first:text-left">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {data.cash_flow.monthly.map(m => (
                              <tr key={m.month} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                                <td className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">{m.month}</td>
                                <td className="px-4 py-2.5 text-sm text-right text-zinc-600 dark:text-zinc-400">{fmt(m.cash)}</td>
                                <td className="px-4 py-2.5 text-sm text-right text-zinc-600 dark:text-zinc-400">{fmt(m.transfer)}</td>
                                <td className="px-4 py-2.5 text-sm text-right text-zinc-600 dark:text-zinc-400">{fmt(m.credit)}</td>
                                <td className="px-4 py-2.5 text-sm text-right font-bold text-zinc-900 dark:text-zinc-100">{fmt(m.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Balance Sheet */}
              {tab === 'balance' && (
                <>
                  <div className="px-4 py-3 bg-zinc-50/60 dark:bg-zinc-800/30">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Balance Sheet &nbsp;·&nbsp; As at {data.period.end}</p>
                  </div>
                  <div className="px-4 py-2.5"><p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Assets</p></div>
                  <Row label="Inventory (at cost)" value={data.balance_sheet.assets.inventory} indent/>
                  <Row label="Accounts Receivable (Credit Sales)" value={data.balance_sheet.assets.accounts_receivable} indent/>
                  <Row label="Total Assets" value={data.balance_sheet.assets.total} bold border/>
                  <div className="px-4 py-2.5"><p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Liabilities</p></div>
                  <Row label="Total Liabilities" value={data.balance_sheet.liabilities.total} indent/>
                  <div className="px-4 py-2.5"><p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Equity</p></div>
                  <Row label="Retained Earnings" value={data.balance_sheet.equity.retained_earnings} indent/>
                  <Row label="Total Liabilities + Equity" value={data.balance_sheet.assets.total} bold border/>
                  <div className="px-4 py-3 bg-amber-50/60 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      <strong>Note:</strong> This balance sheet reflects inventory and receivables tracked in BinoManager.
                      Fixed assets, cash on hand, and external liabilities are not included.
                      For a complete balance sheet, consult your accountant.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
