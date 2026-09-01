import { useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel, loading]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      btn: 'bg-[var(--color-danger)] hover:bg-[#C0392B] text-white',
      iconBg: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]',
      icon: AlertTriangle,
    },
    primary: {
      btn: 'bi-button',
      iconBg: 'bg-[var(--color-primary-bg)] text-[var(--color-primary)] border-[var(--color-primary)]',
      icon: AlertCircle,
    },
    success: {
      btn: 'bg-[var(--color-success)] hover:bg-[#0D6535] text-white',
      iconBg: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]',
      icon: AlertCircle,
    },
  }[variant];

  const IconComponent = variantStyles.icon;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current && !loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-sm shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-sm border flex items-center justify-center flex-shrink-0 ${variantStyles.iconBg}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <h3
              id="confirm-title"
              className="text-base font-bold text-[var(--text-primary)] tracking-tight"
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bi-button-secondary px-4 py-2 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-sm text-sm font-semibold transition-all duration-150 inline-flex items-center gap-2 ${variantStyles.btn} disabled:opacity-50`}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
