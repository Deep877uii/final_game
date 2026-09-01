import { Users, Mail, Send, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const statConfig = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    icon: Users,
    colorClass: 'text-[var(--color-primary)]',
    bgClass: 'bg-[var(--color-primary-bg)]',
    description: 'Scraped & tracked leads',
  },
  {
    key: 'availableLeads',
    label: 'Email Available',
    icon: UserCheck,
    colorClass: 'text-[var(--color-bi-cyan)]',
    bgClass: 'bg-[var(--color-primary-bg)]',
    description: 'Leads with contact email',
  },
  {
    key: 'emailsGenerated',
    label: 'Emails Generated',
    icon: Mail,
    colorClass: 'text-[var(--color-bi-purple)]',
    bgClass: 'bg-[var(--color-primary-bg)]',
    description: 'AI-tailored outreach drafts',
  },
  {
    key: 'emailsSent',
    label: 'Emails Sent',
    icon: Send,
    colorClass: 'text-[var(--color-success)]',
    bgClass: 'bg-[var(--color-success-bg)]',
    description: 'Campaign emails dispatched',
  },
] as const;

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bi-widget p-5 space-y-3">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardStats() {
  const { leads, leadsLoading, emailsGenerated, emailsSent, connected } = useApp();

  if (leadsLoading) {
    return <StatsSkeleton />;
  }

  const values: Record<string, number> = {
    totalLeads: leads.length,
    availableLeads: leads.filter((l) => l.email && l.email.trim()).length,
    emailsGenerated,
    emailsSent,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon, colorClass, bgClass, description }) => (
        <div
          key={key}
          className="bi-widget p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {label}
              </span>
              <div
                className={`w-8 h-8 rounded-sm ${bgClass} flex items-center justify-center ${colorClass}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>

            <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight tabular-nums">
              {values[key].toLocaleString()}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span>{description}</span>
            {connected && (
              <span className="inline-flex items-center gap-1 text-[var(--color-success)] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
