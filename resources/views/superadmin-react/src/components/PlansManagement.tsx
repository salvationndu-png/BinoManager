import { 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Zap,
  Lock,
  Plus,
  Edit3,
  Trash2,
  GripVertical
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const plans = [
  { 
    id: 1, 
    name: 'Starter', 
    price: '25,000', 
    active: true, 
    subscribers: 450, 
    revenue: '11.25M',
    limits: { users: 5, products: 50 },
    features: ['Basic Analytics', 'Standard Support', 'Core Modules']
  },
  { 
    id: 2, 
    name: 'Business', 
    price: '45,000', 
    active: true, 
    subscribers: 300, 
    revenue: '13.5M',
    limits: { users: 20, products: 500 },
    features: ['Advanced Analytics', 'Priority Support', 'Custom Branding', 'API Access']
  },
  { 
    id: 3, 
    name: 'Enterprise', 
    price: '150,000', 
    active: true, 
    subscribers: 122, 
    revenue: '18.3M',
    limits: { users: 0, products: 0 },
    features: ['Full Suite', 'Dedicated Manager', 'White-labeling', 'SLA Guarantee', 'Custom Integration']
  },
];

const PlanCard = ({ plan }: { plan: any, key?: any }) => (
  <div className="bg-sa-card border border-sa-border rounded-2xl p-6 flex flex-col hover:border-sa-accent/50 transition-all duration-300 group relative overflow-hidden">
    {/* Drag Handle */}
    <div className="absolute top-4 right-4 text-sa-muted cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
      <GripVertical size={20} />
    </div>

    <div className="flex items-center gap-3 mb-6">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
        plan.name === 'Starter' ? "bg-sa-accent/10 text-sa-accent" :
        plan.name === 'Business' ? "bg-blue-500/10 text-blue-500" :
        "bg-purple-500/10 text-purple-500"
      )}>
        {plan.name[0]}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">{plan.name}</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
        </div>
        <p className="text-xs text-sa-muted">Sort Order: {plan.id}</p>
      </div>
    </div>

    <div className="mb-6">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">₦{plan.price}</span>
        <span className="text-sa-muted text-sm">/ month</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-3 rounded-xl bg-sa-bg border border-sa-border">
        <p className="text-[10px] text-sa-muted uppercase tracking-widest mb-1">Max Users</p>
        <p className="text-sm font-bold">{plan.limits.users === 0 ? 'Unlimited' : plan.limits.users}</p>
      </div>
      <div className="p-3 rounded-xl bg-sa-bg border border-sa-border">
        <p className="text-[10px] text-sa-muted uppercase tracking-widest mb-1">Max Products</p>
        <p className="text-sm font-bold">{plan.limits.products === 0 ? 'Unlimited' : plan.limits.products}</p>
      </div>
    </div>

    <div className="space-y-3 mb-8 flex-1">
      <p className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Included Features</p>
      {plan.features.map((feature: string) => (
        <div key={feature} className="flex items-center gap-2 text-sm text-sa-muted">
          <ShieldCheck size={14} className="text-sa-accent" />
          {feature}
        </div>
      ))}
    </div>

    <div className="pt-6 border-t border-sa-border space-y-4">
      <div className="flex justify-between text-xs">
        <span className="text-sa-muted">Subscribers</span>
        <span className="font-bold text-sa-text">{plan.subscribers}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-sa-muted">Revenue Contribution</span>
        <span className="font-bold text-sa-accent">₦{plan.revenue}/mo</span>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button className="flex-1 flex items-center justify-center gap-2 bg-sa-bg border border-sa-border py-2 rounded-lg text-xs font-bold hover:bg-sa-border hover:text-sa-text transition-colors">
          <Edit3 size={14} />
          Edit Plan
        </button>
        <button className="p-2 bg-sa-bg border border-sa-border rounded-lg text-red-500 hover:bg-red-500/10 transition-colors opacity-50 hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
);

export const PlansManagement = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plans & Pricing</h2>
          <p className="text-sa-muted text-sm">Changes apply to new subscriptions only. Existing subscriptions are locked.</p>
        </div>
        <button className="flex items-center gap-2 bg-sa-accent text-sa-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Plus size={18} />
          Add New Plan
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <Zap size={20} />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-medium text-sa-text">
            <span className="font-bold">3 Active Plans</span> · 872 Total Subscribers · <span className="text-blue-400 font-bold">₦14.25M MRR</span>
          </p>
        </div>
        <button className="text-xs font-bold text-blue-400 hover:underline">View Detailed Stats</button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Settings Section */}
      <div className="bg-sa-card border border-sa-border rounded-2xl p-4 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-sa-bg border border-sa-border rounded-xl text-sa-accent">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Global Pricing Settings</h3>
            <p className="text-sm text-sa-muted">Configure currency, tax, and billing cycles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-sa-muted uppercase tracking-widest">Base Currency</label>
            <div className="flex items-center gap-2 p-3 bg-sa-bg border border-sa-border rounded-lg">
              <span className="font-bold">NGN (₦)</span>
              <span className="text-xs text-sa-muted">Nigerian Naira</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-sa-muted uppercase tracking-widest">Tax Rate (%)</label>
            <input 
              type="number" 
              defaultValue={7.5} 
              className="w-full bg-sa-bg border border-sa-border rounded-lg p-3 text-sm focus:outline-none focus:border-sa-accent"
            />
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-bold text-sa-muted uppercase tracking-widest">Billing Cycle</label>
            <div className="flex items-center gap-2 p-3 bg-sa-bg border border-sa-border rounded-lg">
              <span className="font-bold">Monthly</span>
              <span className="text-xs text-sa-muted">Standard</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-sa-border flex justify-end">
          <button className="w-full sm:w-auto bg-sa-accent text-sa-bg px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors">
            Save Pricing Settings
          </button>
        </div>
      </div>
    </div>
  );
};
