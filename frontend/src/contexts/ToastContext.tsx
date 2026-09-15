import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

interface ToastContextType {
  toast: (type: ToastMessage['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `t${Date.now()}${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-soft-lg border animate-slide-down min-w-[280px] max-w-[400px] ${
              t.type === 'success'
                ? 'bg-cinema-elevated border-emerald-500/30'
                : t.type === 'error'
                ? 'bg-cinema-elevated border-accent-destructive/30'
                : 'bg-cinema-elevated border-accent-primary/30'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-accent-destructive flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-accent-primary flex-shrink-0" />}
            <p className="text-sm text-text-primary flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
