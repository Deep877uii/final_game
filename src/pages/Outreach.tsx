import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Search, Send, Sparkles, LayoutGrid, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LeadCard from '../components/LeadCard';
import LeadTable from '../components/LeadTable';
import LeadDetails from '../components/LeadDetails';
import EmailComposer from '../components/EmailComposer';
import { TableSkeleton } from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import type { Lead } from '../types/lead';

export default function Outreach() {
  const {
    leads,
    leadsLoading,
    emailsGenerated,
    emailsSent,
    selectedLead,
    setSelectedLead,
    emailDraft,
    showLeadDetails,
    setShowLeadDetails,
    showEmailComposer,
    setShowEmailComposer,
  } = useApp();
  const navigate = useNavigate();

  const [view, setView] = useState<'grid' | 'table'>('grid');

  // Leads with valid email address
  const outreachLeads = leads.filter((l) => l.email && l.email.trim());

  const handleView = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      setShowLeadDetails(true);
    },
    [setSelectedLead, setShowLeadDetails]
  );

  const handleGenerateMail = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      setShowLeadDetails(false);
      setShowEmailComposer(true);
    },
    [setSelectedLead, setShowLeadDetails, setShowEmailComposer]
  );

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-primary)] flex items-center justify-center text-white">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Outreach Campaigns
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Review prospects with verified email contacts and manage outreach dispatches.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        {outreachLeads.length > 0 && (
          <div className="flex items-center border border-[var(--border-strong)] rounded-sm bg-[var(--bg-surface)] p-0.5 self-start">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-sm transition-all ${
                view === 'grid'
                  ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-sm transition-all ${
                view === 'table'
                  ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Campaign Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="bi-widget p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-primary-bg)] flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {outreachLeads.length}
            </p>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-wider">
              Verified Contacts
            </p>
          </div>
        </div>

        <div className="bi-widget p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-purple-bg)] flex items-center justify-center text-[var(--color-purple)] flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {emailsGenerated}
            </p>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-wider">
              AI Drafts Generated
            </p>
          </div>
        </div>

        <div className="bi-widget p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success)] flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {emailsSent}
            </p>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5 uppercase tracking-wider">
              Emails Dispatched
            </p>
          </div>
        </div>
      </div>

      {/* Outreach Leads Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">
          Prospects Ready for Outreach
        </h2>

        {leadsLoading ? (
          <TableSkeleton rows={4} />
        ) : outreachLeads.length === 0 ? (
          <EmptyState
            type="no-emails"
            title="No outreach-ready prospects yet"
            description="Leads with extracted contact email addresses will automatically appear here for personalized outreach."
            action={
              <button
                onClick={() => navigate('/find-leads')}
                className="bi-button inline-flex items-center gap-2 px-5 py-2.5 text-xs"
              >
                <Search className="w-4 h-4" />
                Find New Leads
              </button>
            }
          />
        ) : view === 'table' ? (
          <LeadTable
            leads={outreachLeads}
            onView={handleView}
            onGenerateMail={handleGenerateMail}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outreachLeads.map((lead) => (
              <LeadCard
                key={lead.leadId || lead.postUrl || lead.name}
                lead={lead}
                onClick={handleView}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <LeadDetails
          lead={selectedLead}
          onClose={() => {
            setShowLeadDetails(false);
            setSelectedLead(null);
          }}
          onGenerateMail={handleGenerateMail}
        />
      )}

      {/* Email Composer Modal */}
      {showEmailComposer && selectedLead && (
        <EmailComposer
          lead={selectedLead}
          initialDraft={emailDraft}
          onClose={() => {
            setShowEmailComposer(false);
          }}
        />
      )}
    </div>
  );
}
