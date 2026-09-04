import { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowUpRight,
  Radar,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import DashboardStats from '../components/DashboardStats';
import LeadDetails from '../components/LeadDetails';
import EmailComposer from '../components/EmailComposer';
import type { Lead } from '../types/lead';

export default function Dashboard() {
  const { leads, emailDraft, theme } = useApp();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [composerLead, setComposerLead] = useState<Lead | null>(null);



  // Leads-per-month chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { name: string; leads: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en', { month: 'short', day: '2-digit' });
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



  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5 mb-2">
        <div>
          <p className="text-xs uppercase tracking-[.16em] font-bold text-[var(--text-secondary)] mb-2">
            Overview
          </p>
          <h1 className="text-3xl font-bold tracking-[-.05em] m-0 text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="mt-2 mb-0 text-sm text-[var(--text-secondary)]">
            Your AI-powered lead generation command center
          </p>
        </div>
        <button
          onClick={() => navigate('/find-leads')}
          className="lime-button rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Find New Leads
        </button>
      </div>

      {/* KPI Stats */}
      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Scraper Status Card */}
        <section className="surface p-6">
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[.14em] font-bold text-[var(--text-secondary)] mb-1">
                AI Scraper
              </p>
              <h2 className="text-base font-bold m-0 text-[var(--text-primary)]">
                Lead Discovery Engine
              </h2>
            </div>
            <span className={`badge ${leads.length > 0 ? 'badge-emailed' : 'badge-new'} h-fit`}>
              {leads.length > 0 ? 'Active' : 'Idle'}
            </span>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-bg)] grid place-items-center text-[var(--color-primary)]">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm m-0 text-[var(--text-primary)]">
                LinkedIn hiring signal scan
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 mb-0">
                {leads.length > 0 ? `${leads.length} leads discovered` : 'Ready for your first scan'}
              </p>
            </div>
          </div>

          {leads.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[var(--text-secondary)]">Pipeline utilization</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {Math.min(Math.round((leads.length / 100) * 100), 100)}%
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-surface-hover)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-soft)] transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((leads.length / 100) * 100), 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] m-0">
                Quick action
              </p>
              <button
                onClick={() => navigate('/find-leads')}
                className="text-sm font-bold mt-1 mb-0 text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Find New Leads →
              </button>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
        </section>
      </div>

      {/* Leads Trend Chart */}
      {leads.length > 0 && (
        <section className="surface p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold m-0 text-[var(--text-primary)]">
                Lead Generation Trend
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Leads discovered per month
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--color-success)] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {leads.length} total
            </span>
          </div>

          <div className="chart-grid mt-4 h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme === 'dark' ? '#b9d654' : '#dff45a'} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={theme === 'dark' ? '#b9d654' : '#dff45a'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="var(--text-tertiary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-dropdown)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke={theme === 'dark' ? '#b9d654' : '#648f1e'}
                  strokeWidth={3}
                  fill="url(#areaFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

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
