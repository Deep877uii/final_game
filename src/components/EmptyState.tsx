import type { ReactNode } from 'react';
import { Search, Inbox, Mail, History } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-leads' | 'no-emails' | 'no-history' | 'no-results' | 'custom';
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
}

export default function EmptyState({
  type = 'no-leads',
  title,
  description,
  icon: CustomIcon,
  action,
}: EmptyStateProps) {
  let DefaultIcon = Inbox;
  let defaultTitle = 'No items found';
  let defaultDesc = 'There is nothing to display right now.';

  if (type === 'no-leads') {
    DefaultIcon = Search;
    defaultTitle = 'No leads yet';
    defaultDesc = 'Start a new search to discover hiring opportunities and build your lead pipeline.';
  } else if (type === 'no-emails') {
    DefaultIcon = Mail;
    defaultTitle = 'No email generated yet';
    defaultDesc = 'Select a lead and generate a personalized outreach email to view it here.';
  } else if (type === 'no-history') {
    DefaultIcon = History;
    defaultTitle = 'No search history';
    defaultDesc = 'Your previous searches and queries will automatically appear here for quick access.';
  } else if (type === 'no-results') {
    DefaultIcon = Search;
    defaultTitle = 'No matching leads';
    defaultDesc = 'No leads match your current filter criteria. Try clearing some filters.';
  }

  const Icon = CustomIcon || DefaultIcon;

  return (
    <div className="bi-widget p-10 sm:p-14 text-center max-w-lg mx-auto border-dashed border-2">
      <div className="w-12 h-12 rounded-sm bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5 tracking-tight">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6 leading-relaxed">
        {description || defaultDesc}
      </p>
      {action && <div className="flex justify-center gap-3">{action}</div>}
    </div>
  );
}
