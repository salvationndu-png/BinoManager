import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Package, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ScanLine, QrCode } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '../lib/api';
import { cn } from '../lib/utils';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  cost_price: number;
  barcode?: string | null;
}

interface StockRow {
  id: number;
  product_id: number;
  quantity: number;
  date?: string;
}

const fmt = (n: any) => {
  const num = Number(n);
  return Number.isFinite(num) ? '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '-';
};

function Toast({ msg, type, onClose }: { msg: string; type: 'success'|'error'; onClose: () => void }) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm ${type==='success'?'bg-emerald-600':'bg-rose-600'}`}>
      {type==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose}><X size={16}/></button>
    </div>
  );
}

// Simple visual barcode bars (display only)
function BarcodeDisplay({ value }: { value: string }) {
  const bars = value.split('').flatMap(c => {
    const n = c.charCodeAt(0) % 16;
    return [n % 2 === 0 ? 2 : 1, n % 3 === 0 ? 3 : 1];
  });
  const total = bars.reduce((a, b) => a + b, 0);
  let x = 0;
  return (
    <svg viewBox={`0 0 ${total} 40`} className="w-full h-10" preserveAspectRatio="none">
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} fill="#18181b" /> : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

function QRImage({ value }: { value: string }) {
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(value)}`} alt={value} width={140} height={140} className="rounded-lg mx-auto" />;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<number, StockRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  // Add product modal
  const [productModal, setProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [initialQty, setInitialQty] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [initialCost, setInitialCost] = useState('');
  const [initialDate, setInitialDate] = useState(new Date().toISOString().slice(0,10));
  const [submitting, setSubmitting] = useState(false);

  // Edit barcode modal
  const [editBarcodeModal, setEditBarcodeModal] = useState<{id:number;name:string;barcode:string}|null>(null);
  const [editBarcodeVal, setEditBarcodeVal] = useState('');

  // Barcode preview modal
  const [barcodePreview, setBarcodePreview] = useState<Product|null>(null);

  // Top-up modal
  const [topUpModal, setTopUpModal] = useState<{productId:number;name:string;currentStock:number}|null>(null);
  const [topUpQty, setTopUpQty] = useState('');

  // Edit price modal
  const [editProductPriceModal, setEditProductPriceModal] = useState<{productId:number;name:string;currentPrice:number}|null>(null);
  const [editProductPrice, setEditProductPrice] = useState('');

  const showToast = useCallback((msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const d = await apiGet('/inventory-products');
      setProducts(d.data ?? d);
    } catch { showToast('Failed to load products', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  const loadStockForProduct = useCallback(async (productId: number) => {
    try {
      const d = await apiGet('/stock-list');
      // Handle paginated response
      const allStock = d.data?.data ?? d.data ?? d;
      const filtered = allStock.filter((s: any) => s.product_id === productId);
      setStockByProduct(prev => ({ ...prev, [productId]: filtered }));
    } catch { showToast('Failed to load stock', 'error'); }
  }, [showToast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !initialQty || !initialPrice || !initialCost) {
      showToast('All fields are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const d = await apiPost('/add-product', { name: newProductName.trim(), barcode: newProductBarcode.trim() || null });
      if (d.success) {
        const productId = d.product?.id;
        if (productId) {
          await apiPost('/add-stock', {
            product_id: productId,
            quantity: initialQty,
            price: initialPrice,
            cost_price: initialCost,
            date: initialDate
          });
          showToast('Product and stock added successfully!');
        }
        setProductModal(false);
        setNewProductName(''); setNewProductBarcode(''); setInitialQty(''); setInitialPrice(''); setInitialCost(''); setInitialDate(new Date().toISOString().slice(0,10));
        await loadProducts();
      } else { showToast(d.message ?? 'Failed to add product', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error adding product', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleEditBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBarcodeModal) return;
    setSubmitting(true);
    try {
      const d = await apiPut(`/update-product/${editBarcodeModal.id}`, {
        name: editBarcodeModal.name,
        barcode: editBarcodeVal.trim() || null });
      if (d.success) {
        showToast('Barcode updated!');
        setEditBarcodeModal(null);
        setEditBarcodeVal('');
        await loadProducts();
      } else { showToast(d.message ?? 'Failed to update barcode', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error updating barcode', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all stock entries. This cannot be undone.`)) return;
    try {
      const d = await apiDelete(`/delete-product/${id}`);
      if (d.success) { showToast('Product deleted'); await loadProducts(); }
      else { showToast(d.message ?? 'Failed to delete', 'error'); }
    } catch { showToast('Error deleting product', 'error'); }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpModal || !topUpQty) {
      showToast('Enter a valid quantity', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Top-up only sends quantity, backend uses product's existing prices
      const d = await apiPost('/add-stock', {
        product_id: topUpModal.productId,
        quantity: topUpQty,
        date: new Date().toISOString().slice(0,10)
        // No price or cost_price - backend will use product's current prices
      });
      
      if (d.success) {
        showToast('Stock topped up!');
        setTopUpModal(null);
        setTopUpQty('');
        await loadProducts();
        if (expandedProduct === topUpModal.productId) await loadStockForProduct(topUpModal.productId);
      } else { showToast(d.message ?? 'Failed to top up', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error topping up stock', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteStock = async (stockId: number, productId: number) => {
    if (!confirm('Delete this stock entry? This cannot be undone.')) return;
    try {
      const d = await apiDelete(`/delete-stock/${stockId}`);
      if (d.success) {
        showToast('Stock deleted');
        await loadProducts();
        await loadStockForProduct(productId);
      } else { showToast(d.message ?? 'Failed to delete', 'error'); }
    } catch { showToast('Error deleting stock', 'error'); }
  };

  const handleEditProductPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductPriceModal || !editProductPrice) {
      showToast('Enter a valid price', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Update product price directly
      const product = products.find(p => p.id === editProductPriceModal.productId);
      if (!product) {
        showToast('Product not found', 'error');
        setSubmitting(false);
        return;
      }
      
      // Get latest stock entry to update
      const d = await apiGet('/stock-list');
      const allStock = d.data?.data ?? d.data ?? d;
      const productStocks = allStock.filter((s: any) => s.product_id === editProductPriceModal.productId);
      
      if (productStocks.length === 0) {
        showToast('No stock entries found', 'error');
        setSubmitting(false);
        return;
      }
      
      const latestStock = productStocks[productStocks.length - 1];
      const d2 = await apiPatch(`/update-price/${latestStock.id}`, { price: editProductPrice });
      
      if (d2.success) {
        showToast('Price updated!');
        setEditProductPriceModal(null);
        setEditProductPrice('');
        await loadProducts();
        if (expandedProduct === editProductPriceModal.productId) await loadStockForProduct(editProductPriceModal.productId);
      } else { showToast(d2.message ?? 'Failed to update price', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error updating price', 'error'); }
    finally { setSubmitting(false); }
  };

  const toggleExpand = (productId: number) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
      if (!stockByProduct[productId]) loadStockForProduct(productId);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-8">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* Add Product Modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProductModal(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Add New Product</h3>
              <button onClick={() => setProductModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Product Name *</label>
                <input autoFocus required value={newProductName} onChange={e => setNewProductName(e.target.value)}
                  placeholder="e.g. Premium Soap"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400 flex items-center gap-1.5">
                  <ScanLine size={12}/> Barcode / QR Code <span className="font-normal normal-case text-zinc-400">(optional)</span>
                </label>
                <input value={newProductBarcode} onChange={e => setNewProductBarcode(e.target.value)}
                  placeholder="e.g. 6001234567890"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                {newProductBarcode && (
                  <div className="mt-1 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <BarcodeDisplay value={newProductBarcode}/>
                    <p className="text-center text-[10px] font-mono text-zinc-400 mt-1">{newProductBarcode}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 dark:text-zinc-400">Initial Stock *</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">Quantity *</label>
                    <input type="number" min="1" required value={initialQty} onChange={e => setInitialQty(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">Date *</label>
                    <input type="date" required value={initialDate} onChange={e => setInitialDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">Selling Price (₦) *</label>
                    <input type="number" min="0.01" step="0.01" required value={initialPrice} onChange={e => setInitialPrice(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">Cost Price (₦) *</label>
                    <input type="number" min="0.01" step="0.01" required value={initialCost} onChange={e => setInitialCost(e.target.value)}
                      placeholder="4000"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setProductModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Adding…' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top-Up Modal (Quantity Only) */}
      {topUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTopUpModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Top Up Stock</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{topUpModal.name}</p>
              </div>
              <button onClick={() => setTopUpModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 mb-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Stock</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{topUpModal.currentStock} <span className="text-sm font-normal text-zinc-400">units</span></p>
            </div>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Add Quantity *</label>
                <input autoFocus type="number" min="1" required value={topUpQty} onChange={e => setTopUpQty(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                <p className="text-xs text-zinc-400">New total: {topUpModal.currentStock + (Number(topUpQty) || 0)} units</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setTopUpModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Adding…' : 'Top Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Price Modal */}
      {editProductPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditProductPriceModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Edit Selling Price</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{editProductPriceModal.name}</p>
              </div>
              <button onClick={() => setEditProductPriceModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Current: <strong className="text-zinc-700 dark:text-zinc-300">{fmt(editProductPriceModal.currentPrice)}</strong></p>
            <form onSubmit={handleEditProductPrice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">New Selling Price (₦) *</label>
                <input autoFocus type="number" min="0.01" step="0.01" required value={editProductPrice} onChange={e => setEditProductPrice(e.target.value)}
                  placeholder="5000"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditProductPriceModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Saving…' : 'Update Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Barcode Modal */}
      {editBarcodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditBarcodeModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Set Barcode</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{editBarcodeModal.name}</p>
              </div>
              <button onClick={() => setEditBarcodeModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleEditBarcode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Barcode / QR Code</label>
                <input autoFocus value={editBarcodeVal} onChange={e => setEditBarcodeVal(e.target.value)}
                  placeholder="Scan or type barcode…"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                {editBarcodeVal && (
                  <div className="mt-1 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <BarcodeDisplay value={editBarcodeVal}/>
                    <p className="text-center text-[10px] font-mono text-zinc-400 mt-1">{editBarcodeVal}</p>
                  </div>
                )}
                <p className="text-[11px] text-zinc-400">Plug in a USB barcode scanner and scan the product, or type manually.</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditBarcodeModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Saving…' : 'Save Barcode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Preview Modal */}
      {barcodePreview && barcodePreview.barcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBarcodePreview(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center space-y-4">
            <button onClick={() => setBarcodePreview(null)} className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><X size={16}/></button>
            <p className="font-bold text-sm dark:text-zinc-100">{barcodePreview.name}</p>
            <QRImage value={barcodePreview.barcode}/>
            <div className="px-2">
              <BarcodeDisplay value={barcodePreview.barcode}/>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">{barcodePreview.barcode}</p>
            </div>
            <button
              onClick={() => { setEditBarcodeModal({id: barcodePreview.id, name: barcodePreview.name, barcode: barcodePreview.barcode!}); setEditBarcodeVal(barcodePreview.barcode!); setBarcodePreview(null); }}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >Edit barcode</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Inventory Management</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage products and stock in one place</p>
        </div>
        <button onClick={() => setProductModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
          <Plus size={16}/> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center"><Package size={40} className="mx-auto mb-3 text-zinc-200 dark:text-zinc-700"/><p className="text-sm text-zinc-400">No products found</p></div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((p) => {
              const isExpanded = expandedProduct === p.id;
              const stock = stockByProduct[p.id] || [];
              return (
                <div key={p.id}>
                  {/* Product Row */}
                  <div className="flex items-start gap-3 p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <button onClick={() => toggleExpand(p.id)} className="p-1.5 mt-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg flex-shrink-0">
                      {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">{p.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <p className="text-xs text-zinc-400">
                          Stock: <span className={cn("font-bold", p.quantity <= 0 ? 'text-zinc-400' : p.quantity < 10 ? 'text-amber-600' : 'text-emerald-600')}>{p.quantity}</span>
                          {p.price > 0 && <> · Sell: {fmt(p.price)}</>}
                        </p>
                        {p.barcode ? (
                          <button onClick={() => setBarcodePreview(p)} className="flex items-center gap-1 text-[11px] font-mono text-primary-600 dark:text-primary-400 hover:underline">
                            <QrCode size={11}/>{p.barcode}
                          </button>
                        ) : (
                          <button onClick={() => { setEditBarcodeModal({id: p.id, name: p.name, barcode: ''}); setEditBarcodeVal(''); }} className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400">
                            <ScanLine size={11}/> Add barcode
                          </button>
                        )}
                      </div>
                      {/* Actions — inline on sm+, stacked below on mobile */}
                      <div className="flex items-center gap-2 mt-2 sm:hidden">
                        <button onClick={() => setTopUpModal({productId: p.id, name: p.name, currentStock: p.quantity})} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                          + Top Up
                        </button>
                        <button onClick={() => { setEditProductPriceModal({productId: p.id, name: p.name, currentPrice: p.price || 0}); setEditProductPrice(String(p.price || '')); }} className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                          Edit Price
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    {/* Actions — hidden on mobile, shown on sm+ */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setTopUpModal({productId: p.id, name: p.name, currentStock: p.quantity})} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                        + Top Up
                      </button>
                      <button onClick={() => { setEditProductPriceModal({productId: p.id, name: p.name, currentPrice: p.price || 0}); setEditProductPrice(String(p.price || '')); }} className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        Edit Price
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Stock History */}
                  {isExpanded && (
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 p-4">
                      {stock.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-4">No stock entries yet</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 dark:text-zinc-400">Stock Top-Up History</p>
                          <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 mb-3">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Current Prices</p>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300">Selling: <span className="font-bold">{fmt(p.price)}</span> · Cost: <span className="font-bold">{fmt(p.cost_price)}</span></p>
                          </div>
                          <div className="space-y-2">
                            {stock.map((s) => (
                              <div key={s.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-3 text-sm">
                                <div className="flex-1">
                                  <p className="text-zinc-700 dark:text-zinc-300">
                                    <span className="font-bold">+{s.quantity}</span> units added
                                    {s.date && <span className="text-zinc-400 ml-2">· {new Date(s.date).toLocaleDateString()}</span>}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleDeleteStock(s.id, p.id)}
                                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    <Trash2 size={14}/>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
