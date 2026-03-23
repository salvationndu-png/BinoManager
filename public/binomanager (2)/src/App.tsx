/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Menu, 
  X,
  ArrowRight,
  TrendingUp,
  Banknote,
  Clock,
  Mail,
  Lock,
  Smartphone,
  Zap,
  ShieldCheck,
  Globe,
  Star
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data for Dashboard
const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const recentExpenses = [
  { id: 1, item: 'Office Supplies', amount: 200, status: 'Paid', date: 'Mar 10, 2026' },
  { id: 2, item: 'Software Subscription', amount: 520, status: 'Pending', date: 'Mar 09, 2026' },
  { id: 3, item: 'Travel Expenses', amount: 850, status: 'Paid', date: 'Mar 08, 2026' },
  { id: 4, item: 'Advertising', amount: 450, status: 'Paid', date: 'Mar 07, 2026' },
];

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'login' | 'register' | 'features' | 'process' | 'pricing' | 'testimonials'>('landing');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'inventory' | 'expenses' | 'clients' | 'reports' | 'settings'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (newView: typeof view) => {
    setView(newView);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const showNavbar = ['landing', 'features', 'process', 'pricing', 'testimonials'].includes(view);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <AnimatePresence>
        {showNavbar && (
          <motion.div
            key="navbar-wrapper"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <Navbar 
                onNavigate={navigateTo} 
                onLogin={() => navigateTo('login')} 
                onGetStarted={() => navigateTo('register')} 
                isMenuOpen={isMenuOpen} 
                setIsMenuOpen={setIsMenuOpen} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <LandingPage 
            key="landing" 
            onGetStarted={() => navigateTo('register')} 
            onLogin={() => navigateTo('login')}
            onNavigate={navigateTo}
          />
        )}
        {view === 'features' && (
          <FeaturesPage 
            key="features" 
            onBack={() => navigateTo('landing')} 
            onNavigate={navigateTo}
          />
        )}
        {view === 'process' && (
          <ProcessPage 
            key="process" 
            onBack={() => navigateTo('landing')} 
            onNavigate={navigateTo}
          />
        )}
        {view === 'pricing' && (
          <PricingPage 
            key="pricing" 
            onBack={() => navigateTo('landing')} 
            onNavigate={navigateTo}
            onGetStarted={() => navigateTo('register')}
          />
        )}
        {view === 'testimonials' && (
          <TestimonialsPage 
            key="testimonials" 
            onBack={() => navigateTo('landing')} 
            onNavigate={navigateTo}
          />
        )}
        {view === 'login' && (
          <LoginPage 
            key="login" 
            onLogin={() => navigateTo('dashboard')} 
            onBack={() => navigateTo('landing')}
            onRegister={() => navigateTo('register')}
          />
        )}
        {view === 'register' && (
          <RegisterPage 
            key="register" 
            onRegister={() => navigateTo('dashboard')} 
            onBack={() => navigateTo('landing')}
            onLogin={() => navigateTo('login')}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard 
            key="dashboard" 
            onLogout={() => navigateTo('landing')} 
            activeTab={dashboardTab}
            setActiveTab={setDashboardTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Landing Page Components ---

// --- Shared Components ---

function Navbar({ 
  onNavigate, 
  onLogin, 
  onGetStarted, 
  isMenuOpen, 
  setIsMenuOpen 
}: { 
  onNavigate: (view: any) => void;
  onLogin: () => void;
  onGetStarted: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
}) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 px-4 pointer-events-none">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "max-w-fit mx-auto pointer-events-auto transition-all duration-500 rounded-full border",
            scrolled 
              ? "bg-white/70 backdrop-blur-2xl border-white/40 px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)]" 
              : "bg-white/40 backdrop-blur-md border-white/20 px-6 py-4 shadow-sm"
          )}
        >
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-900">Bino</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1 relative">
              {[
                { label: 'Features', view: 'features' },
                { label: 'Process', view: 'process' },
                { label: 'Pricing', view: 'pricing' }
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => onNavigate(item.view)} 
                  className="relative px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={onLogin}
                className="hidden sm:block text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-1.5"
              >
                Login
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-black hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
              >
                Join
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 text-slate-600">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-slate-900/40 backdrop-blur-md md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white m-4 mt-24 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                {['Features', 'Process', 'Pricing', 'Testimonials'].map(item => (
                  <button 
                    key={item}
                    onClick={() => { onNavigate(item.toLowerCase()); setIsMenuOpen(false); }} 
                    className="block w-full text-left text-3xl font-black text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <button onClick={onLogin} className="w-full py-4 rounded-2xl bg-slate-50 text-slate-600 font-black text-lg hover:bg-slate-100 transition-all">Login</button>
                  <button onClick={onGetStarted} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all">Get Started Free</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LandingPage({ 
  onGetStarted, 
  onLogin,
  onNavigate
}: { 
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate: (view: any) => void;
  key?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative bg-slate-50/50"
    >
      {/* Hero Section - Redesigned for "Outside the Box" feel */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 md:pt-20 overflow-hidden bg-white">
        {/* Massive Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.03 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[30vw] md:text-[40vw] font-black text-slate-900 leading-none"
          >
            BINO
          </motion.h1>
        </div>

        {/* Interactive Gradient Follower */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-400 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-purple-400 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
              Next-Gen Business OS
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[120px] font-black text-slate-950 leading-[0.85] tracking-[-0.05em] mb-10">
              Scale <br />
              <span className="text-indigo-600 italic">Faster</span> <br />
              Than Ever.
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg mb-12 leading-relaxed font-medium">
              Stop juggling spreadsheets. BinoManager is the high-performance 
              engine for your business growth. Inventory, clients, and cashflow—synced.
            </p>

            <div className="flex flex-wrap gap-4">
              <Magnetic>
                <button 
                  onClick={onGetStarted}
                  className="px-10 py-6 bg-slate-950 text-white rounded-full text-xl font-black hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4 group"
                >
                  Start Scaling <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </Magnetic>
              <Magnetic>
                <button className="px-10 py-6 bg-white border-2 border-slate-950 text-slate-950 rounded-full text-xl font-black hover:bg-slate-50 transition-all flex items-center gap-4">
                  View Demo
                </button>
              </Magnetic>
            </div>

            <div className="mt-16 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Join 2,400+ founders</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 bg-amber-400 rounded-sm" />)}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <TiltCard>
              <div className="relative py-12">
                <IPhoneMockup>
                  <BusinessDashboard />
                </IPhoneMockup>

                {/* Floating Glass Cards */}
                <FloatingElement className="top-20 -right-8 md:-right-20 z-20" delay={0}>
                  <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth</p>
                        <p className="text-2xl font-black text-slate-900">+248%</p>
                      </div>
                    </div>
                  </div>
                </FloatingElement>

                <FloatingElement className="bottom-20 -left-8 md:-left-20 z-20" delay={1.5}>
                  <div className="bg-indigo-600 p-6 rounded-3xl shadow-2xl text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Active Users</p>
                        <p className="text-2xl font-black">12.4k</p>
                      </div>
                    </div>
                  </div>
                </FloatingElement>

                {/* Decorative Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] border border-slate-100 rounded-full -z-10 animate-spin-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] border border-slate-50 rounded-full -z-20 animate-spin-slow-reverse" />
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* Marquee Ticker */}
        <div className="mt-24 py-8 bg-slate-950 overflow-hidden whitespace-nowrap relative">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 items-center"
          >
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-white font-black text-2xl uppercase tracking-tighter opacity-50">
                  Inventory Synced
                </span>
                <span className="text-indigo-400 font-black text-2xl uppercase tracking-tighter">
                  Real-time Analytics
                </span>
                <span className="text-white font-black text-2xl uppercase tracking-tighter opacity-50">
                  Client Management
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile Experience Section */}
      <section className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Mobile First Design</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                Your business, <br />
                <span className="text-indigo-600 italic">in your pocket.</span>
              </h2>
              <p className="text-slate-600 text-xl font-medium leading-relaxed mb-12 max-w-lg">
                Manage sales, check inventory, and chat with clients from anywhere in the world. 
                Our mobile app is fast, secure, and incredibly easy to use.
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: <Zap className="w-6 h-6" />, title: "Instant Sync", desc: "Changes on mobile reflect instantly on your desktop dashboard." },
                  { icon: <ShieldCheck className="w-6 h-6" />, title: "Biometric Security", desc: "Keep your business data safe with FaceID and Fingerprint lock." },
                  { icon: <Globe className="w-6 h-6" />, title: "Offline Mode", desc: "Continue working even without internet. Syncs when you're back." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-200/30 rounded-full blur-[100px] -z-10" />
              
              {/* iPhone Frame 1 */}
              <motion.div 
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-20"
              >
                <IPhoneMockup>
                  <BusinessDashboard />
                </IPhoneMockup>
                
                {/* Floating glass card */}
                <FloatingElement className="-right-8 md:-right-16 top-1/3 z-30" delay={0.5}>
                  <div className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 w-48">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">New Sale</p>
                        <p className="text-sm font-black text-slate-900">+₦4,200</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '70%' }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                  </div>
                </FloatingElement>
              </motion.div>

              {/* iPhone Frame 2 (Shifted) */}
              <motion.div 
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 40, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative -ml-24 mt-20 hidden md:block z-10"
              >
                <IPhoneMockup>
                  <div className="h-full bg-slate-900 p-6 space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-32 bg-white/10 rounded-full" />
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Inventory Update', time: '12m ago', color: 'bg-indigo-500' },
                        { label: 'New Client Added', time: '45m ago', color: 'bg-emerald-500' },
                        { label: 'Payment Received', time: '2h ago', color: 'bg-amber-500' },
                        { label: 'Low Stock Alert', time: '5h ago', color: 'bg-rose-500' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", item.color)}>
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{item.label}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </IPhoneMockup>

                {/* Floating glass card 2 */}
                <FloatingElement className="-left-8 md:-left-16 bottom-1/4 z-30" delay={1.5}>
                  <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/10 w-48">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Alert</p>
                        <p className="text-sm font-black text-white">Stock Low</p>
                      </div>
                    </div>
                  </div>
                </FloatingElement>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Trusted by industry leaders</p>
            <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-24 gap-y-16 opacity-40 grayscale hover:opacity-100 transition-all duration-700">
            {['Zantic', 'BookStore', 'Wager', 'Unicoin', 'Crono', 'Vortex'].map((brand, i) => (
              <motion.span 
                key={brand} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-4xl font-black text-slate-900 tracking-tighter hover:text-indigo-600 cursor-default transition-colors"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-100/20 rounded-full blur-[120px] -z-10" />
        
        <div className="text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6"
          >
            <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Premium Features</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-none">
            Everything you need <br /> to <span className="text-indigo-600">dominate</span> your market.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Stop juggling multiple apps. BinoManager combines the best tools into 
            one seamless experience designed for hyper-growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {[
            { icon: <LayoutDashboard className="w-8 h-8" />, title: "Unified Dashboard", desc: "Get a 360-degree view of your business performance in real-time. No more guessing.", color: "indigo" },
            { icon: <Package className="w-8 h-8" />, title: "Smart Inventory", desc: "Track stock levels, manage suppliers, and get low-stock alerts automatically.", color: "emerald" },
            { icon: <BarChart3 className="w-8 h-8" />, title: "Advanced Analytics", desc: "Deep dive into your data with professional reports that help you make smarter decisions.", color: "purple" },
            { icon: <Users className="w-8 h-8" />, title: "Client CRM", desc: "Maintain a database of your customers, their purchase history, and contact details.", color: "blue" },
            { icon: <CreditCard className="w-8 h-8" />, title: "Expense Tracking", desc: "Log every business expense, upload receipts, and categorize spending for tax season.", color: "rose" },
            { icon: <Zap className="w-8 h-8" />, title: "Automated Workflows", desc: "From invoice reminders to stock alerts, let BinoManager handle the repetitive tasks.", color: "amber" }
          ].map((feature, i) => (
            <motion.div key={i}>
              <FeatureCard 
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                color={feature.color}
                delay={i * 0.1}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-40 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md"
              >
                <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">How it works</span>
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tight leading-[1.1]">
                Go from chaos to <br />
                <span className="text-indigo-400 italic">complete control.</span>
              </h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Claim your subdomain", desc: "Get a professional URL like yourbusiness.binomanager.com in seconds." },
                  { step: "02", title: "Onboard your team", desc: "Add your staff and assign roles with granular permission controls." },
                  { step: "03", title: "Scale with confidence", desc: "Use real-time data to identify growth opportunities and optimize costs." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-8 group"
                  >
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-2xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500 shadow-xl">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-3 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                      <p className="text-slate-400 text-lg font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/20 blur-[120px] rounded-full" />
              <motion.div 
                initial={{ rotate: 5, scale: 0.9, opacity: 0 }}
                whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative z-10 rounded-[4rem] border-8 border-white/5 bg-white/5 backdrop-blur-3xl p-8 shadow-2xl"
              >
                <div className="bg-slate-900 rounded-[3rem] aspect-[4/5] flex flex-col overflow-hidden border border-white/10">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div className="h-4 w-32 bg-white/10 rounded-full" />
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="h-32 bg-indigo-600/20 rounded-3xl border border-indigo-500/30 flex flex-col justify-center px-8">
                      <div className="h-2 w-20 bg-indigo-400/40 rounded mb-4" />
                      <div className="h-6 w-40 bg-indigo-400 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />
                      ))}
                    </div>
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/10" />
                  </div>
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <FloatingElement className="-top-10 -right-10" delay={0.5}>
                <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </FloatingElement>
              <FloatingElement className="-bottom-10 -left-10" delay={1.5}>
                <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Preview Section */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Success Stories</p>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Loved by business owners.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Bakery Owner", quote: "BinoManager transformed how I track my daily sales and inventory. I can finally focus on baking!" },
              { name: "Marcus Chen", role: "Tech Retailer", quote: "The custom subdomain feature is a game changer. Our efficiency has doubled since we started." },
              { name: "Elena Rodriguez", role: "Boutique Manager", quote: "Expense tracking used to be a nightmare. Now it takes me 5 minutes a day, and tax season is easy." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group"
              >
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-700 font-medium mb-8 italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">{t.name[0]}</div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <button 
              onClick={() => onNavigate('testimonials')}
              className="text-indigo-600 font-black hover:gap-4 transition-all flex items-center gap-2 mx-auto"
            >
              Read all testimonials <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]" />
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
                Ready to <span className="text-indigo-400">dominate</span> your market?
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-12 font-medium leading-relaxed">
                Join 2,000+ entrepreneurs who have already simplified their operations. 
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-6 rounded-2xl text-lg font-black hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
                >
                  Get Started Now
                </button>
                <button className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-10 py-6 rounded-2xl text-lg font-black hover:bg-white/10 transition-all backdrop-blur-md active:scale-95">
                  Schedule Demo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">BinoManager</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600">Contact Us</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 BinoManager. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, color, delay = 0 }: { icon: React.ReactNode, title: string, description: string, color: string, delay?: number }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  }[color as keyof typeof colorMap] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-8 rounded-[2rem] border border-slate-100 bg-white hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col items-start"
    >
      <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", colorMap)}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 leading-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium mb-6 flex-1 text-sm">{description}</p>
      
      <div className="flex items-center gap-2 text-indigo-600 font-black text-xs group-hover:gap-3 transition-all cursor-pointer">
        Learn more <ArrowRight className="w-3.5 h-3.5" />
      </div>

      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-10" />
    </motion.div>
  );
}

function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3.5rem] border-[10px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-slate-800 rounded-b-[1.5rem] z-30 flex items-center justify-center gap-2">
        <div className="w-10 h-1 bg-slate-700 rounded-full" />
        <div className="w-2 h-2 rounded-full bg-slate-700" />
      </div>
      {/* Screen Content */}
      <div className="h-full w-full bg-white relative z-10 pt-10">
        {children}
      </div>
      {/* Home Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-400/20 rounded-full z-30" />
      {/* Side Buttons */}
      <div className="absolute top-24 -left-[10px] w-1 h-12 bg-slate-800 rounded-r-sm z-20" />
      <div className="absolute top-40 -left-[10px] w-1 h-16 bg-slate-800 rounded-r-sm z-20" />
      <div className="absolute top-60 -left-[10px] w-1 h-16 bg-slate-800 rounded-r-sm z-20" />
      <div className="absolute top-32 -right-[10px] w-1 h-20 bg-slate-800 rounded-l-sm z-20" />
    </div>
  );
}

