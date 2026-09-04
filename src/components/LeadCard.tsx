import {
  Building2,
  MapPin,
  Mail,
  Link,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import type { Lead } from '../types/lead';

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
  compact?: boolean;
}

export default function LeadCard({ lead, onClick, compact }: LeadCardProps) {
  const initials = lead.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const postedAgo = lead.postedAt
    ? (() => {
        const diff = Date.now() - new Date(lead.postedAt).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        return `${Math.floor(days / 30)}mo ago`;
      })()
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(lead)}
      className={`surface w-full text-left ${
        compact ? 'p-3.5' : 'p-4'
      } group cursor-pointer hover:border-[var(--accent-soft)] hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 rounded-full bg-[#dce8dd] dark:bg-[#2a3530] flex items-center justify-center font-bold text-[#385342] dark:text-[#9bad9f] ${
            compact ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm'
          }`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-semibold text-[var(--text-primary)] truncate leading-tight group-hover:text-[var(--accent-mid)] transition-colors ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {lead.name}
            </h3>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-mid)] flex-shrink-0 transition-all group-hover:translate-x-0.5" />
          </div>

          {lead.role && (
            <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
              {lead.role}
            </p>
          )}

          {/* Metadata Row */}
          <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--text-tertiary)] ${compact ? 'mt-1.5' : 'mt-2'}`}>
            {lead.company && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{lead.company}</span>
              </span>
            )}
            {lead.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{lead.location}</span>
              </span>
            )}
            {postedAgo && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {postedAgo}
              </span>
            )}
          </div>

          {/* Status Pills */}
          {!compact && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {lead.email ? (
                <span className="badge badge-emailed text-[10px] py-1 px-2">
                  <Mail className="w-3 h-3" /> Email
                </span>
              ) : (
                <span className="badge badge-new text-[10px] py-1 px-2">
                  <Mail className="w-3 h-3" /> No email
                </span>
              )}
              {lead.linkedinUrl && (
                <span className="badge badge-interested text-[10px] py-1 px-2">
                  <Link className="w-3 h-3" /> LinkedIn
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
