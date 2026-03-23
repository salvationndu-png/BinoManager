import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, AlertCircle, CheckCircle2, X, Edit2, Trash2, DollarSign, Eye, History, CreditCard } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import { openWhatsAppReminder } from '../lib/whatsapp';
import { cn } from '../lib/utils';

interface Customer { id: number; name: string; email?: string; phone?: string; business_name?: string; address?: string; credit_limit: number; outstanding_balance: number; }
interface Payment { id: number; amount: number; payment_method: string; payment_date: string; notes?: string; recordedBy?: { name: string }; }
const fmt = (n: number) => '₦' + Number(n).toLocaleString('en-NG', {minimumFractionDigits:2});

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add'|'edit'|'payment'|'view'|null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer|null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', business_name:'', address:'', credit_limit:'0' });
  const [paymentForm, setPaymentForm] = useState({ amount:'', payment_method:'Cash', payment_date: new Date().toISOString().slice(0,10), notes:'' });

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg,type}); setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    try { const d = await apiGet('/customers/list'); setCustomers(d.data ?? d); }
    catch { showToast('Failed to load customers', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const d = await apiPost('/customers', form);
      if (d.success ?? d.id) { showToast('Customer added!'); setModal(null); setForm({name:'',email:'',phone:'',business_name:'',address:'',credit_limit:'0'}); await load(); }
      else { showToast(d.message ?? 'Failed', 'error'); }
    } catch (e: any) { showToast(e?.data?.errors ? Object.values(e.data.errors).flat().join(', ') : 'Error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      const d = await apiPut(`/customers/${selectedCustomer.id}`, form);
      if (d.success) { showToast('Customer updated!'); setModal(null); await load(); }
      else { showToast(d.message ?? 'Failed', 'error'); }
    } catch (e: any) { showToast(e?.data?.errors ? Object.values(e.data.errors).flat().join(', ') : 'Error', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Delete ${customer.name}? This cannot be undone.`)) return;
    try {
      const d = await apiDelete(`/customers/${customer.id}`);
      if (d.success) { showToast('Customer deleted'); await load(); }
      else { showToast(d.message ?? 'Failed', 'error'); }
    } catch { showToast('Error deleting customer', 'error'); }
  };

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      business_name: customer.business_name ?? '',
      address: customer.address ?? '',
      credit_limit: String(customer.credit_limit)
    });
    setModal('edit');
  };

  const openPayment = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentForm({ amount:'', payment_method:'Cash', payment_date: new Date().toISOString().slice(0,10), notes:'' });
    setModal('payment');
  };

  const openView = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setModal('view');
    try {
      const d = await apiGet(`/customers/${customer.id}/payments`);
      setPayments(d.payments ?? []);
    } catch { showToast('Failed to load payment history', 'error'); }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      const d = await apiPost(`/customers/${selectedCustomer.id}/payments`, paymentForm);
      if (d.success) {
        showToast('Payment recorded!');
        setModal(null);
        await load();
      } else { showToast(d.message ?? 'Failed', 'error'); }
    } catch (e: any) { showToast(e?.data?.message ?? 'Error recording payment', 'error'); }
    finally { setSubmitting(false); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.business_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  );

  return (
    <div className="space-y-6 pb-8">
      {toast && <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm ${toast.type==='success'?'bg-emerald-600':'bg-rose-600'}`}>
        {toast.type==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}<span className="flex-1">{toast.msg}</span><button onClick={()=>setToast(null)}><X size={16}/></button>
      </div>}

      {modal === 'add' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Add Customer</h3>
              <button onClick={() => setModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {[
                {label:'Full Name *', key:'name', type:'text', required:true, placeholder:'John Doe'},
                {label:'Phone', key:'phone', type:'tel', required:false, placeholder:'+234 800 000 0000'},
                {label:'Email', key:'email', type:'email', required:false, placeholder:'john@example.com'},
                {label:'Business Name', key:'business_name', type:'text', required:false, placeholder:'ABC Traders'},
                {label:'Address', key:'address', type:'text', required:false, placeholder:'123 Main St'},
                {label:'Credit Limit (₦)', key:'credit_limit', type:'number', required:false, placeholder:'50000'},
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">{f.label}</label>
                  <input type={f.type} required={f.required} placeholder={f.placeholder}
                    value={(form as any)[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Adding…' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Edit Customer</h3>
              <button onClick={() => setModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              {[
                {label:'Full Name *', key:'name', type:'text', required:true, placeholder:'John Doe'},
                {label:'Phone', key:'phone', type:'tel', required:false, placeholder:'+234 800 000 0000'},
                {label:'Email', key:'email', type:'email', required:false, placeholder:'john@example.com'},
                {label:'Business Name', key:'business_name', type:'text', required:false, placeholder:'ABC Traders'},
                {label:'Address', key:'address', type:'text', required:false, placeholder:'123 Main St'},
                {label:'Credit Limit (₦)', key:'credit_limit', type:'number', required:false, placeholder:'50000'},
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">{f.label}</label>
                  <input type={f.type} required={f.required} placeholder={f.placeholder}
                    value={(form as any)[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {modal === 'payment' && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Record Payment</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Outstanding Balance</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">{fmt(selectedCustomer.outstanding_balance)}</p>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Payment Amount (₦) *</label>
                <input type="number" min="0.01" step="0.01" max={selectedCustomer.outstanding_balance} required
                  value={paymentForm.amount} onChange={e => setPaymentForm(prev => ({...prev, amount: e.target.value}))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Payment Method *</label>
                  <select required value={paymentForm.payment_method} onChange={e => setPaymentForm(prev => ({...prev, payment_method: e.target.value}))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100">
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Payment Date *</label>
                  <input type="date" required value={paymentForm.payment_date} onChange={e => setPaymentForm(prev => ({...prev, payment_date: e.target.value}))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Notes</label>
                <textarea rows={2} value={paymentForm.notes} onChange={e => setPaymentForm(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Optional notes"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20">
                  {submitting ? 'Recording…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {modal === 'view' && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Customer Details</h3>
              <button onClick={() => setModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-600 grid place-items-center text-white text-lg font-bold">
                    {selectedCustomer.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{selectedCustomer.name}</p>
                    {selectedCustomer.business_name && <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedCustomer.business_name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedCustomer.phone && <div><span className="text-zinc-500 dark:text-zinc-400">Phone:</span> <span className="font-medium dark:text-zinc-200">{selectedCustomer.phone}</span></div>}
                  {selectedCustomer.email && <div><span className="text-zinc-500 dark:text-zinc-400">Email:</span> <span className="font-medium dark:text-zinc-200">{selectedCustomer.email}</span></div>}
                  {selectedCustomer.address && <div className="col-span-2"><span className="text-zinc-500 dark:text-zinc-400">Address:</span> <span className="font-medium dark:text-zinc-200">{selectedCustomer.address}</span></div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Credit Limit</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">{fmt(selectedCustomer.credit_limit)}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Outstanding</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">{fmt(selectedCustomer.outstanding_balance)}</p>
                  {selectedCustomer.outstanding_balance > 0 && selectedCustomer.phone && (
                    <button
                      onClick={() => openWhatsAppReminder(selectedCustomer.phone!, selectedCustomer.name, selectedCustomer.outstanding_balance, window.BinoManager?.tenant?.name ?? 'BinoManager')}
                      className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20b858] transition-colors w-full justify-center">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <History size={16}/> Payment History
                  </h4>
                  <span className="text-xs text-zinc-400">{payments.length} payments</span>
                </div>
                {payments.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-8">No payment history</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div key={p.id} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{fmt(p.amount)}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {p.payment_date} · {p.payment_method}
                            {p.recordedBy && ` · by ${p.recordedBy.name}`}
                          </p>
                          {p.notes && <p className="text-xs text-zinc-400 mt-1">{p.notes}</p>}
                        </div>
                        <CreditCard size={16} className="text-zinc-400"/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Customers</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{customers.length} registered customers</p>
        </div>
        <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
          <UserPlus size={16}/> Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, business or phone…"
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
          </div>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center"><UserPlus size={40} className="mx-auto mb-3 text-zinc-200 dark:text-zinc-700"/><p className="text-sm text-zinc-400">No customers found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {['Customer','Phone','Credit Limit','Outstanding','Status','Actions'].map(h => (
                    <th key={h} className={cn("px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500", h === 'Actions' && 'text-right')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filtered.map(c => {
                  const overLimit = c.outstanding_balance >= c.credit_limit && c.credit_limit > 0;
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-600 grid place-items-center text-white text-xs font-bold flex-shrink-0">
                            {c.name.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{c.name}</p>
                            {c.business_name && <p className="text-xs text-zinc-400">{c.business_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{c.phone || '-'}</td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{fmt(c.credit_limit)}</td>
                      <td className="px-5 py-3 font-semibold text-sm"><span className={overLimit ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}>{fmt(c.outstanding_balance)}</span></td>
                      <td className="px-5 py-3">
                        <span className={cn("text-xs font-bold px-2 py-1 rounded-full", overLimit ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                          {overLimit ? 'Over Limit' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(c)} title="View details" className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Eye size={15}/>
                          </button>
                          {c.outstanding_balance > 0 && (
                            <button onClick={() => openPayment(c)} title="Record payment" className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                              <DollarSign size={15}/>
                            </button>
                          )}
                          {c.outstanding_balance > 0 && c.phone && (
                            <button
                              onClick={() => openWhatsAppReminder(c.phone!, c.name, c.outstanding_balance, window.BinoManager?.tenant?.name ?? 'BinoManager')}
                              title="Send WhatsApp reminder"
                              className="p-2 text-zinc-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors">
                              <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </button>
                          )}
                          <button onClick={() => openEdit(c)} title="Edit" className="p-2 text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                            <Edit2 size={15}/>
                          </button>
                          <button onClick={() => handleDelete(c)} title="Delete" className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
