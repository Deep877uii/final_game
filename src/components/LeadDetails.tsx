import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const leadKey = lead.leadId || lead.postUrl || lead.name;
  const draft = generatedEmails[leadKey];
  const isSent = sentLeadIds.includes(leadKey) || draft?.status === 'sent';
  const hasDraft = !!(draft?.subject || draft?.body);

  const initials = lead.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    // Trigger slide in
    requestAnimationFrame(() => setDrawerOpen(true));
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[80] drawer-backdrop ${drawerOpen ? 'open' : ''}`}
      style={{ background: 'rgba(21,32,25,.30)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Lead details for ${lead.name}`}
    >
      <div
        className={`lead-drawer ${drawerOpen ? 'open' : ''} fixed right-0 top-0 h-full w-full max-w-[540px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-xl flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold m-0 text-[var(--text-primary)]">Lead Profile</h2>
            {isSent ? (
              <span className="badge badge-emailed text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Sent
              </span>
            ) : hasDraft ? (
              <span className="badge badge-replied text-[10px]">
                <Sparkles className="w-3 h-3" /> Draft
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#dce8dd] dark:bg-[#2a3530] flex items-center justify-center text-lg font-bold text-[#385342] dark:text-[#9bad9f] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight m-0">
                {displayValue(lead.name)}
              </h3>
              <p className="text-sm text-[var(--accent-mid)] font-semibold mt-0.5 m-0">
                {displayValue(lead.role || lead.jobTitle)}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 m-0">
                {displayValue(lead.company)} · {displayValue(lead.location)}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 surface rounded-xl">
            <DetailItem icon={Briefcase} label="Job Title" value={displayValue(lead.jobTitle || lead.role)} />
            <DetailItem icon={Building2} label="Company" value={displayValue(lead.company)} />
            <DetailItem icon={MapPin} label="Location" value={displayValue(lead.location)} />
            <DetailItem icon={Mail} label="Email" value={displayValue(lead.email)} isMono={!!lead.email} />
            <DetailItem icon={Calendar} label="Date Posted" value={formatDate(lead.postedAt)} />
            <DetailItem icon={Sparkles} label="Lead Source" value={displayValue(lead.source)} />
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
              External References
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {lead.linkedinUrl && (
                <ExternalLinkCard icon={Link2} label="LinkedIn Profile" href={lead.linkedinUrl} />
              )}
              {lead.postUrl && (
                <ExternalLinkCard icon={FileText} label="LinkedIn Post" href={lead.postUrl} />
              )}
              {lead.companyWebsite && (
                <ExternalLinkCard icon={Globe} label="Company Website" href={lead.companyWebsite} />
              )}
            </div>
          </div>

          {/* Post Content */}
          {lead.postContent && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
                Original Hiring Post
              </h4>
              <div className="surface rounded-xl p-4 text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {lead.postContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 soft-button py-2.5 text-sm font-semibold rounded-xl"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onGenerateMail(lead)}
            className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl ${
              hasDraft
                ? 'soft-button text-[var(--color-purple)]'
                : 'lime-button'
            }`}
          >
            <Mail className="w-4 h-4" />
            {hasDraft ? 'Open Generated Mail' : 'Generate Outreach Mail'}
          </button>
        </div>
      </div>
    </div>,
    document.body
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
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
          {label}
        </p>
        <p
          className={`text-xs truncate m-0 ${
            isMono ? 'font-mono text-[var(--accent-mid)]' : 'font-medium text-[var(--text-primary)]'
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
      className="flex items-center gap-2.5 px-3 py-2 surface rounded-xl
        hover:border-[var(--accent-soft)] text-xs text-[var(--text-primary)] transition-all group"
    >
      <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-mid)] transition-colors flex-shrink-0" />
      <span className="flex-1 font-semibold truncate">{label}</span>
      <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-[var(--accent-mid)] transition-colors" />
    </a>
  );
}
