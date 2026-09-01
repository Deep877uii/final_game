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
    bg: 'bg-[var(--bg-surface)] border-[var(--color-success)] shadow-md border-l-4',
    icon: 'text-[var(--color-success)] bg-[var(--color-success-bg)] border-[var(--color-success)]',
    close: 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
  },
  error: {
    bg: 'bg-[var(--bg-surface)] border-[var(--color-danger)] shadow-md border-l-4',
    icon: 'text-[var(--color-danger)] bg-[var(--color-danger-bg)] border-[var(--color-danger)]',
    close: 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
  },
  info: {
    bg: 'bg-[var(--bg-surface)] border-[var(--color-primary)] shadow-md border-l-4',
    icon: 'text-[var(--color-primary)] bg-[var(--color-primary-bg)] border-[var(--color-primary)]',
    close: 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
  },
  warning: {
    bg: 'bg-[var(--bg-surface)] border-[var(--color-warning)] shadow-md border-l-4',
    icon: 'text-[var(--color-warning)] bg-[var(--color-warning-bg)] border-[var(--color-warning)]',
    close: 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[110] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Info;
        const colors = colorMap[toast.type] || colorMap.info;

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-3.5 rounded-sm border
              toast-enter
              ${colors.bg}
            `}
            role="alert"
          >
            <div className={`w-7 h-7 rounded-sm border flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)] flex-1 leading-snug pt-0.5">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 p-1 rounded-sm transition-colors hover:bg-[var(--bg-surface-hover)] ${colors.close}`}
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
