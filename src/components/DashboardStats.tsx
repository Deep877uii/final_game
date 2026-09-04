import { Users, UserCheck, Mail, Send, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const statConfig = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    icon: Users,
    change: '+18.4%',
    changeNote: 'this month',
  },
  {
    key: 'availableLeads',
    label: 'Email Available',
    icon: UserCheck,
    change: null,
    changeNote: 'leads with email',
  },
  {
    key: 'emailsGenerated',
    label: 'AI Drafts',
    icon: Mail,
    change: null,
    changeNote: 'personalized emails',
  },
  {
    key: 'emailsSent',
    label: 'Emails Sent',
    icon: Send,
    change: null,
    changeNote: 'dispatched',
  },
] as const;

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="surface metric-card">
          <div className="flex items-center justify-between mb-3">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton w-8 h-8 rounded-xl" />
          </div>
          <div className="skeleton h-8 w-20 rounded" />
          <div className="skeleton h-3 w-32 mt-3 rounded" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statConfig.map(({ key, label, icon: Icon, change, changeNote }) => (
        <article key={key} className="surface metric-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] m-0">
              {label}
            </p>
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-bg)] grid place-items-center text-[var(--color-primary)]">
              <Icon className="w-4 h-4" />
            </div>
          </div>

          <p className="metric-value text-[29px] font-bold m-0 text-[var(--text-primary)]">
            {values[key].toLocaleString()}
          </p>

          <p className="text-xs mt-2 mb-0 font-semibold">
            {change ? (
              <>
                <span className="text-[var(--color-success)] inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {change}
                </span>
                <span className="text-[var(--text-tertiary)] font-normal ml-1">{changeNote}</span>
              </>
            ) : (
              <span className="text-[var(--text-tertiary)] font-normal">{changeNote}</span>
            )}
            {connected && (
              <span className="inline-flex items-center gap-1 text-[var(--color-success)] ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              </span>
            )}
          </p>
        </article>
      ))}
    </div>
  );
}
