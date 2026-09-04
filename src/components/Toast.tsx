import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: {
    icon: 'text-[var(--color-success)] bg-[var(--color-success-bg)]',
  },
  error: {
    icon: 'text-[var(--color-danger)] bg-[var(--color-danger-bg)]',
  },
  info: {
    icon: 'text-[var(--color-info)] bg-[var(--color-info-bg)]',
  },
  warning: {
    icon: 'text-[var(--color-warning)] bg-[var(--color-warning-bg)]',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; type: string; message: string }; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const Icon = iconMap[toast.type as keyof typeof iconMap] || Info;
  const colors = colorMap[toast.type as keyof typeof colorMap] || colorMap.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--nav)] text-white shadow-lg transition-transform duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      role="alert"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium flex-1 leading-snug pt-1 text-gray-200">
        {toast.message}
      </p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
