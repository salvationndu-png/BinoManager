import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ message, onRetry, className = '' }: Props) => (
  <div className={`flex flex-col items-center justify-center py-20 gap-4 ${className}`}>
    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
      <AlertCircle size={24} className="text-red-400" />
    </div>
    <div className="text-center max-w-sm">
      <h3 className="font-bold text-base mb-1">Something went wrong</h3>
      <p className="text-sa-muted text-sm mb-4 break-words">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-sa-accent text-sa-bg rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors mx-auto"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  </div>
);
