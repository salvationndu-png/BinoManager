import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, X, CheckCircle2, AlertCircle, DollarSign, CreditCard, Banknote, RotateCcw, ScanLine, Camera, Keyboard } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';
import { openWhatsAppReceipt } from '../lib/whatsapp';
import { cn } from '../lib/utils';

interface Product { id: number; name: string; quantity: number; price: number; cost_price: number; barcode?: string | null; }
interface Customer { id: number; name: string; business_name?: string; credit_limit: number; outstanding_balance: number; }
interface CartItem { productId: number; name: string; price: number; quantity: number; available: number; }

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2 });

// ── Camera scanner modal (only shown when user explicitly clicks Scan) ─────
function CameraScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (mode !== 'camera') { stopCamera(); return; }
    // @ts-ignore
    if (!('BarcodeDetector' in window)) {
      setMode('manual');
      return;
    }
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        // @ts-ignore
        const detector = new BarcodeDetector({ formats: ['ean_13','ean_8','code_128','code_39','qr_code','upc_a','upc_e'] });
        const scan = async () => {
          if (!active || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) { stopCamera(); onDetected(codes[0].rawValue); return; }
          } catch {}
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      })
      .catch(() => { if (active) { setError('Camera access denied.'); setMode('manual'); } });
    return () => { active = false; stopCamera(); };
  }, [mode, onDetected, stopCamera]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-primary-600"/>
            <span className="font-bold text-sm dark:text-zinc-100">Camera Scan</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMode(m => m === 'camera' ? 'manual' : 'camera')}
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium">
              {mode === 'camera' ? <Keyboard size={15}/> : <Camera size={15}/>}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={15}/></button>
          </div>
        </div>
        {mode === 'camera' ? (
          <div className="relative bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-52 object-cover"/>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-44 h-24 border-2 border-primary-400 rounded-lg"/>
            </div>
            {error && <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-xs p-2 text-center">{error}</div>}
            <p className="text-center text-xs text-zinc-400 py-2 bg-white dark:bg-zinc-900">Point camera at barcode or QR code</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Type or paste the barcode number below.</p>
            <input autoFocus type="text" placeholder="e.g. 6001234567890"
              value={manualCode} onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && manualCode.trim()) onDetected(manualCode.trim()); }}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
            <button disabled={!manualCode.trim()} onClick={() => onDetected(manualCode.trim())}
              className="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50">
              Lookup Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function printReceipt(items: CartItem[], total: number, paymentType: string, customerName: string, tenantName: string) {
  const win = window.open('', '_blank', 'width=380,height=600');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{font-family:'Courier New',monospace;font-size:12px;width:300px;margin:auto;padding:10px}
    h2{text-align:center;font-size:16px;margin:0 0 4px}
    .sub{text-align:center;font-size:10px;color:#666;margin:0 0 12px}
    hr{border:1px dashed #ccc;margin:8px 0}
    table{width:100%;border-collapse:collapse}
    td{padding:2px 0}
    .right{text-align:right}
    .total{font-weight:bold;font-size:14px;border-top:2px solid #000;padding-top:4px}
    .footer{text-align:center;font-size:10px;color:#888;margin-top:12px}
  </style></head><body>
  <h2>${tenantName}</h2>
  <p class="sub">${new Date().toLocaleString()}</p>
  <hr/>
  ${customerName ? `<p>Customer: ${customerName}</p>` : ''}
  <p>Payment: ${paymentType}</p>
  <hr/>
  <table>
    <tr><td><b>Item</b></td><td><b>Qty</b></td><td class="right"><b>Total</b></td></tr>
    ${items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td class="right">${fmt(i.price * i.quantity)}</td></tr>`).join('')}
  </table>
  <hr/>
  <table><tr class="total"><td>TOTAL</td><td class="right">${fmt(total)}</td></tr></table>
  <p class="footer">Thank you for your business!<br/>Powered by BinoManager</p>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); win.close(); }, 250);
}

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [paymentType, setPaymentType] = useState<'Cash' | 'Transfer' | 'Credit'>('Cash');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0,10));
  const [submitting, setSubmitting] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lastSale, setLastSale] = useState<{ items: CartItem[]; total: number; paymentType: string; customerName: string; customerPhone: string } | null>(null);
  const tenantName = window.BinoManager?.tenant?.name ?? 'BinoManager';

  // ── USB / Bluetooth scanner listener ───────────────────────────────────────
  // A hardware scanner types characters very fast then sends Enter.
  // We capture that globally so the cashier never needs to click anything.
  const handleBarcodeDetected = useCallback(async (code: string) => {
    setCameraOpen(false);
    const local = products.find(p => p.barcode === code);
    const pushToCart = (prod: Product) => {
      setCart(prev => {
        const existing = prev.find(i => i.productId === prod.id);
        if (existing) return prev.map(i => i.productId === prod.id
          ? { ...i, quantity: Math.min(i.quantity + 1, i.available) } : i);
        return [...prev, { productId: prod.id, name: prod.name, price: prod.price, quantity: 1, available: prod.quantity }];
      });
      showToast(`✓ ${prod.name} added`);
    };
    if (local) { pushToCart(local); return; }
    try {
      const d = await apiGet(`/products/barcode/${encodeURIComponent(code)}`);
      if (!d.success) { showToast(`No product found for barcode: ${code}`, 'error'); return; }
      const p = d.product as Product;
      pushToCart(p);
      setProducts(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? { ...x, ...p } : x) : [...prev, p]);
    } catch { showToast('Barcode lookup failed.', 'error'); }
  }, [products]);

  const showToast = useCallback((msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    Promise.all([
      apiGet('/products-list').then(d => setProducts(d.data ?? d)),
      apiGet('/customers-for-sales').then(setCustomers),
    ]).catch(console.error);
  }, []);

  const handleProductChange = async (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;
    setLoadingPrice(true);
    try {
      const d = await apiGet(`/get-product-details/${productId}`);
      if (d.success) setProducts(prev => prev.map(p => p.id === +productId ? { ...p, quantity: d.quantity, price: d.price } : p));
    } catch {}
    finally { setLoadingPrice(false); }
  };

  const addToCart = () => {
    const prod = products.find(p => p.id === +selectedProductId);
    if (!prod) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === prod.id);
      if (existing) return prev.map(i => i.productId === prod.id ? { ...i, quantity: Math.min(i.quantity + 1, i.available) } : i);
      return [...prev, { productId: prod.id, name: prod.name, price: prod.price, quantity: 1, available: prod.quantity }];
    });
    setSelectedProductId('');
  };
  // Hidden input that always captures scanner keystrokes
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Re-focus the hidden input whenever user clicks anywhere on the page
  // (except when they intentionally click a real input/select)
  useEffect(() => {
    const refocus = (e: MouseEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      scanInputRef.current?.focus();
    };
    document.addEventListener('click', refocus);
    // Focus on mount
    scanInputRef.current?.focus();
    return () => document.removeEventListener('click', refocus);
  }, []);

  const handleScanInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const code = (e.target as HTMLInputElement).value.trim();
    (e.target as HTMLInputElement).value = '';
    if (code.length >= 3) handleBarcodeDetected(code);
  };

  const updateQty = (productId: number, qty: number) => {
    setCart(prev => prev.map(i =>
      i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.available)) } : i
    ));
  };

  const removeItem = (productId: number) => setCart(prev => prev.filter(i => i.productId !== productId));

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const selectedCustomer = customers.find(c => c.id === +selectedCustomerId);
  const creditAvailable = selectedCustomer
    ? selectedCustomer.credit_limit - selectedCustomer.outstanding_balance : 0;
  const creditOk = selectedCustomer && paymentType === 'Credit'
    ? creditAvailable >= total && selectedCustomer.outstanding_balance < selectedCustomer.credit_limit
    : true;

  const handleSubmit = async () => {
    if (cart.length === 0) { showToast('Add at least one item', 'error'); return; }
    if (paymentType === 'Credit' && !selectedCustomerId) {
      showToast('Select a customer for credit sale', 'error'); return;
    }
    if (paymentType === 'Credit' && !creditOk) {
      showToast('Customer credit limit exceeded', 'error'); return;
    }

    setSubmitting(true);
    
    const payload: Record<string, any> = {
      payment_type: paymentType,
      sale_date: saleDate,
      product: cart.map(item => item.productId),
      quantity: cart.map(item => item.quantity),
      price: cart.map(item => item.price) };

    if (selectedCustomerId && selectedCustomerId !== 'other') {
      payload.customer_id = parseInt(selectedCustomerId);
    }
    if (selectedCustomerId === 'other' && customCustomerName) {
      payload.customer_name = customCustomerName;
    }

    try {
      const res = await apiPost('/add-sale', payload);
      if (res.success) {
        const custName = selectedCustomer?.name ?? customCustomerName ?? '';
        const custPhone = selectedCustomer?.phone ?? '';
        printReceipt(cart, total, paymentType, custName, tenantName);
        // Store last sale for WhatsApp button
        setLastSale({ items: [...cart], total, paymentType, customerName: custName, customerPhone: custPhone });
        showToast('Sale recorded successfully!');
        setCart([]);
        setSelectedCustomerId('');
        setCustomCustomerName('');
        setPaymentType('Cash');
        setSaleDate(new Date().toISOString().slice(0,10));
        apiGet('/products-list').then(d => setProducts(d.data ?? d)).catch(() => {});
      } else {
        showToast(res.message ?? 'Failed to record sale', 'error');
      }
    } catch (e: any) {
      console.error('Sale error:', e);
      showToast(e?.data?.message ?? e?.message ?? 'Error recording sale', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const payMethods = [
    { id: 'Cash' as const,     label: 'Cash',     icon: Banknote },
    { id: 'Transfer' as const, label: 'Transfer', icon: CreditCard },
    { id: 'Credit' as const,   label: 'Credit',   icon: DollarSign,
      // Disable Credit if no registered customer is selected
      disabled: !selectedCustomerId || selectedCustomerId === 'other' },
  ];

  return (
    <div className="space-y-3 sm:space-y-6 pb-24 lg:pb-8">
      {/* Hidden input — captures USB/Bluetooth scanner keystrokes at all times */}
      <input ref={scanInputRef} onKeyDown={handleScanInput}
        style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 1, height: 1, top: 0, left: 0 }}
        aria-hidden="true" readOnly={false} tabIndex={-1}/>

      {/* Camera scanner modal */}
      {cameraOpen && <CameraScanner onDetected={handleBarcodeDetected} onClose={() => setCameraOpen(false)}/>}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm",
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        )}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-auto"><X size={16}/></button>
        </div>
      )}

      {/* Header + scanner bar combined */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight dark:text-zinc-100 leading-tight">Sales Point</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ScanLine size={12} className="text-emerald-500 flex-shrink-0"/>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Scanner ready</p>
            </div>
          </div>
        </div>
        <button onClick={() => setCameraOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 dark:hover:bg-primary-900/20 transition-all whitespace-nowrap flex-shrink-0">
          <Camera size={14}/> Camera Scan
        </button>
      </div>

      {/* WhatsApp receipt prompt — shown after successful sale if customer has a phone */}
      {lastSale && lastSale.customerPhone && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Send receipt to <strong>{lastSale.customerName || lastSale.customerPhone}</strong> on WhatsApp?
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { openWhatsAppReceipt(lastSale.customerPhone, lastSale.customerName, lastSale.items, lastSale.total, lastSale.paymentType, tenantName); setLastSale(null); }}
              className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20b858] transition-colors">
              Send
            </button>
            <button onClick={() => setLastSale(null)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg">
              <X size={14}/>
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: order form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Transaction details — compact on mobile */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-3 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Customer</label>
                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none">
                  <option value="">Walk-in</option>
                  <option value="other">Other…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.business_name ? ` (${c.business_name})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCustomerId === 'other' && (
                  <input value={customCustomerName} onChange={e => setCustomCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none mt-1"/>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment</label>
                <div className="grid grid-cols-3 gap-1">
                  {payMethods.map(m => (
                    <button key={m.id} onClick={() => !m.disabled && setPaymentType(m.id)}
                      disabled={m.disabled}
                      className={cn("py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                        paymentType === m.id
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-zinc-100 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300")}>
                      <m.icon size={12}/>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date</label>
                <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none"/>
              </div>
            </div>
            {selectedCustomer && (
              <div className={cn("mt-2 p-2 rounded-lg text-xs flex items-start gap-1.5",
                paymentType === 'Credit' && !creditOk
                  ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800')}>
                {paymentType === 'Credit' && !creditOk
                  ? <AlertCircle size={13} className="flex-shrink-0 mt-0.5"/>
                  : <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5"/>
                }
                <span>
                  <strong>{selectedCustomer.name}</strong> - Limit: {fmt(selectedCustomer.credit_limit)} | Outstanding: {fmt(selectedCustomer.outstanding_balance)} | Available: {fmt(creditAvailable)}
                  {paymentType === 'Credit' && !creditOk && <strong className="ml-1"> (Limit exceeded)</strong>}
                </span>
              </div>
            )}
          </div>

          {/* Add item — merged into order card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
              <div className="flex gap-2">
                <select value={selectedProductId} onChange={e => handleProductChange(e.target.value)}
                  className="flex-1 px-2.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none">
                  <option value="">Choose a product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} ({p.quantity} in stock)
                    </option>
                  ))}
                </select>
                {selectedProductId && (
                  <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 whitespace-nowrap">
                    {loadingPrice ? <span className="animate-pulse">…</span> : (
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {fmt(products.find(p => p.id === +selectedProductId)?.price ?? 0)}
                      </span>
                    )}
                  </div>
                )}
                <button onClick={addToCart} disabled={!selectedProductId}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-40 transition-all flex items-center gap-1 whitespace-nowrap text-sm">
                  <Plus size={15}/> <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Order Items ({cart.length})</h3>
            </div>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto" style={{marginTop: 0}}>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    {['Product','Unit Price','Qty','Subtotal',''].map((h, i) => (
                      <th key={i} className={cn("px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500", h === '' && 'text-right')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {cart.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-zinc-400 italic">No items yet — add a product above</td></tr>
                  ) : cart.map(item => (
                    <tr key={item.productId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{item.name}</p>
                        <p className="text-xs text-zinc-400">{item.available} in stock</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{fmt(item.price)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-fit">
                          <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="p-0.5 hover:text-primary-600 transition-colors">−</button>
                          <input type="number" min="1" max={item.available} value={item.quantity}
                            onChange={e => updateQty(item.productId, parseInt(e.target.value) || 1)}
                            className="text-sm font-bold w-12 text-center dark:text-zinc-100 bg-transparent border-0 outline-none focus:ring-1 focus:ring-primary-600 rounded px-1"/>
                          <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="p-0.5 hover:text-primary-600 transition-colors">+</button>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-sm text-zinc-900 dark:text-zinc-100">{fmt(item.price * item.quantity)}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => removeItem(item.productId)} className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                          <Trash2 size={15}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile — single compact row per item */}
            <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {cart.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400 italic">No items yet — add a product above</p>
              ) : cart.map(item => (
                <div key={item.productId} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm dark:text-zinc-100 truncate">{item.name}</p>
                    <p className="text-xs text-zinc-400">{fmt(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center font-bold text-zinc-500 hover:text-primary-600">−</button>
                    <input type="number" min="1" max={item.available} value={item.quantity}
                      onChange={e => updateQty(item.productId, parseInt(e.target.value) || 1)}
                      className="text-sm font-bold w-10 text-center dark:text-zinc-100 bg-transparent border-0 outline-none focus:ring-1 focus:ring-primary-600 rounded px-0.5"/>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center font-bold text-zinc-500 hover:text-primary-600">+</button>
                  </div>
                  <p className="font-bold text-sm dark:text-zinc-100 w-20 text-right">{fmt(item.price * item.quantity)}</p>
                  <button onClick={() => removeItem(item.productId)} className="p-1 text-zinc-300 hover:text-rose-500 rounded">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: checkout summary — hidden on mobile (sticky bar handles it) */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden sticky top-4">
            <div className="p-5 bg-primary-900 dark:bg-primary-950 text-white">
              <h3 className="font-bold text-lg">Order Summary</h3>
              <p className="text-primary-300 text-xs mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {cart.length > 0 && <hr className="border-zinc-100 dark:border-zinc-800"/>}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{fmt(total)}</p>
                </div>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-full",
                  paymentType === 'Cash' ? 'bg-green-50 text-green-700' :
                  paymentType === 'Transfer' ? 'bg-blue-50 text-blue-700' :
                  'bg-amber-50 text-amber-700')}>
                  {paymentType}
                </span>
              </div>

              <button onClick={handleSubmit}
                disabled={submitting || cart.length === 0 || (paymentType === 'Credit' && !creditOk)}
                className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-40 shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Recording…</span></>
                ) : (
                  <><CheckCircle2 size={18}/><span>Complete Sale</span></>
                )}
              </button>

              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1">
                  <RotateCcw size={12}/> Clear order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 shadow-[0_-8px_24px_rgba(0,0,0,.08)] z-30">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-bold dark:text-zinc-100">{fmt(total)}</p>
            </div>
            <button onClick={handleSubmit} disabled={submitting || (paymentType === 'Credit' && !creditOk)}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-40 transition-all shadow-lg shadow-primary-600/20">
              {submitting ? 'Recording…' : 'Complete Sale'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
