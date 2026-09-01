import { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import DashboardStats from '../components/DashboardStats';
import LeadCard from '../components/LeadCard';
import LeadDetails from '../components/LeadDetails';
import EmailComposer from '../components/EmailComposer';
import EmptyState from '../components/EmptyState';
import type { Lead } from '../types/lead';

export default function Dashboard() {
  const { leads, leadsLoading, generatedEmails, sentLeadIds, emailDraft, theme } = useApp();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [composerLead, setComposerLead] = useState<Lead | null>(null);

  // Recent leads (last 6)
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.postedAt || 0).getTime() -
          new Date(a.postedAt || 0).getTime()
      )
      .slice(0, 6);
  }, [leads]);

  // Leads-per-month chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { name: string; leads: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en', { month: 'short' });
      const count = leads.filter((l) => {
        if (!l.postedAt) return false;
        const ld = new Date(l.postedAt);
        return (
          ld.getFullYear() === d.getFullYear() &&
          ld.getMonth() === d.getMonth()
        );
      }).length;
      months.push({ name: monthName, leads: count });
    }
    return months;
  }, [leads]);

  // Quick-action summary stats
  const withEmail = leads.filter((l) => l.email && l.email.trim()).length;
  const genCount = Object.keys(generatedEmails).length;
  const sentCount = sentLeadIds.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Your AI-powered lead generation command center
          </p>
        </div>
        <button
          onClick={() => navigate('/find-leads')}
          className="bi-button flex items-center gap-2 px-4 py-2"
        >
          <Sparkles className="w-4 h-4" />
          Find New Leads
        </button>
      </div>

      {/* KPI Stats */}
      <DashboardStats />

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Leads Trend Chart */}
        <div className="lg:col-span-3 bi-widget p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Leads Trend
              </h2>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                Leads discovered per month
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2.5 py-1 rounded-sm">
              <TrendingUp className="w-3 h-3" />
              {leads.length} total
            </div>
          </div>

          <div className="h-56 mt-2">
            {leads.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme === 'dark' ? '#479EF5' : '#0078D4'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme === 'dark' ? '#479EF5' : '#0078D4'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#E5E5E5'} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={theme === 'dark' ? '#A0A0A0' : '#605E5C'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#A0A0A0' : '#605E5C'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '4px',
                      boxShadow: 'var(--shadow-dropdown)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                    itemStyle={{ color: 'var(--color-primary)' }}
                    labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke={theme === 'dark' ? '#479EF5' : '#0078D4'}
                    strokeWidth={2}
                    fill="url(#leadFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--text-tertiary)]">
                No lead data yet — start a search to populate the chart.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bi-widget p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight mb-4">
              Pipeline Snapshot
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: 'Ready for Outreach',
                  value: withEmail,
                  desc: 'leads with verified email',
                  color: 'text-[var(--color-bi-cyan)]',
                  bg: 'bg-[var(--color-primary-bg)]',
                },
                {
                  label: 'AI Drafts Created',
                  value: genCount,
                  desc: 'personalized emails',
                  color: 'text-[var(--color-bi-purple)]',
                  bg: 'bg-[var(--color-primary-bg)]',
                },
                {
                  label: 'Campaigns Delivered',
                  value: sentCount,
                  desc: 'emails dispatched',
                  color: 'text-[var(--color-success)]',
                  bg: 'bg-[var(--color-success-bg)]',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 px-4 rounded-sm border border-[var(--border-subtle)]"
                >
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-sm ${item.bg}`}>
                    <span className={`text-xl font-bold tabular-nums ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/outreach')}
            className="mt-5 w-full bi-button-secondary py-2 flex items-center justify-center gap-2"
          >
            View Outreach Pipeline
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            Recent Leads
          </h2>
          {leads.length > 6 && (
            <button
              onClick={() => navigate('/leads')}
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {leadsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bi-widget p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-11 h-11 rounded-sm flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-1/2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            type="no-leads"
            action={
              <button
                onClick={() => navigate('/find-leads')}
                className="bi-button flex items-center gap-2 px-5 py-2.5"
              >
                <Sparkles className="w-4 h-4" />
                Discover Your First Leads
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentLeads.map((lead) => (
              <LeadCard
                key={lead.leadId || lead.postUrl}
                lead={lead}
                onClick={setSelectedLead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lead Details Drawer */}
      {selectedLead && (
        <LeadDetails
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onGenerateMail={() => {
            setComposerLead(selectedLead);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Email Composer Modal */}
      {composerLead && (
        <EmailComposer
          lead={composerLead}
          initialDraft={emailDraft}
          onClose={() => setComposerLead(null)}
        />
      )}
    </div>
  );
}
