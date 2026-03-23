import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Package, X } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import { cn } from '../lib/utils';

interface Product { id: number; name: string; quantity: number; latestStock?: { price: number; cost_price?: number }; }

function Toast({ msg, type, onClose }: { msg:string; type:'success'|'error'; onClose:()=>void }) {
  return <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm ${type==='success'?'bg-emerald-600':'bg-rose-600'}`}>
    {type==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}<span className="flex-1">{msg}</span>
    <button onClick={onClose}><X size={16}/></button>
  </div>;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  const showToast = useCallback((msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg, type}); setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    try { const d = await apiGet('/products-list'); setProducts(d.data ?? d); }
    catch { showToast('Failed to load products', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const d = await apiPost('/add-product', { name: newName.trim() });
      if (d.success) { showToast('Product added!'); setModal(false); setNewName(''); await load(); }
      else { showToast(d.message ?? 'Failed to add product', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error adding product', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const d = await apiDelete(`/delete-product/${id}`);
      if (d.success) { showToast('Product deleted'); await load(); }
      else { showToast(d.message ?? 'Failed to delete', 'error'); }
    } catch { showToast('Error deleting product', 'error'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-8">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Add New Product</h3>
              <button onClick={() => setModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Product Name *</label>
                <input autoFocus required value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Premium Soap"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Adding…' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Products</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your product catalog</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
          <Plus size={16}/> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center"><Package size={40} className="mx-auto mb-3 text-zinc-200 dark:text-zinc-700"/><p className="text-sm text-zinc-400">No products found</p></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                {['#','Product Name','In Stock','Selling Price',''].map((h,i) => (
                  <th key={i} className={cn("px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500", h===''&&'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {filtered.map((p, i) => (
                <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-xs text-zinc-400">{i+1}</td>
                  <td className="px-5 py-3 font-semibold text-sm text-zinc-800 dark:text-zinc-200">{p.name}</td>
                  <td className="px-5 py-3">
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-full",
                      p.quantity <= 0 ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800' :
                      p.quantity < 10 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {p.latestStock?.price ? '₦' + Number(p.latestStock.price).toLocaleString('en-NG', {minimumFractionDigits:2}) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                      <Trash2 size={15}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
