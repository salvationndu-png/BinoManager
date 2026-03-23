import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Github, Chrome } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('admin@binomanager.io');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate a brief loading state for UI feel
    setTimeout(() => {
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-sa-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sa-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sa-card border border-sa-border mb-6 shadow-xl">
            <Shield className="text-sa-accent" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-sa-text">BinoManager</h1>
          <p className="text-sa-muted font-medium">Super Admin Control Plane</p>
        </div>

        <div className="bg-sa-card border border-sa-border rounded-3xl p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sa-muted" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sa-bg border border-sa-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sa-accent transition-all text-sa-text"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-sa-muted uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-sa-accent hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sa-muted" size={18} />
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  className="w-full bg-sa-bg border border-sa-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sa-accent transition-all text-sa-text"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-sa-accent text-sa-bg font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-sa-bg/30 border-t-sa-bg rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Console
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sa-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-sa-card px-4 text-sa-muted">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-sa-bg border border-sa-border py-2.5 rounded-xl text-xs font-bold hover:bg-sa-border hover:text-sa-text transition-colors text-sa-text">
              <Chrome size={16} />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-sa-bg border border-sa-border py-2.5 rounded-xl text-xs font-bold hover:bg-sa-border hover:text-sa-text transition-colors text-sa-text">
              <Github size={16} />
              GitHub
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-sa-muted">
          Protected by enterprise-grade encryption. <br />
          <span className="text-sa-accent cursor-pointer hover:underline">Privacy Policy</span> • <span className="text-sa-accent cursor-pointer hover:underline">Terms of Service</span>
        </p>
      </div>
    </div>
  );
};