function BusinessDashboard() {
  const data = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      {/* App Header */}
      <div className="p-6 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">B</div>
          <Bell className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Dashboard</h3>
        <p className="text-xs text-slate-500">Welcome back, Alex</p>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <Banknote className="w-4 h-4 text-emerald-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Revenue</p>
          <p className="text-lg font-black text-slate-900">₦12,450</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <Users className="w-4 h-4 text-indigo-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Clients</p>
          <p className="text-lg font-black text-slate-900">482</p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 mb-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Weekly Growth</p>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 flex-1 overflow-hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Recent Sales</p>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Order #{1024 + i}</p>
                  <p className="text-[10px] text-slate-400">2 mins ago</p>
                </div>
              </div>
              <p className="text-xs font-black text-emerald-600">+₦240</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="p-4 bg-white border-t border-slate-100 flex justify-around items-center">
        <LayoutDashboard className="w-5 h-5 text-indigo-600" />
        <Package className="w-5 h-5 text-slate-300" />
        <ShoppingBag className="w-5 h-5 text-slate-300" />
        <Settings className="w-5 h-5 text-slate-300" />
      </div>
    </div>
  );
}

function IPhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-50 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-slate-950" />
        <div className="w-12 h-1 bg-slate-950 rounded-full" />
      </div>
      
      {/* Screen Content */}
      <div className="w-full h-full bg-white relative z-10">
        {children}
      </div>

      {/* Side Buttons */}
      <div className="absolute left-[-10px] top-24 w-[3px] h-12 bg-slate-700 rounded-r-sm" />
      <div className="absolute left-[-10px] top-40 w-[3px] h-16 bg-slate-700 rounded-r-sm" />
      <div className="absolute left-[-10px] top-60 w-[3px] h-16 bg-slate-700 rounded-r-sm" />
      <div className="absolute right-[-10px] top-32 w-[3px] h-24 bg-slate-700 rounded-l-sm" />
    </div>
  );
}

