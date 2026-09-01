import { Eye, Mail, CheckCircle2, Sparkles } from 'lucide-react';
import type { Lead } from '../types/lead';
import { useApp } from '../context/AppContext';

function displayValue(val: string | null | undefined): string {
  return val?.trim() || '—';
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

interface LeadTableProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  onGenerateMail: (lead: Lead) => void;
}

export default function LeadTable({
  leads,
  onView,
  onGenerateMail,
}: LeadTableProps) {
  const {
    selectedLeadIds,
    toggleSelectLead,
    selectAllLeads,
    clearSelection,
    generatedEmails,
    sentLeadIds,
    activeWorkspaceLeadId,
    setActiveWorkspaceLeadId,
  } = useApp();

  const allSelected =
    leads.length > 0 &&
    leads.every((l) =>
      selectedLeadIds.includes(l.leadId || l.postUrl || l.name)
    );

  const someSelected =
    !allSelected &&
    leads.some((l) =>
      selectedLeadIds.includes(l.leadId || l.postUrl || l.name)
    );

  const handleHeaderCheckbox = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllLeads(leads.map((l) => l.leadId || l.postUrl || l.name));
    }
  };

  return (
    <div className="bi-widget overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bi-table-header">
              {/* Select All Checkbox */}
              <th className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleHeaderCheckbox}
                  className="w-4 h-4 rounded-sm text-[var(--color-primary)] border-[var(--border-strong)] bg-transparent focus:ring-[var(--color-primary)] cursor-pointer accent-[var(--color-primary)]"
                  aria-label="Select all leads"
                />
              </th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3 hidden md:table-cell">Company</th>
              <th className="px-4 py-3 hidden lg:table-cell">Role</th>
              <th className="px-4 py-3 hidden lg:table-cell">Location</th>
              <th className="px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 hidden xl:table-cell">Status</th>
              <th className="px-4 py-3 hidden 2xl:table-cell">Posted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {leads.map((lead) => {
              const leadKey = lead.leadId || lead.postUrl || lead.name;
              const isSelected = selectedLeadIds.includes(leadKey);
              const isActive = activeWorkspaceLeadId === leadKey;
              const draft = generatedEmails[leadKey];
              const isSent = sentLeadIds.includes(leadKey) || draft?.status === 'sent';
              const hasDraft = !!(draft?.subject || draft?.body);
              const isGenerating = draft?.status === 'generating';

              return (
                <tr
                  key={leadKey}
                  onClick={() => setActiveWorkspaceLeadId(leadKey)}
                  className={`bi-table-row cursor-pointer group ${
                    isActive
                      ? 'bg-[var(--color-primary-bg)]'
                      : isSelected
                      ? 'bg-[var(--bg-surface-hover)]'
                      : ''
                  }`}
                >
                  {/* Row Checkbox */}
                  <td
                    className="w-12 px-4 py-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectLead(leadKey);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded-sm text-[var(--color-primary)] border-[var(--border-strong)] bg-transparent focus:ring-[var(--color-primary)] cursor-pointer accent-[var(--color-primary)]"
                      aria-label={`Select ${lead.name}`}
                    />
                  </td>

                  {/* Lead Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(lead.name || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] truncate max-w-[150px] leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                          {displayValue(lead.name)}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] truncate max-w-[150px] md:hidden">
                          {displayValue(lead.company)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell font-medium text-xs">
                    <span className="truncate block max-w-[150px]">
                      {displayValue(lead.company)}
                    </span>
                  </td>

                  {/* Role / Job Title */}
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                    <span className="truncate block max-w-[160px]">
                      {displayValue(lead.jobTitle || lead.role)}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                    <span className="truncate block max-w-[130px]">
                      {displayValue(lead.location)}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 hidden sm:table-cell text-xs">
                    {lead.email ? (
                      <span className="text-[var(--text-secondary)] font-mono truncate block max-w-[170px]">
                        {lead.email}
                      </span>
                    ) : (
                      <span className="text-[var(--text-tertiary)] italic">Missing</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {isSent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)]">
                        <CheckCircle2 className="w-3 h-3" /> Sent
                      </span>
                    ) : hasDraft ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[var(--color-primary-bg)] text-[var(--color-bi-purple)]">
                        <Sparkles className="w-3 h-3" /> Draft
                      </span>
                    ) : isGenerating ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[var(--color-primary-bg)] text-[var(--color-primary)]">
                        <div className="w-2.5 h-2.5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                        Generating
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-secondary)]">
                        Ready
                      </span>
                    )}
                  </td>

                  {/* Posted Date */}
                  <td className="px-4 py-3 text-[var(--text-tertiary)] text-xs hidden 2xl:table-cell">
                    {formatDate(lead.postedAt)}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView(lead)}
                        className="bi-button-secondary px-2.5 py-1.5 flex items-center gap-1 text-xs"
                        aria-label={`View details for ${lead.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onGenerateMail(lead)}
                        disabled={isGenerating}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                          hasDraft
                            ? 'bg-[var(--color-primary-bg)] text-[var(--color-bi-purple)] hover:bg-[var(--color-primary-bg)]'
                            : 'bi-button'
                        }`}
                        aria-label={`Generate email for ${lead.name}`}
                      >
                        {isGenerating ? (
                          <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {hasDraft ? 'View Mail' : 'Generate'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
