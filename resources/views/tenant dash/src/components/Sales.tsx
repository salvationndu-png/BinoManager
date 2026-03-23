import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, User, Package, X, CheckCircle2, AlertCircle, DollarSign, ScanLine, Camera, Keyboard } from 'lucide-react';
import { Sale, Product, Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const mockCustomers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', creditLimit: 5000, outstandingBalance: 1200, status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1 987 654 321', creditLimit: 2000, outstandingBalance: 1950, status: 'active' },
  { id: '3', name: 'Robert Wilson', email: 'robert@example.com', phone: '+1 555 000 111', creditLimit: 10000, outstandingBalance: 0, status: 'active' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+1 444 222 333', creditLimit: 1500, outstandingBalance: 1600, status: 'blocked' },
];

interface CartItem extends Product {
  quantity: number;
}

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQty: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

const QuantitySelector = ({ quantity, onChange, onIncrement, onDecrement, size = 'md', className }: QuantitySelectorProps) => (
  <div className={cn(
    "flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl dark:bg-zinc-800 dark:border-zinc-700",
    size === 'sm' ? "px-2 py-1" : "px-4 py-2",
    className
  )}>
    <button onClick={onDecrement} className="p-1 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400">
      <Minus size={size === 'sm' ? 12 : 18} />
    </button>
    <input 
      type="number" 
      value={quantity}
      onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
      className={cn(
        "bg-transparent text-center font-bold focus:outline-none dark:text-zinc-100",
        size === 'sm' ? "text-xs w-4" : "text-sm w-full"
      )}
    />
    <button onClick={onIncrement} className="p-1 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400">
      <Plus size={size === 'sm' ? 12 : 18} />
    </button>
  </div>
);

