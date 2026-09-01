import { useEffect, useRef } from 'react';
import {
  X,
  Building2,
  MapPin,
  Mail,
  Calendar,
  Briefcase,
  Globe,
  ExternalLink,
  Link2,
  FileText,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { Lead } from '../types/lead';
import { useApp } from '../context/AppContext';

function displayValue(val: string | null | undefined): string {
  return val?.trim() || 'Not available';
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not available';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
  onGenerateMail: (lead: Lead) => void;
}

export default function LeadDetails({
  lead,
  onClose,
  onGenerateMail,
}: LeadDetailsProps) {
  const { generatedEmails, sentLeadIds } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);

  const leadKey = lead.leadId || lead.postUrl || lead.name;
  const draft = generatedEmails[leadKey];
  const isSent = sentLeadIds.includes(leadKey) || draft?.status === 'sent';
  const hasDraft = !!(draft?.subject || draft?.body);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Lead details for ${lead.name}`}
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-sm shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-strong)] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Lead Profile</h2>
            {isSent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)] uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Email Sent
              </span>
            ) : hasDraft ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[var(--color-purple-bg)] text-[var(--color-purple)] border border-[var(--color-purple)] uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Draft Ready
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Close lead details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-sm bg-[var(--color-primary-bg)] border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] text-xl font-bold flex-shrink-0">
              {(lead.name || '?')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                {displayValue(lead.name)}
              </h3>
              <p className="text-sm text-[var(--color-primary)] font-semibold mt-0.5">
                {displayValue(lead.role || lead.jobTitle)}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {displayValue(lead.company)} · {displayValue(lead.location)}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-sm bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
            <DetailItem
              icon={Briefcase}
              label="Job Title"
              value={displayValue(lead.jobTitle || lead.role)}
            />
            <DetailItem
              icon={Building2}
              label="Company"
              value={displayValue(lead.company)}
            />
            <DetailItem
              icon={MapPin}
              label="Location"
              value={displayValue(lead.location)}
            />
            <DetailItem
              icon={Mail}
              label="Email"
              value={displayValue(lead.email)}
              isMono={!!lead.email}
            />
            <DetailItem
              icon={Calendar}
              label="Date Posted"
              value={formatDate(lead.postedAt)}
            />
            <DetailItem
              icon={Sparkles}
              label="Lead Source"
              value={displayValue(lead.source)}
            />
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-1">
              External References
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {lead.linkedinUrl && (
                <ExternalLinkCard
                  icon={Link2}
                  label="LinkedIn Profile"
                  href={lead.linkedinUrl}
                />
              )}
              {lead.postUrl && (
                <ExternalLinkCard
                  icon={FileText}
                  label="LinkedIn Post"
                  href={lead.postUrl}
                />
              )}
              {lead.companyWebsite && (
                <ExternalLinkCard
                  icon={Globe}
                  label="Company Website"
                  href={lead.companyWebsite}
                />
              )}
            </div>
          </div>

          {/* Post Content */}
          {lead.postContent && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-1">
                Original Post Content
              </h4>
              <div className="bg-[var(--bg-surface-hover)] rounded-sm border border-[var(--border-subtle)] p-4 text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mt-2 custom-scrollbar">
                {lead.postContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--bg-surface)] border-t border-[var(--border-strong)] px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bi-button-secondary py-2.5 text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onGenerateMail(lead)}
            className={`flex-1 bi-button py-2.5 text-xs flex items-center justify-center gap-2 ${
              hasDraft
                ? '!bg-[var(--color-purple-bg)] !text-[var(--color-purple)] hover:!bg-[var(--color-purple-bg)] hover:brightness-110 !border !border-[var(--color-purple)]'
                : ''
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{hasDraft ? 'Open Generated Mail' : 'Generate Outreach Mail'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  isMono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-xs text-[var(--text-primary)] truncate ${
            isMono ? 'font-mono text-[var(--color-primary)]' : 'font-medium'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ExternalLinkCard({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-2 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]
        hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] text-xs text-[var(--text-primary)] transition-all duration-150 group"
    >
      <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
      <span className="flex-1 font-semibold truncate">{label}</span>
      <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors" />
    </a>
  );
}
