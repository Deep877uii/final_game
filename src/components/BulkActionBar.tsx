import { Sparkles, Send, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Lead } from '../types/lead';

interface BulkActionBarProps {
  selectedLeads: Lead[];
  onGenerateAll: () => void;
  onSendAll: () => void;
  onClear: () => void;
}

export default function BulkActionBar({
  selectedLeads,
  onGenerateAll,
  onSendAll,
  onClear,
}: BulkActionBarProps) {
  const { generatedEmails, sentLeadIds, bulkProgress } = useApp();

  const count = selectedLeads.length;
  if (count === 0 && !bulkProgress?.active) return null;

  const readyToSendCount = selectedLeads.filter((lead) => {
    const leadKey = lead.leadId || lead.postUrl || lead.name;
    const draft = generatedEmails[leadKey];
    return draft && draft.subject && draft.body && !sentLeadIds.includes(leadKey);
  }).length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto">
      <div className="bg-[#eff8df] dark:bg-[rgba(223,244,90,.1)] border border-[var(--accent-soft)] rounded-xl p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 shadow-lg">
        {/* Selection Count */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-[var(--accent-deep)] font-bold flex items-center justify-center text-xs">
            {count}
          </div>
          <span className="text-sm font-bold text-[var(--accent-deep)] dark:text-[var(--accent)] whitespace-nowrap">
            {count} lead{count !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Progress */}
        {bulkProgress?.active && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 text-xs">
            <div className="w-3.5 h-3.5 border-2 border-[var(--accent-mid)] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-[var(--accent-deep)] dark:text-[var(--text-secondary)] font-medium">
              {bulkProgress.type === 'generate' ? 'Generating' : 'Sending'} {bulkProgress.current}/{bulkProgress.total}
            </span>
            {bulkProgress.completed > 0 && (
              <span className="text-[var(--color-success)] flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {bulkProgress.completed}
              </span>
            )}
            {bulkProgress.failed > 0 && (
              <span className="text-[var(--color-danger)] flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {bulkProgress.failed}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onGenerateAll}
            disabled={bulkProgress?.inProgress}
            className="flex-1 sm:flex-none lime-button px-3.5 py-2 flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate All
          </button>

          <button
            type="button"
            onClick={onSendAll}
            disabled={readyToSendCount === 0 || bulkProgress?.inProgress}
            title={
              readyToSendCount === 0
                ? 'Generate emails first'
                : `Send ${readyToSendCount} email(s)`
            }
            className="flex-1 sm:flex-none soft-button px-3.5 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-success)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            Send All {readyToSendCount > 0 ? `(${readyToSendCount})` : ''}
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-lg text-[var(--accent-deep)] dark:text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