const ProductDetails = ({ product }: { product: Product | undefined }) => (
  <AnimatePresence mode="wait">
    {product ? (
      <motion.div 
        key={product.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-4 md:p-6 bg-zinc-50 rounded-2xl border border-zinc-100 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 dark:bg-zinc-800/50 dark:border-zinc-700"
      >
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Price</p>
          <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">${product.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Stock</p>
          <p className={`text-lg md:text-xl font-bold ${product.stock < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {product.stock} units
          </p>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Category</p>
          <p className="text-sm font-medium text-zinc-600 mt-1 dark:text-zinc-400">{product.category}</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">SKU</p>
          <p className="text-sm font-mono text-zinc-600 mt-1 dark:text-zinc-400">{product.sku}</p>
        </div>
      </motion.div>
    ) : (
      <div className="p-8 md:p-12 border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-zinc-300 gap-3 dark:border-zinc-800 dark:text-zinc-700">
        <Package size={40} />
        <p className="text-sm font-medium">Select a product to view details</p>
      </div>
    )}
  </AnimatePresence>
);

const OrderItemsList = ({ 
  cart, 
  onUpdateQuantity, 
  onRemove 
}: { 
  cart: CartItem[], 
  onUpdateQuantity: (id: string, delta: number) => void, 
  onRemove: (id: string) => void 
}) => (
  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
    <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800">
      <h3 className="font-bold text-sm dark:text-zinc-100">Order Items ({cart.length})</h3>
    </div>
    
    {/* Desktop View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/30 dark:bg-zinc-900 dark:border-zinc-800">
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Product</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Price</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Qty</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Subtotal</th>
            <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right dark:text-zinc-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {cart.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 text-sm italic dark:text-zinc-600">
                No items added to this order yet.
              </td>
            </tr>
          ) : (
            cart.map(item => (
              <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-800/50">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm dark:text-zinc-100">{item.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono dark:text-zinc-500">{item.sku}</p>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <QuantitySelector 
                    quantity={item.quantity}
                    onChange={(newQty) => onUpdateQuantity(item.id, newQty - item.quantity)}
                    onIncrement={() => onUpdateQuantity(item.id, 1)}
                    onDecrement={() => onUpdateQuantity(item.id, -1)}
                    size="sm"
                    className="w-fit bg-zinc-100 border-none dark:bg-zinc-800"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onRemove(item.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors dark:hover:bg-rose-900/20">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile View */}
    <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
      {cart.length === 0 ? (
        <div className="p-8 text-center text-zinc-400 text-sm italic dark:text-zinc-600">
          No items added yet.
        </div>
      ) : (
        cart.map(item => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-sm dark:text-zinc-100">{item.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono dark:text-zinc-500">{item.sku}</p>
              </div>
              <button onClick={() => onRemove(item.id)} className="p-2 text-zinc-400 hover:text-rose-600">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <QuantitySelector 
                quantity={item.quantity}
                onChange={(newQty) => onUpdateQuantity(item.id, newQty - item.quantity)}
                onIncrement={() => onUpdateQuantity(item.id, 1)}
                onDecrement={() => onUpdateQuantity(item.id, -1)}
                size="sm"
                className="bg-zinc-100 border-none dark:bg-zinc-800"
              />
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">${item.price.toFixed(2)} each</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const CheckoutSummary = ({ 
  subtotal, 
  tax, 
  total, 
  paymentMethod, 
  setPaymentMethod, 
  isEligibleForCredit, 
  cartLength,
  checkoutRef
}: { 
  subtotal: number, 
  tax: number, 
  total: number, 
  paymentMethod: string, 
  setPaymentMethod: (method: any) => void, 
  isEligibleForCredit: boolean, 
  cartLength: number,
  checkoutRef: React.RefObject<HTMLDivElement | null>
}) => (
  <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg flex flex-col overflow-hidden dark:bg-zinc-900 dark:border-zinc-800" ref={checkoutRef}>
    <div className="p-6 border-b border-zinc-100 bg-primary-900 text-white dark:bg-primary-950 dark:border-zinc-800">
      <h3 className="font-bold text-lg">Checkout Summary</h3>
      <p className="text-primary-300 text-xs mt-1">Review and finalize payment</p>
    </div>

    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>Subtotal</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>Tax (8%)</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">${tax.toFixed(2)}</span>
        </div>
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Total Amount</p>
            <p className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight dark:text-zinc-100">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'card', label: 'Card', icon: CreditCard },
            { id: 'cash', label: 'Cash', icon: ShoppingCart },
            { id: 'credit', label: 'Credit', icon: DollarSign, disabled: !isEligibleForCredit }
          ].map((method) => (
            <button 
              key={method.id}
              disabled={method.disabled}
              onClick={() => setPaymentMethod(method.id as any)}
              className={cn(
                "p-3 border-2 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-all",
                method.disabled ? "opacity-50 cursor-not-allowed" : "",
                paymentMethod === method.id 
                  ? "border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                  : "border-zinc-100 text-zinc-500 hover:border-zinc-200 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
              )}
            >
              <method.icon size={18} />
              {method.label}
            </button>
          ))}
        </div>
      </div>

      <button 
        disabled={cartLength === 0}
        className="w-full py-4 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-600/20"
      >
        Complete Transaction
      </button>
    </div>
  </div>
);

const CustomerInfo = ({ 
  selectedCustomerId, 
  setSelectedCustomerId, 
  selectedCustomer, 
  isEligibleForCredit 
}: { 
  selectedCustomerId: string, 
  setSelectedCustomerId: (id: string) => void, 
  selectedCustomer: Customer | undefined, 
  isEligibleForCredit: boolean 
}) => (
  <div className={cn(
    "p-6 rounded-2xl border transition-all",
    selectedCustomer 
      ? isEligibleForCredit 
        ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
        : "bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20"
      : "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800"
  )}>
    <div className="flex items-center justify-between mb-4">
      <div className={cn(
        "flex items-center gap-3",
        selectedCustomer 
          ? isEligibleForCredit ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
          : "text-zinc-700 dark:text-zinc-300"
      )}>
        <User size={20} />
        <h4 className="font-bold text-sm">Customer Info</h4>
      </div>
      {selectedCustomer && (
        <button 
          onClick={() => setSelectedCustomerId('')}
          className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <X size={16} />
        </button>
      )}
    </div>

    <div className="space-y-4">
      <select 
        value={selectedCustomerId}
        onChange={(e) => setSelectedCustomerId(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary-600 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
      >
        <option value="">Select Customer...</option>
        {mockCustomers.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <AnimatePresence mode="wait">
        {selectedCustomer ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Credit Limit</span>
              <span className="dark:text-zinc-200">${selectedCustomer.creditLimit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Outstanding</span>
              <span className={selectedCustomer.outstandingBalance > selectedCustomer.creditLimit ? 'text-rose-600 dark:text-rose-400' : 'dark:text-zinc-200'}>
                ${selectedCustomer.outstandingBalance.toLocaleString()}
              </span>
            </div>
            
            <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
              {isEligibleForCredit ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase dark:text-emerald-400">
                  <CheckCircle2 size={14} />
                  Eligible for Credit
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase dark:text-rose-400">
                  <AlertCircle size={14} />
                  {selectedCustomer.status === 'blocked' ? 'Account Blocked' : 'Credit Limit Exceeded'}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
            Select a customer to track history and check credit eligibility.
          </p>
        )}
      </AnimatePresence>
    </div>
  </div>
);

// ── Barcode Scanner ────────────────────────────────────────────────────────
type ScanMode = 'camera' | 'manual';

function BarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<ScanMode>('camera');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (mode !== 'camera') { stopCamera(); return; }

    // @ts-ignore — BarcodeDetector is not in all TS libs yet
    if (!('BarcodeDetector' in window)) {
      setError('Camera scanning not supported in this browser. Use manual entry.');
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
        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'] });

        const scan = async () => {
          if (!active || !videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              stopCamera();
              onDetected(barcodes[0].rawValue);
              return;
            }
          } catch {}
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      })
      .catch(() => {
        if (active) { setError('Camera access denied. Use manual entry.'); setMode('manual'); }
      });

    return () => { active = false; stopCamera(); };
  }, [mode, onDetected, stopCamera]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-primary-600" />
            <span className="font-bold text-sm dark:text-zinc-100">Scan Barcode / QR Code</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(m => m === 'camera' ? 'manual' : 'camera')}
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={mode === 'camera' ? 'Switch to manual' : 'Switch to camera'}
            >
              {mode === 'camera' ? <Keyboard size={16} /> : <Camera size={16} />}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {mode === 'camera' ? (
          <div className="relative bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-56 object-cover" />
            {/* Scan guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-28 border-2 border-primary-400 rounded-lg relative">
                <span className="absolute -top-px left-0 w-6 h-0.5 bg-primary-400" />
                <span className="absolute -top-px right-0 w-6 h-0.5 bg-primary-400" />
                <span className="absolute -bottom-px left-0 w-6 h-0.5 bg-primary-400" />
                <span className="absolute -bottom-px right-0 w-6 h-0.5 bg-primary-400" />
              </div>
            </div>
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-xs p-2 text-center">{error}</div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {error && <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Enter Barcode / QR Code</label>
              <input
                autoFocus
                type="text"
                placeholder="Scan or type code..."
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && manualCode.trim()) { onDetected(manualCode.trim()); } }}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Press Enter or click Lookup to search</p>
            </div>
            <button
              disabled={!manualCode.trim()}
              onClick={() => onDetected(manualCode.trim())}
              className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all disabled:opacity-50"
            >
              Lookup Product
            </button>
          </div>
        )}

        {mode === 'camera' && (
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-3">Point camera at barcode or QR code</p>
        )}
      </div>
    </div>
  );
}

export default function Sales() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'credit'>('card');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const checkoutRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/products-list')
      .then(r => r.json())
      .then((data: any[]) => setProducts(data.map(p => ({
        id: String(p.id), name: p.name, category: '', price: p.price, stock: p.quantity, sku: p.barcode ?? '', barcode: p.barcode
      }))));
  }, []);

  const handleBarcodeDetected = useCallback(async (code: string) => {
    setScannerOpen(false);
    try {
      const res = await fetch(`/products/barcode/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!data.success) {
        setScanFeedback({ type: 'error', message: `No product found for barcode: ${code}` });
        setTimeout(() => setScanFeedback(null), 3000);
        return;
      }
      const p = data.product;
      const product: Product = { id: String(p.id), name: p.name, category: '', price: p.price, stock: p.quantity, sku: p.barcode ?? '', barcode: p.barcode };
      setCart(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { ...product, quantity: 1 }];
      });
      setScanFeedback({ type: 'success', message: `Added: ${p.name}` });
      setTimeout(() => setScanFeedback(null), 2000);
    } catch {
      setScanFeedback({ type: 'error', message: 'Lookup failed. Try again.' });
      setTimeout(() => setScanFeedback(null), 3000);
    }
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedCustomer = mockCustomers.find(c => c.id === selectedCustomerId);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const isEligibleForCredit = useMemo(() => {
    if (!selectedCustomer) return false;
    return (
      selectedCustomer.status === 'active' && 
      (selectedCustomer.outstandingBalance + total) <= selectedCustomer.creditLimit
    );
  }, [selectedCustomer, total]);

  const addToCart = () => {
    if (!selectedProduct) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === selectedProduct.id);
      if (existing) return prev.map(item => item.id === selectedProduct.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...selectedProduct, quantity }];
    });
    setSelectedProductId('');
    setQuantity(1);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {scannerOpen && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScannerOpen(false)} />}

      {scanFeedback && (
        <div className={cn(
          'fixed top-4 right-4 z-[80] px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2',
          scanFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        )}>
          {scanFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {scanFeedback.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-zinc-100">Sales Point</h1>
          <p className="text-zinc-500 mt-1 dark:text-zinc-400">Process customer orders by selecting products from the catalog.</p>
        </div>
        <button
          onClick={() => setScannerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          <ScanLine size={18} />
          Scan Barcode
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 pb-24 lg:pb-0">
        {/* Product Selection Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 md:p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <ShoppingCart className="text-zinc-400" size={20} />
              <h2 className="text-lg font-bold dark:text-zinc-100">Item Selection</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Select Product</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}{p.barcode ? ` · ${p.barcode}` : ''}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    title="Scan barcode"
                    className="px-3 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-primary-900/20"
                  >
                    <ScanLine size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Quantity</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <QuantitySelector 
                    quantity={quantity}
                    onChange={setQuantity}
                    onIncrement={() => setQuantity(q => q + 1)}
                    onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
                    className="flex-1"
                  />
                  <button 
                    disabled={!selectedProductId}
                    onClick={addToCart}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Product Details */}
            <ProductDetails product={selectedProduct} />
          </div>

          {/* Order Summary Table */}
          <OrderItemsList 
            cart={cart} 
            onUpdateQuantity={updateQuantity} 
            onRemove={removeFromCart} 
          />
        </div>

        {/* Checkout Summary */}
        <div className="space-y-6">
          <CheckoutSummary 
            subtotal={subtotal}
            tax={tax}
            total={total}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isEligibleForCredit={isEligibleForCredit}
            cartLength={cart.length}
            checkoutRef={checkoutRef}
          />

          <CustomerInfo 
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            selectedCustomer={selectedCustomer}
            isEligibleForCredit={isEligibleForCredit}
          />
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-30 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">Total</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">${total.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => checkoutRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
            >
              Checkout Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
