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

  // Count how many of the selected leads already have generated emails ready to send
  const readyToSendCount = selectedLeads.filter((lead) => {
    const leadKey = lead.leadId || lead.postUrl || lead.name;
    const draft = generatedEmails[leadKey];
    return draft && draft.subject && draft.body && !sentLeadIds.includes(leadKey);
  }).length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto shadow-[var(--shadow-dropdown)]">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-sm p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
        {/* Selection Count & Status */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-6 h-6 rounded-sm bg-[var(--color-primary-bg)] text-[var(--color-primary)] font-bold flex items-center justify-center text-xs tabular-nums">
            {count}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
            {count} lead{count !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Progress Display */}
        {bulkProgress?.active && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs">
            <div className="w-3.5 h-3.5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-[var(--text-secondary)] font-medium">
              {bulkProgress.type === 'generate' ? 'Generating' : 'Sending'} {bulkProgress.current}/{bulkProgress.total}...
            </span>
            {bulkProgress.completed > 0 && (
              <span className="text-[var(--color-success)] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {bulkProgress.completed}
              </span>
            )}
            {bulkProgress.failed > 0 && (
              <span className="text-[var(--color-danger)] flex items-center gap-1 font-semibold">
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
            className="flex-1 sm:flex-none bi-button px-3.5 py-1.5 flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate All Emails</span>
          </button>

          <button
            type="button"
            onClick={onSendAll}
            disabled={readyToSendCount === 0 || bulkProgress?.inProgress}
            title={
              readyToSendCount === 0
                ? 'Generate emails for selected leads first before sending'
                : `Send ${readyToSendCount} generated email(s)`
            }
            className="flex-1 sm:flex-none bi-button !bg-[var(--color-success)] hover:!bg-[#0D6535] px-3.5 py-1.5 flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              Send All {readyToSendCount > 0 ? `(${readyToSendCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors ml-1"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
