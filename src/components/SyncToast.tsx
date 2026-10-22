import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { SyncStatus } from '../utils/scheduleSync';

interface SyncToastProps {
  status: SyncStatus | null;
  onDismiss: () => void;
  onReloadNow: () => void;
}

export const SyncToast: React.FC<SyncToastProps> = ({ status, onDismiss, onReloadNow }) => {
  if (!status || status.state === 'idle') return null;

  const isSpinning = status.state === 'starting' || status.state === 'running';
  const isSuccess = status.state === 'success';
  const isError = status.state === 'error';

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div 
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
          isSuccess
            ? 'bg-emerald-950/90 text-white border-emerald-500/50 shadow-emerald-950/50 ring-2 ring-emerald-500/30'
            : isError
            ? 'bg-rose-950/90 text-white border-rose-500/50 shadow-rose-950/50 ring-2 ring-rose-500/30'
            : 'bg-slate-900/95 text-white border-brand-500/50 shadow-brand-950/50 ring-2 ring-brand-500/30'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isSpinning && (
              <div className="p-2 rounded-xl bg-brand-500/20 text-amber-300">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
              </div>
            )}
            {isError && (
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm leading-snug">
                {status.title}
              </h4>
              {isError && (
                <button
                  onClick={onDismiss}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {status.message}
            </p>

            {/* Success reload button */}
            {isSuccess && (
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-500/30">
                <span className="text-[11px] text-emerald-200 font-mono">
                  {status.countdown ? `Автоперезагрузка: ${status.countdown}с` : 'Готово'}
                </span>
                <button
                  onClick={onReloadNow}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all shadow-sm"
                >
                  <span>Обновить сейчас</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
