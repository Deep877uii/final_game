import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, Sparkles, LayoutGrid, List, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LeadCard from '../components/LeadCard';
import LeadTable from '../components/LeadTable';
import LeadDetails from '../components/LeadDetails';
import EmailComposer from '../components/EmailComposer';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableSkeleton } from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import type { Lead } from '../types/lead';

export default function Outreach() {
  const {
    leads,
    leadsLoading,
    selectedLead,
    setSelectedLead,
    emailDraft,
    showLeadDetails,
    setShowLeadDetails,
    showEmailComposer,
    setShowEmailComposer,
    generateBulkEmails,
    sendBulkEmails,
  } = useApp();
  const navigate = useNavigate();

  const [view, setView] = useState<'grid' | 'table'>('table');
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);

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

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    try {
      await generateBulkEmails(outreachLeads);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleBulkSendConfirm = async () => {
    setIsBulkSending(true);
    try {
      await sendBulkEmails(outreachLeads);
      setShowSendAllConfirm(false);
    } finally {
      setIsBulkSending(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[var(--text-secondary)] mb-2">
            Campaigns
          </p>
          <h1 className="text-3xl font-bold tracking-[-.05em] m-0 text-[var(--text-primary)]">
            Email Campaigns
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 mb-0">
            Manage AI-personalized outreach for verified contacts
          </p>
        </div>

        {/* Actions & View Switcher */}
        {outreachLeads.length > 0 && (
          <div className="flex items-center gap-2 self-start flex-wrap">
            <button
              onClick={handleBulkGenerate}
              disabled={isBulkGenerating}
              className="soft-button inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
            >
              {isBulkGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate All</span>
            </button>
            <button
              onClick={() => setShowSendAllConfirm(true)}
              disabled={isBulkSending}
              className="lime-button inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
            >
              {isBulkSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send All</span>
            </button>

            {/* View Switcher */}
            <div className="flex items-center surface rounded-lg p-1 ml-2">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md transition-all text-sm ${
                  view === 'grid'
                    ? 'bg-[var(--color-primary-bg)] text-[var(--accent-mid)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-2 rounded-md transition-all text-sm ${
                  view === 'table'
                    ? 'bg-[var(--color-primary-bg)] text-[var(--accent-mid)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Outreach Leads Section */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
          Prospects Ready for Outreach
        </h2>

        {leadsLoading ? (
          <TableSkeleton rows={4} />
        ) : outreachLeads.length === 0 ? (
          <EmptyState
            type="no-emails"
            title="No outreach-ready prospects yet"
            description="Leads with verified contact emails will appear here automatically."
            action={
              <button
                onClick={() => navigate('/find-leads')}
                className="lime-button inline-flex items-center gap-2 px-5 py-2.5 text-sm"
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

      {/* Drawers */}
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

      {showEmailComposer && selectedLead && (
        <EmailComposer
          lead={selectedLead}
          initialDraft={emailDraft}
          onClose={() => {
            setShowEmailComposer(false);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSendAllConfirm}
        title={`Send ${outreachLeads.length} Emails?`}
        description="These emails will be dispatched sequentially using your connected outreach workflow. This action cannot be undone."
        confirmLabel={`Send ${outreachLeads.length} Emails`}
        cancelLabel="Cancel"
        variant="success"
        loading={isBulkSending}
        onConfirm={handleBulkSendConfirm}
        onCancel={() => setShowSendAllConfirm(false)}
      />
    </div>
  );
}
