import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Package, X, Warehouse, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
import { cn } from '../lib/utils';

interface Product { id: number; name: string; }
interface StockRow {
  id: number; product_id: number;
  product?: { id: number; name: string };
  quantity: number; price: number; cost_price?: number; date?: string;
}

const fmt = (n: any) => {
  const num = Number(n);
  return Number.isFinite(num) ? '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '-';
};

function Toast({ msg, type, onClose }: { msg: string; type: 'success'|'error'|'warn'; onClose: () => void }) {
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-amber-500';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm ${bg}`}>
      {type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose}><X size={16}/></button>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}/>
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 grid place-items-center flex-shrink-0">
            <AlertCircle size={20} className="text-rose-600 dark:text-rose-400"/>
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Confirm Delete</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'|'warn'}|null>(null);
  const [confirm, setConfirm] = useState<{stockId:number;name:string}|null>(null);

  // Increment modal
  const [incrModal, setIncrModal] = useState<{stockId:number;name:string;current:number}|null>(null);
  const [incrQty, setIncrQty] = useState('');
  const [incrLoading, setIncrLoading] = useState(false);

  // Price modal
  const [priceModal, setPriceModal] = useState<{stockId:number;current:number}|null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);

  // Add stock form
  const [form, setForm] = useState({ product_id: '', quantity: '', price: '', cost_price: '', date: new Date().toISOString().slice(0,10) });

  const showToast = useCallback((msg: string, type: 'success'|'error'|'warn' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadStock = useCallback(async () => {
    try {
      const d = await apiGet('/stock-list');
      setStock(d.data ?? d);
    } catch (e) { showToast('Failed to load stock', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => {
    apiGet('/products-list').then(d => setProducts(d.data ?? d)).catch(console.error);
    loadStock();
  }, [loadStock]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity || !form.price || !form.cost_price) {
      showToast('Fill all required fields', 'error'); return;
    }
    setSubmitting(true);
    try {
      const d = await apiPost('/add-stock', {
        product_id: form.product_id, quantity: form.quantity,
        price: form.price, cost_price: form.cost_price, date: form.date,
      });
      if (d.success) {
        showToast('Stock added successfully!');
        setForm({ product_id: '', quantity: '', price: '', cost_price: '', date: new Date().toISOString().slice(0,10) });
        await loadStock();
      } else { showToast(d.message ?? 'Failed to add stock', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error adding stock', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (stockId: number) => {
    try {
      const d = await apiDelete(`/delete-stock/${stockId}`);
      if (d.success) { showToast('Stock deleted'); await loadStock(); }
      else { showToast(d.message ?? 'Failed to delete', 'error'); }
    } catch { showToast('Error deleting stock', 'error'); }
    finally { setConfirm(null); }
  };

  const handleIncrement = async () => {
    if (!incrModal) return;
    const qty = Number(incrQty);
    if (!qty || qty <= 0) { showToast('Enter a valid quantity', 'error'); return; }
    setIncrLoading(true);
    try {
      const d = await apiPatch(`/update-stock/${incrModal.stockId}`, { additional_quantity: qty });
      if (d.success) { showToast('Stock updated!'); await loadStock(); setIncrModal(null); setIncrQty(''); }
      else { showToast(d.message ?? 'Failed to update', 'error'); }
    } catch { showToast('Error updating stock', 'error'); }
    finally { setIncrLoading(false); }
  };

  const handlePriceUpdate = async () => {
    if (!priceModal) return;
    if (!newPrice) { showToast('Enter a valid price', 'error'); return; }
    setPriceLoading(true);
    try {
      const d = await apiPatch(`/update-price/${priceModal.stockId}`, { price: newPrice });
      if (d.success) { showToast('Price updated!'); await loadStock(); setPriceModal(null); setNewPrice(''); }
      else { showToast(d.message ?? 'Failed to update price', 'error'); }
    } catch { showToast('Error updating price', 'error'); }
    finally { setPriceLoading(false); }
  };

  return (
    <div className="space-y-6 pb-8">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {confirm && (
        <ConfirmDialog
          message={`Delete stock entry for "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.stockId)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Increment Modal */}
      {incrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIncrModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Add Stock</h3>
              <button onClick={() => setIncrModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1"><strong>{incrModal.name}</strong></p>
            <p className="text-sm text-zinc-400 mb-4">Current quantity: <strong className="text-zinc-700 dark:text-zinc-300">{incrModal.current}</strong></p>
            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Additional Quantity</label>
              <input type="number" min="1" value={incrQty} onChange={e => setIncrQty(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"
                placeholder="e.g. 50" autoFocus/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIncrModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={handleIncrement} disabled={incrLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                {incrLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {priceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPriceModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Update Selling Price</h3>
              <button onClick={() => setPriceModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Current price: <strong className="text-zinc-700 dark:text-zinc-300">{fmt(priceModal.current)}</strong></p>
            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">New Price (₦)</label>
              <input type="number" min="0.01" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"
                placeholder="e.g. 5000" autoFocus/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPriceModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={handlePriceUpdate} disabled={priceLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                {priceLoading ? 'Saving…' : 'Update Price'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Stock Management</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Record incoming inventory and manage stock levels</p>
      </div>

      {/* Add stock form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 grid place-items-center">
            <Plus size={20} className="text-primary-600 dark:text-primary-400"/>
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Add Stock</h2>
            <p className="text-xs text-zinc-400">Record new inventory arrival</p>
          </div>
        </div>
        <form onSubmit={handleAddStock}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 lg:col-span-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Product *</label>
              <select required value={form.product_id} onChange={e => setForm(f => ({...f, product_id: e.target.value}))}
                id="productSelect"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100">
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Quantity *</label>
              <input id="quantityInput" type="number" min="1" required placeholder="e.g. 100"
                value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Selling Price (₦) *</label>
              <input id="priceInput" type="number" min="0.01" step="0.01" required placeholder="e.g. 5000"
                value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Cost Price (₦) *</label>
              <input id="costPriceInput" type="number" min="0.01" step="0.01" required placeholder="e.g. 4000"
                value={form.cost_price} onChange={e => setForm(f => ({...f, cost_price: e.target.value}))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Date *</label>
              <input id="dateInput" type="date" required
                value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={submitting} id="submitBtn"
                className="w-full py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Uploading…</span></> : <><Plus size={16}/> Add Stock</>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stock table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Warehouse size={16} className="text-zinc-400"/> Current Stock
          </h3>
          <span className="text-xs font-semibold text-zinc-400">{stock.length} entries</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>)}
          </div>
        ) : stock.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto mb-3 text-zinc-200 dark:text-zinc-700"/>
            <p className="text-sm font-medium text-zinc-400">No stock entries yet</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Add your first stock above</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                    {['#','Product','Qty','Cost Price','Selling Price','Actions'].map((h,i) => (
                      <th key={i} className={cn("px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500", h==='Actions' && 'text-center')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody id="stockTable" className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {stock.map((row, i) => (
                    <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 text-xs text-zinc-400">{i+1}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{row.product?.name ?? '-'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                          row.quantity <= 0 ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' :
                          row.quantity < 10 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                          {row.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{fmt(row.product?.cost_price ?? 0)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{fmt(row.product?.price ?? 0)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setIncrModal({stockId:row.id,name:row.product?.name??'',current:row.quantity}); }}
                            title="Add quantity"
                            className="p-2 text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                            <Plus size={15}/>
                          </button>
                          <button onClick={() => { setPriceModal({stockId:row.id,current:row.product?.price ?? 0}); setNewPrice(String(row.product?.price ?? 0)); }}
                            title="Edit price"
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Edit2 size={15}/>
                          </button>
                          <button onClick={() => setConfirm({stockId:row.id,name:row.product?.name??''})}
                            title="Delete"
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {stock.map((row) => (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm dark:text-zinc-100">{row.product?.name ?? '-'}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Sell: {fmt(row.product?.price ?? 0)} · Cost: {fmt(row.product?.cost_price ?? 0)}</p>
                    </div>
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-full",
                      row.quantity < 10 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>
                      {row.quantity} units
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIncrModal({stockId:row.id,name:row.product?.name??'',current:row.quantity})}
                      className="flex-1 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
                      + Add Stock
                    </button>
                    <button onClick={() => { setPriceModal({stockId:row.id,current:row.product?.price ?? 0}); setNewPrice(String(row.product?.price ?? 0)); }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                      Edit Price
                    </button>
                    <button onClick={() => setConfirm({stockId:row.id,name:row.product?.name??''})}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
