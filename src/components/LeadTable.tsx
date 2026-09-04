import { Eye, Mail } from 'lucide-react';
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(isSent: boolean, hasDraft: boolean, isGenerating: boolean) {
  if (isSent) return <span className="badge badge-emailed">Sent</span>;
  if (isGenerating) return <span className="badge badge-generated">Generating</span>;
  if (hasDraft) return <span className="badge badge-replied">Draft Ready</span>;
  return <span className="badge badge-new">New</span>;
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
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-[var(--bg-surface-hover)] text-left text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            <tr>
              <th className="p-4 w-11">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleHeaderCheckbox}
                  className="w-4 h-4 cursor-pointer accent-[var(--accent-mid)]"
                  aria-label="Select all leads"
                />
              </th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Company</th>
              <th className="p-4 font-semibold hidden lg:table-cell">Job role</th>
              <th className="p-4 font-semibold hidden sm:table-cell">Email</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold hidden xl:table-cell">Posted</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
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
                  className={`table-row border-t border-[var(--border-subtle)] ${
                    isActive
                      ? 'bg-[var(--color-primary-bg)]'
                      : isSelected
                      ? 'bg-[var(--bg-surface-hover)]'
                      : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className="p-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectLead(leadKey);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 cursor-pointer accent-[var(--accent-mid)]"
                      aria-label={`Select ${lead.name}`}
                    />
                  </td>

                  {/* Name */}
                  <td className="p-4 font-bold text-[var(--text-primary)]">
                    {displayValue(lead.name)}
                  </td>

                  {/* Company */}
                  <td className="p-4 text-[var(--text-secondary)]">
                    {displayValue(lead.company)}
                  </td>

                  {/* Role */}
                  <td className="p-4 text-[var(--text-secondary)] hidden lg:table-cell">
                    {displayValue(lead.jobTitle || lead.role)}
                  </td>

                  {/* Email */}
                  <td className="p-4 hidden sm:table-cell">
                    {lead.email ? (
                      <span className="text-[var(--text-secondary)] font-mono text-xs">
                        {lead.email}
                      </span>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {getStatusBadge(isSent, hasDraft, isGenerating)}
                  </td>

                  {/* Posted */}
                  <td className="p-4 text-[var(--text-secondary)] hidden xl:table-cell">
                    {formatDate(lead.postedAt)}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView(lead)}
                        className="soft-button px-2.5 py-1.5 flex items-center gap-1 text-xs font-semibold rounded-lg"
                        aria-label={`View ${lead.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onGenerateMail(lead)}
                        disabled={isGenerating}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          hasDraft
                            ? 'soft-button text-[var(--color-purple)]'
                            : 'lime-button'
                        }`}
                        aria-label={`Generate email for ${lead.name}`}
                      >
                        {isGenerating ? (
                          <div className="w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {hasDraft ? 'Mail' : 'Generate'}
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