function Magnetic({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("perspective-1000", className)}
    >
      {children}
    </motion.div>
  );
}

function FloatingElement({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      animate={{ 
        y: [0, -15, 0],
        rotate: [0, 2, 0]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
      className={cn("absolute pointer-events-none", className)}
    >
      {children}
    </motion.div>
  );
}

// --- Auth Components ---

function LoginPage({ onLogin, onBack, onRegister }: { onLogin: () => void, onBack: () => void, onRegister: () => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex bg-white"
    >
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative">
        <button 
          onClick={onBack}
          className="absolute top-12 left-8 md:left-24 lg:left-32 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-200">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Welcome back</h2>
            <p className="text-slate-500 font-medium">Log in to your BinoManager account to manage your business.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="sarah@bakery.com"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 mt-4 active:scale-[0.98]"
            >
              Log In
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              Don't have an account? {' '}
              <button onClick={onRegister} className="text-indigo-600 font-black hover:underline">Create one for free</button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:block flex-1 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
          <div className="max-w-md">
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Trusted by 2,000+ businesses</span>
            </div>
            <h3 className="text-5xl font-black text-white mb-8 tracking-tight leading-tight">
              Manage your business <br />
              <span className="text-indigo-400">from anywhere.</span>
            </h3>
            <p className="text-slate-400 text-xl font-medium leading-relaxed mb-12">
              Join thousands of entrepreneurs who have simplified their operations with BinoManager.
            </p>
            
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase">Monthly Growth</p>
                    <p className="text-2xl font-black text-white">+24.8%</p>
                  </div>
                </div>
                <div className="h-24 w-full bg-white/5 rounded-2xl border border-white/5 flex items-end p-4 gap-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="flex-1 bg-indigo-500 rounded-t-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RegisterPage({ onRegister, onBack, onLogin }: { onRegister: () => void, onBack: () => void, onLogin: () => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex bg-white"
    >
      {/* Left Side: Visual */}
      <div className="hidden lg:block flex-1 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
          <div className="max-w-md">
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <span className="text-xs font-black text-white uppercase tracking-widest">14-day free trial</span>
            </div>
            <h3 className="text-5xl font-black text-white mb-8 tracking-tight leading-tight">
              Start your journey <br />
              <span className="text-indigo-400">today.</span>
            </h3>
            <p className="text-slate-400 text-xl font-medium leading-relaxed mb-12">
              Everything you need to manage stock, track expenses, and grow your business.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Inventory', icon: <Package className="w-5 h-5" /> },
                { label: 'Expenses', icon: <CreditCard className="w-5 h-5" /> },
                { label: 'Clients', icon: <Users className="w-5 h-5" /> },
                { label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <p className="font-black text-white">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative py-20">
        <button 
          onClick={onBack}
          className="absolute top-12 left-8 md:left-24 lg:left-32 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>

        <div className="max-w-xl w-full mx-auto">
          <div className="mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-200">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Create your account</h2>
            <p className="text-slate-500 font-medium">Join 2,000+ businesses scaling with BinoManager.</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); onRegister(); }}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Sarah Jenkins"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="sarah@bakery.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Business Name</label>
              <input 
                type="text" 
                required
                placeholder="Sarah's Bakery"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Subdomain</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  placeholder="sarah-bakery"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium pr-32"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">.binomanager.com</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account? {' '}
              <button onClick={onLogin} className="text-indigo-600 font-black hover:underline">Log in</button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Landing Sub-Pages ---

function FeaturesPage({ onBack, onNavigate }: { onBack: () => void, onNavigate: (v: any) => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="min-h-screen bg-white overflow-hidden"
    >
      <div className="pt-24 md:pt-40 pb-24 md:pb-40 px-4 max-w-7xl mx-auto relative">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="text-center mb-32 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <button 
              onClick={onBack} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mb-8 border border-slate-100"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> BACK TO HOME
            </button>
            <h1 className="text-7xl md:text-[140px] font-black text-slate-950 tracking-[-0.06em] mb-10 leading-[0.8]">
              Built for <br />
              <span className="text-indigo-600">Performance.</span>
            </h1>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Every feature is engineered to remove friction from your daily operations. 
              Manage your business with the precision of a high-performance machine.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-32">
          {/* Large Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 p-12 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-12 shadow-lg shadow-indigo-500/20">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black mb-6">Command Center Dashboard</h3>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-md mb-12">
                A unified view of your entire business. Track revenue, expenses, and inventory levels in real-time from a single, beautiful interface.
              </p>
              <div className="mt-auto">
                <img 
                  src="https://picsum.photos/seed/dashboard/800/400" 
                  alt="Dashboard Preview" 
                  className="rounded-2xl border border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>

          {/* Small Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Expense Mastery</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              Scan receipts and categorize expenses automatically. Tax season has never been this easy.
            </p>
          </motion.div>

          {/* Small Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:-rotate-6 transition-transform shadow-sm">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Smart Inventory</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              Predictive stock alerts ensure you never run out of your best-sellers.
            </p>
          </motion.div>

          {/* Medium Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-4 p-12 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col md:flex-row gap-12 items-center"
          >
            <div className="flex-1">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6">Client Relationship Management</h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Build lasting relationships with a CRM that tracks every interaction, purchase, and preference automatically.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      <img src={`https://picsum.photos/seed/user${i+10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Spotlight Section */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8">
                Spotlight
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 leading-[0.9]">
                Automate Your <br />
                <span className="text-indigo-600 italic">Workflows.</span>
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
                Stop doing the same tasks twice. BinoManager's automation engine handles invoice reminders, 
                stock updates, and client follow-ups so you can focus on the big picture.
              </p>
              <ul className="space-y-4">
                {[
                  "Automated invoice generation and tracking",
                  "Low stock notifications via email and push",
                  "Recurring expense logging",
                  "Client birthday and anniversary alerts"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-base font-bold text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-600/10 rounded-[4rem] blur-[80px] -z-10" />
              <img 
                src="https://picsum.photos/seed/automation/800/800" 
                alt="Automation Illustration" 
                className="rounded-[4rem] shadow-2xl border border-slate-100"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 md:p-16 rounded-[3rem] bg-slate-950 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
          <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10">Ready to level up?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of businesses scaling with BinoManager. Start your 14-day free trial today.
          </p>
          <button 
            onClick={() => onNavigate('register')}
            className="px-10 py-5 bg-white text-slate-950 rounded-full text-lg font-black hover:bg-indigo-500 hover:text-white transition-all relative z-10"
          >
            Get Started Now
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProcessPage({ onBack, onNavigate }: { onBack: () => void, onNavigate: (v: any) => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="min-h-screen bg-white overflow-hidden"
    >
      <div className="pt-24 md:pt-40 pb-24 md:pb-40 px-4 max-w-7xl mx-auto relative">
        {/* Decorative Orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-purple-50/30 rounded-full blur-[100px] -z-10" />

        <div className="text-center mb-32 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <button 
              onClick={onBack} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mb-8 border border-slate-100"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> BACK TO HOME
            </button>
            <h1 className="text-5xl md:text-7xl lg:text-[120px] font-black text-slate-950 tracking-[-0.06em] mb-8 leading-[0.8]">
              The Path <br />
              To Your <br />
              <span className="text-indigo-600 italic">Empire.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
              We've distilled business management into four simple, powerful steps. 
              No complexity, just pure execution.
            </p>
          </motion.div>
        </div>

        {/* Timeline Process */}
        <div className="relative space-y-32">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden lg:block" />

          {[
            { step: "01", title: "Claim Your Territory", desc: "Sign up in seconds and secure your unique business subdomain. This is your digital command center, accessible from anywhere in the world.", icon: <Globe className="w-12 h-12" />, color: "indigo" },
            { step: "02", title: "Map Your Assets", desc: "Import your existing inventory and client list. Our intelligent onboarding engine makes setup feel like magic, not work.", icon: <Zap className="w-12 h-12" />, color: "amber" },
            { step: "03", title: "Execute Operations", desc: "Start tracking sales, expenses, and team tasks. Everything is synced in real-time across all your devices, ensuring you're always in control.", icon: <LayoutDashboard className="w-12 h-12" />, color: "emerald" },
            { step: "04", title: "Scale with Data", desc: "Use our deep analytics to identify growth opportunities, optimize your stock, and automate your way to the top of your industry.", icon: <TrendingUp className="w-12 h-12" />, color: "purple" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative",
                i % 2 !== 0 && "lg:flex-row-reverse"
              )}
            >
              {/* Step Number Circle (Timeline Node) */}
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-4 border-slate-50 rounded-full z-10 hidden lg:flex items-center justify-center font-black text-slate-300">
                {item.step}
              </div>

              <div className="flex-1 w-full">
                <div className="group p-8 md:p-12 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                  <div className={cn(
                    "absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                    item.color === 'indigo' ? "bg-indigo-50" :
                    item.color === 'amber' ? "bg-amber-50" :
                    item.color === 'emerald' ? "bg-emerald-50" :
                    "bg-purple-50"
                  )} />
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500 shadow-xl",
                      item.color === 'indigo' ? "bg-indigo-600 text-white" :
                      item.color === 'amber' ? "bg-amber-500 text-white" :
                      item.color === 'emerald' ? "bg-emerald-600 text-white" :
                      "bg-purple-600 text-white"
                    )}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: "w-10 h-10" })}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                      <p className="text-slate-600 text-lg font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 hidden lg:block">
                <div className="text-[15rem] font-black text-slate-50 leading-none select-none opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                  {item.step}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us Section */}
        <section className="mt-40 text-center">
          <h2 className="text-5xl font-black text-slate-950 mb-20">Why founders <span className="text-indigo-600">choose us.</span></h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Zero Learning Curve", desc: "Intuitive design that feels familiar from day one." },
              { title: "Bank-Grade Security", desc: "Your data is encrypted and protected by the best." },
              { title: "24/7 Expert Support", desc: "We're here to help you scale, every step of the way." }
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4">{item.title}</h4>
                <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function PricingPage({ onBack, onNavigate, onGetStarted }: { onBack: () => void, onNavigate: (v: any) => void, onGetStarted: () => void, key?: string }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    { name: "Starter", price: billingCycle === 'monthly' ? "19,000" : "15,200", desc: "Perfect for new founders finding their feet.", features: ["Up to 100 Products", "Basic CRM", "Expense Tracking", "1 Subdomain", "Email Support"], color: "indigo" },
    { name: "Professional", price: billingCycle === 'monthly' ? "45,000" : "36,000", desc: "The sweet spot for growing businesses.", features: ["Unlimited Products", "Advanced CRM", "Financial Reports", "Team Access", "Priority Support"], popular: true, color: "indigo" },
    { name: "Enterprise", price: billingCycle === 'monthly' ? "95,000" : "76,000", desc: "For empires that need maximum power.", features: ["Multiple Businesses", "API Access", "Dedicated Support", "Custom Branding", "SLA Guarantee"], color: "slate" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="min-h-screen bg-white overflow-hidden"
    >
      <div className="pt-24 md:pt-40 pb-24 md:pb-40 px-4 max-w-7xl mx-auto relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50/30 rounded-full blur-[100px] -z-10" />

        <div className="text-center mb-20 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <button 
              onClick={onBack} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mb-8 border border-slate-100"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> BACK TO HOME
            </button>
            <h1 className="text-7xl md:text-[140px] font-black text-slate-950 tracking-[-0.06em] mb-10 leading-[0.8]">
              Simple. <br />
              Fair. <br />
              <span className="text-indigo-600 italic">Transparent.</span>
            </h1>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-16">
              Choose the plan that fits your ambition. Save 20% with yearly billing.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-full mb-12 relative">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-black transition-all relative z-10",
                  billingCycle === 'monthly' ? "text-white" : "text-slate-500"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-black transition-all relative z-10",
                  billingCycle === 'yearly' ? "text-white" : "text-slate-500"
                )}
              >
                Yearly
              </button>
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : '100%' }}
                className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-40">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className={cn(
                "p-8 md:p-10 rounded-[2.5rem] border flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-xl group", 
                plan.popular 
                  ? "bg-slate-950 text-white border-slate-950 shadow-2xl" 
                  : "bg-white border-slate-100 text-slate-900 shadow-sm"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                  MOST POPULAR
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className={cn("text-sm font-medium", plan.popular ? "text-slate-400" : "text-slate-500")}>
                  {plan.desc}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-xl font-black opacity-30">₦</span>
                <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{plan.price}</span>
                <span className="text-sm font-bold opacity-30">/mo</span>
              </div>
              
              <div className={cn("h-px w-full mb-8", plan.popular ? "bg-white/10" : "bg-slate-100")} />

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110", 
                      plan.popular ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                    )}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm md:text-base font-bold opacity-80">{f}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={onGetStarted} 
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95", 
                  plan.popular 
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20" 
                    : "bg-slate-950 text-white hover:bg-indigo-600"
                )}
              >
                Start Free Trial
              </button>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table (Simplified) */}
        <section className="mb-40 overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 text-center mb-16 md:mb-20">Compare <span className="text-indigo-600">Plans</span></h2>
          <div className="bg-slate-50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-slate-100 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 md:py-6 text-lg md:text-xl font-black text-slate-900">Feature</th>
                  <th className="py-4 md:py-6 text-lg md:text-xl font-black text-slate-900 text-center">Starter</th>
                  <th className="py-4 md:py-6 text-lg md:text-xl font-black text-slate-900 text-center">Professional</th>
                  <th className="py-4 md:py-6 text-lg md:text-xl font-black text-slate-900 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Inventory Items", s: "100", p: "Unlimited", e: "Unlimited" },
                  { name: "Team Members", s: "1", p: "Up to 10", e: "Unlimited" },
                  { name: "Subdomains", s: "1", p: "1", e: "Multiple" },
                  { name: "Analytics", s: "Basic", p: "Advanced", e: "Custom" },
                  { name: "Support", s: "Email", p: "Priority", e: "Dedicated" }
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white transition-colors">
                    <td className="py-4 md:py-6 font-bold text-slate-700 text-sm md:text-base">{row.name}</td>
                    <td className="py-4 md:py-6 text-center font-medium text-slate-600 text-sm md:text-base">{row.s}</td>
                    <td className="py-4 md:py-6 text-center font-medium text-slate-600 text-sm md:text-base">{row.p}</td>
                    <td className="py-4 md:py-6 text-center font-medium text-slate-600 text-sm md:text-base">{row.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section with Accordion */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-black text-slate-950 text-center mb-20">Frequently Asked <span className="text-indigo-600">Questions</span></h2>
          <div className="space-y-4">
            {[
              { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time from your dashboard settings. Changes take effect immediately." },
              { q: "Is there a long-term contract?", a: "No, all our plans are month-to-month or year-to-year. You can cancel whenever you want without any penalty." },
              { q: "Do you offer custom enterprise pricing?", a: "Absolutely. For businesses with unique needs, high volume, or multiple locations, contact our sales team for a custom quote." },
              { q: "What happens after my trial ends?", a: "You'll be prompted to choose a plan and enter your billing details to continue using BinoManager. Your data will be safe." }
            ].map((faq, i) => (
              <div key={i} className="rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xl font-black text-slate-900">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </motion.div>
                </button>
                <AnimatePresence mode="wait">
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-8 pt-0 text-slate-600 font-medium leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TestimonialsPage({ onBack, onNavigate }: { onBack: () => void, onNavigate: (v: any) => void, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="pt-32 md:pt-48 pb-40 px-4 max-w-7xl mx-auto"
    >
      <div className="text-center mb-20 md:mb-32">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-none">
          Trusted by <span className="text-indigo-600">thousands.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Hear from the entrepreneurs who are scaling their businesses with BinoManager.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { name: "Sarah Jenkins", role: "Bakery Owner", quote: "BinoManager transformed how I track my daily sales and inventory. I can finally focus on baking instead of spreadsheets!" },
          { name: "Marcus Chen", role: "Tech Retailer", quote: "The custom subdomain feature is a game changer. My team knows exactly where to go for everything, and our efficiency has doubled." },
          { name: "Elena Rodriguez", role: "Boutique Manager", quote: "Expense tracking used to be a nightmare. Now it takes me 5 minutes a day, and tax season is no longer a stress." },
          { name: "David Smith", role: "Coffee Shop Owner", quote: "The reports help me understand my busiest hours and manage staff better. It's the best investment I've made." },
          { name: "Aisha Bello", role: "Fashion Designer", quote: "Managing multiple clients and their custom orders was chaotic. BinoManager keeps everything organized in one place." },
          { name: "John Okafor", role: "Electronics Store", quote: "The inventory alerts have saved me from running out of stock during peak seasons. Highly recommended for any retailer." }
        ].map((t, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative group overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-[40px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-4 right-6 text-4xl font-black text-slate-50 group-hover:text-indigo-600/10 transition-colors duration-500 pointer-events-none leading-none">"</div>
            <p className="text-base md:text-lg font-medium text-slate-700 mb-8 leading-relaxed relative z-10 flex-1 italic">"{t.quote}"</p>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-100 shrink-0">{t.name[0]}</div>
              <div>
                <p className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{t.name}</p>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.15em]">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-32 p-12 rounded-[3rem] bg-slate-950 text-white text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.2),transparent_70%)]" />
        <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">Ready to be our next success story?</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">Join 2,000+ business owners who have simplified their operations with BinoManager.</p>
        <button 
          onClick={() => onNavigate('register')}
          className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 relative z-10 shadow-2xl shadow-indigo-500/20"
        >
          Get Started Now
        </button>
      </motion.div>
    </motion.div>
  );
}

// --- Dashboard Components ---

function Dashboard({ onLogout, activeTab, setActiveTab }: { onLogout: () => void, activeTab: string, setActiveTab: (t: any) => void, key?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen bg-slate-50 overflow-hidden font-sans relative"
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shrink-0 z-50 shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-10 flex items-center justify-between lg:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">BinoManager</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 ml-4">Main Menu</p>
          <SidebarLink icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<Package className="w-5 h-5" />} label="Inventory" active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<CreditCard className="w-5 h-5" />} label="Expenses" active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<Users className="w-5 h-5" />} label="Clients" active={activeTab === 'clients'} onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }} />
          <SidebarLink icon={<BarChart3 className="w-5 h-5" />} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }} />
          
          <div className="pt-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 ml-4">System</p>
            <SidebarLink icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
          </div>
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="bg-white/5 rounded-3xl p-6 mb-8">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Pro Plan</p>
            <p className="text-sm font-bold text-slate-300 mb-4">You're using 45% of your storage.</p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[45%]" />
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-4 text-slate-400 hover:text-white transition-all w-full px-4 py-3 rounded-2xl hover:bg-white/5 font-bold group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 md:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-12 shrink-0 z-10">
          <div className="flex items-center gap-3 md:gap-8 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 bg-slate-50 px-3 md:px-6 py-2 md:py-3 rounded-2xl w-full max-w-[400px] border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs md:text-sm w-full font-medium"
              />
            </div>
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-600">sarah-bakery.binomanager.com</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 ml-4">
            <div className="hidden sm:flex items-center gap-4">
              <button className="relative p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                <Bell className="w-6 h-6" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                <Zap className="w-6 h-6" />
              </button>
            </div>
            
            <div className="hidden sm:block h-10 w-px bg-slate-100" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-900">Sarah Jenkins</p>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Owner</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-600 border-4 border-indigo-50 shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-black text-base md:text-lg">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'inventory' && <InventoryTab />}
              {activeTab === 'expenses' && <ExpensesTab />}
              {activeTab === 'clients' && <ClientsTab />}
              {activeTab === 'reports' && <ReportsTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Welcome back, Sarah! 👋</h2>
          <p className="text-slate-500 font-medium mt-2">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
            Export Data
          </button>
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            + New Invoice
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Total Income" value="₦15,200" trend="+12.5%" color="emerald" />
        <StatCard icon={<Banknote className="w-6 h-6" />} label="Total Expenses" value="₦5,780" trend="-2.4%" color="rose" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Pending Invoices" value="₦3,250" trend="5 active" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Revenue Overview</h3>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Income vs Expenses</p>
            </div>
            <select className="w-full sm:w-auto bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-black text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all">
              <option>Last 7 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px' }} 
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="income" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={4} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-8">Recent Activity</h3>
          <div className="space-y-6 md:space-y-8">
            {[
              { icon: <CheckCircle2 className="w-5 h-5" />, label: "Sale Confirmed", time: "2m ago", color: "bg-emerald-50 text-emerald-600" },
              { icon: <Package className="w-5 h-5" />, label: "Inventory Updated", time: "15m ago", color: "bg-indigo-50 text-indigo-600" },
              { icon: <CreditCard className="w-5 h-5" />, label: "Expense Logged", time: "1h ago", color: "bg-rose-50 text-rose-600" },
              { icon: <Users className="w-5 h-5" />, label: "New Client Added", time: "3h ago", color: "bg-blue-50 text-blue-600" },
              { icon: <Bell className="w-5 h-5" />, label: "Low Stock Alert", time: "5h ago", color: "bg-amber-50 text-amber-600" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-5 group cursor-pointer">
                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", activity.color)}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{activity.label}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{activity.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all active:scale-95">
            View All Activity
          </button>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">Recent Transactions</h3>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Latest business spending</p>
          </div>
          <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-50 text-indigo-600 text-xs md:text-sm font-black rounded-xl hover:bg-indigo-50 transition-all active:scale-95">View All Transactions</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 md:px-10 py-4 md:py-6">Item / Description</th>
                <th className="px-6 md:px-10 py-4 md:py-6">Amount</th>
                <th className="px-6 md:px-10 py-4 md:py-6">Status</th>
                <th className="px-6 md:px-10 py-4 md:py-6 hidden md:table-cell">Date</th>
                <th className="px-6 md:px-10 py-4 md:py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 md:px-10 py-4 md:py-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Package className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <p className="text-xs md:text-sm font-black text-slate-900">{expense.item}</p>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6"><p className="font-black text-slate-900 text-base md:text-lg">₦{expense.amount}</p></td>
                  <td className="px-6 md:px-10 py-4 md:py-6">
                    <span className={cn(
                      "px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest", 
                      expense.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-xs md:text-sm font-bold text-slate-400 hidden md:table-cell">{expense.date}</td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><ChevronRight className="w-5 h-5 md:w-6 md:h-6" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryTab() {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-slate-500 font-medium mt-2">Manage your stock, products, and variants.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
            Import CSV
          </button>
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            + Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12 text-center py-20 md:py-32 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-50">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Your inventory is empty</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed text-sm md:text-base">
            Start adding products to track stock levels, manage variants, and get low-stock alerts automatically.
          </p>
          <button className="px-8 md:px-10 py-3.5 md:py-4 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            Create Your First Product
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpensesTab() {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Expenses</h2>
          <p className="text-slate-500 font-medium mt-2">Track your business spending and manage budgets.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
            Upload Receipt
          </button>
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            + Log Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12 text-center py-20 md:py-32 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-rose-50">
            <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-rose-600 transition-colors" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">No expenses logged yet</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed text-sm md:text-base">
            Keep your business finances healthy by tracking every naira spent. Log your first expense to see detailed analytics.
          </p>
          <button className="px-8 md:px-10 py-3.5 md:py-4 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            Log Your First Expense
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientsTab() {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Clients</h2>
          <p className="text-slate-500 font-medium mt-2">Manage your customer relationships and history.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
            Import Clients
          </button>
          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            + Add Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12 text-center py-20 md:py-32 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-blue-50">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Build your client database</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed text-sm md:text-base">
            Store contact details, purchase history, and preferences to provide a personalized experience for your customers.
          </p>
          <button className="px-8 md:px-10 py-3.5 md:py-4 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
            Add Your First Client
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Reports</h2>
          <p className="text-slate-500 font-medium mt-2">Analyze your business growth and performance.</p>
        </div>
        <button className="w-full md:w-auto px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
          Schedule Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
          { title: "Sales Performance", desc: "Detailed breakdown of revenue trends, top products, and peak sales hours.", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600" },
          { title: "Inventory Health", desc: "Analyze stock turnover, valuation, and identify slow-moving items.", icon: <Package className="w-6 h-6" />, color: "bg-indigo-50 text-indigo-600" },
          { title: "Expense Analysis", desc: "Categorized spending reports to help you identify cost-saving opportunities.", icon: <CreditCard className="w-6 h-6" />, color: "bg-rose-50 text-rose-600" },
          { title: "Client Insights", desc: "Track customer acquisition, retention rates, and lifetime value metrics.", icon: <Users className="w-6 h-6" />, color: "bg-blue-50 text-blue-600" }
        ].map((r, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className={cn("w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 transition-transform group-hover:scale-110", r.color)}>
              {r.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{r.title}</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mb-8">{r.desc}</p>
            <div className="flex items-center gap-2 text-xs md:text-sm font-black text-indigo-600 group-hover:gap-4 transition-all">
              Generate Report <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Settings</h2>
          <p className="text-slate-500 font-medium mt-2">Configure your business preferences and system settings.</p>
        </div>
        <button className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 rounded-2xl text-xs md:text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-10 border-b border-slate-50">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Business Profile</h3>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Public information</p>
            </div>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                  <input type="text" defaultValue="Sarah's Bakery" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Email</label>
                  <input type="email" defaultValue="hello@sarahbakery.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Description</label>
                <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none text-slate-700">Artisanal breads and pastries baked fresh daily in the heart of the city.</textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-10 border-b border-slate-50">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Custom Domain</h3>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Your unique business URL</p>
            </div>
            <div className="p-6 md:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                <Globe className="w-6 h-6 text-indigo-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">sarah-bakery.binomanager.com</p>
                  <p className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest mt-0.5">Active & Verified</p>
                </div>
                <button className="w-full sm:w-auto px-6 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-all">Change</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-10 border-b border-slate-50">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Notifications</h3>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Alert preferences</p>
            </div>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
              {[
                { label: "Email Alerts", desc: "Daily summary of sales" },
                { label: "Push Notifications", desc: "Real-time stock alerts" },
                { label: "SMS Updates", desc: "Critical system alerts" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div>
                    <p className="text-xs md:text-sm font-black text-slate-900">{item.label}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.desc}</p>
                  </div>
                  <div className="w-10 h-5 md:w-12 md:h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner shadow-indigo-900/20">
                    <div className="absolute right-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-50 rounded-[2rem] md:rounded-[2.5rem] border border-rose-100 p-8 md:p-10">
            <h3 className="text-lg md:text-xl font-black text-rose-900 mb-2">Danger Zone</h3>
            <p className="text-xs md:text-sm font-bold text-rose-600/60 mb-8 leading-relaxed">Once you delete your business, there is no going back. Please be certain.</p>
            <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95">
              Delete Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all w-full text-left group relative overflow-hidden",
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-0 bottom-0 w-1 bg-white"
        />
      )}
    </button>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
  }[color as 'emerald' | 'rose' | 'amber'];

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4 md:gap-8 group transition-all hover:shadow-xl"
    >
      <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 shadow-lg", colorClasses)}>
        <div className="scale-75 md:scale-100">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2 md:gap-3">
          <h4 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
          <span className={cn(
            "text-[9px] md:text-xs font-black px-1.5 md:px-2 py-0.5 rounded-lg", 
            color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          )}>
            {trend}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
