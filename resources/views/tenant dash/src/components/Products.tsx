import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Package, X, ScanLine, QrCode, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// ── tiny QR renderer using a public CDN (no npm install needed) ─────────────
// We generate a QR code image via the free qrserver.com API
function QRImage({ value, size = 120 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  return <img src={url} alt={value} width={size} height={size} className="rounded-lg" />;
}

// ── Barcode SVG renderer (Code-128 style visual, display only) ──────────────
function BarcodeDisplay({ value }: { value: string }) {
  // Simple visual barcode using thin/thick bars derived from char codes
  const bars = value.split('').flatMap((c) => {
    const n = c.charCodeAt(0) % 16;
    return [n % 2 === 0 ? 2 : 1, n % 3 === 0 ? 3 : 1];
  });
  const total = bars.reduce((a, b) => a + b, 0);
  let x = 0;
  return (
    <svg viewBox={`0 0 ${total} 40`} className="w-full h-10" preserveAspectRatio="none">
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? (
          <rect key={i} x={x} y={0} width={w} height={40} fill="#18181b" />
        ) : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

interface ApiProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
  cost_price: number;
  barcode: string | null;
}

type FormData = { name: string; barcode: string };

const CSRF = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export default function Products() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', barcode: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [barcodePreview, setBarcodePreview] = useState<ApiProduct | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/products-list')
      .then(r => r.json())
      .then((data: ApiProduct[]) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', barcode: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (p: ApiProduct) => {
    setEditingProduct(p);
    setFormData({ name: p.name, barcode: p.barcode ?? '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingProduct ? `/update-product/${editingProduct.id}` : '/add-product';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF(), 'Accept': 'application/json' },
        body: JSON.stringify({ name: formData.name, barcode: formData.barcode || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.message ?? 'Something went wrong.'); return; }
      setIsModalOpen(false);
      fetchProducts();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/delete-product/${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-TOKEN': CSRF(), 'Accept': 'application/json' },
    });
    fetchProducts();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight dark:text-zinc-100">Products</h1>
          <p className="text-zinc-500 mt-1 text-sm dark:text-zinc-400">Manage your product catalog and barcodes.</p>
        </div>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm dark:bg-black/60" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden dark:bg-zinc-900 dark:border dark:border-zinc-800"
            >
              <div className="p-5 border-b border-zinc-100 flex justify-between items-center dark:border-zinc-800">
                <h3 className="text-lg font-bold dark:text-zinc-100">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-lg dark:hover:bg-zinc-800 dark:text-zinc-400">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Product Name</label>
                  <input
                    required type="text" placeholder="e.g. Indomie Noodles"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 flex items-center gap-1.5">
                    <ScanLine size={12} /> Barcode / QR Code <span className="font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text" placeholder="e.g. 6001234567890"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                  />
                  {formData.barcode && (
                    <div className="mt-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 space-y-2">
                      <BarcodeDisplay value={formData.barcode} />
                      <p className="text-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{formData.barcode}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Scan with a USB/Bluetooth scanner or type manually. Used for fast sales lookup.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20">
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode / QR Preview Modal */}
      <AnimatePresence>
        {barcodePreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBarcodePreview(null)}
              className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center border border-zinc-200 dark:border-zinc-800 space-y-4"
            >
              <button onClick={() => setBarcodePreview(null)} className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:bg-zinc-100 rounded-lg dark:hover:bg-zinc-800">
                <X size={16} />
              </button>
              <p className="font-bold text-sm dark:text-zinc-100">{barcodePreview.name}</p>

              {/* QR Code */}
              <div className="flex justify-center">
                <QRImage value={barcodePreview.barcode!} size={140} />
              </div>

              {/* Barcode bars */}
              <div className="px-2">
                <BarcodeDisplay value={barcodePreview.barcode!} />
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">{barcodePreview.barcode}</p>
              </div>

              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Print or scan this code at the sales point</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 flex gap-3 dark:border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text" placeholder="Search by name or barcode..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading products...
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800">
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Product</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Barcode</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Price</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Stock</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right dark:text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm italic dark:text-zinc-600">No products found.</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors group dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 flex-shrink-0">
                            <Package size={18} />
                          </div>
                          <span className="font-medium text-sm dark:text-zinc-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.barcode ? (
                          <button
                            onClick={() => setBarcodePreview(p)}
                            className="flex items-center gap-1.5 text-xs font-mono text-primary-600 hover:text-primary-700 dark:text-primary-400 group/bc"
                          >
                            <QrCode size={14} className="flex-shrink-0" />
                            <span className="underline underline-offset-2">{p.barcode}</span>
                          </button>
                        ) : (
                          <button onClick={() => openEdit(p)} className="text-xs text-zinc-400 hover:text-primary-600 dark:text-zinc-600 dark:hover:text-primary-400 flex items-center gap-1">
                            <ScanLine size={12} /> Add barcode
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-zinc-100">₦{p.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.quantity < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className="text-sm dark:text-zinc-300">{p.quantity} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="p-2 text-zinc-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg dark:hover:bg-primary-900/20">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-900/20">
                            <Trash2 size={15} />
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
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm italic dark:text-zinc-600">No products found.</div>
              ) : filtered.map(p => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-zinc-100">{p.name}</p>
                        {p.barcode ? (
                          <button onClick={() => setBarcodePreview(p)} className="text-[11px] font-mono text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-0.5">
                            <QrCode size={11} />{p.barcode}
                          </button>
                        ) : (
                          <button onClick={() => openEdit(p)} className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <ScanLine size={11} />Add barcode
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-zinc-400 hover:text-primary-600 rounded-lg"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pl-12">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${p.quantity < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-zinc-500 dark:text-zinc-400">{p.quantity} units</span>
                    </div>
                    <span className="font-bold dark:text-zinc-100">₦{p.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-500">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
