import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  AlertTriangle,
  LayoutGrid,
  List,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import LeadTable from '../components/LeadTable';
import LeadCard from '../components/LeadCard';
import LeadDetails from '../components/LeadDetails';
import EmailComposer from '../components/EmailComposer';
import FilterBar from '../components/FilterBar';
import BulkActionBar from '../components/BulkActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingState';
import type { Lead } from '../types/lead';

export default function Leads() {
  const {
    leads,
    leadsLoading,
    leadsError,
    refreshLeads,
    resetLeads,
    selectedLead,
    setSelectedLead,
    emailDraft,
    showLeadDetails,
    setShowLeadDetails,
    showEmailComposer,
    setShowEmailComposer,
    selectedLeadIds,
    clearSelection,

    setActiveWorkspaceLeadId,
    filterOptions,
    generateBulkEmails,
    sendBulkEmails,
    generatedEmails,
    sentLeadIds,
  } = useApp();

  const navigate = useNavigate();

  const [view, setView] = useState<'table' | 'grid'>(() => {
    return (localStorage.getItem('leadgen_lead_view') as 'table' | 'grid') || 'table';
  });
  const [activeTab, setActiveTab] = useState<'new' | 'contacted'>('new');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const [showBulkSendConfirm, setShowBulkSendConfirm] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);

  const handleViewChange = (newView: 'table' | 'grid') => {
    setView(newView);
    localStorage.setItem('leadgen_lead_view', newView);
  };

  const handleViewLead = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      setShowLeadDetails(true);
    },
    [setSelectedLead, setShowLeadDetails]
  );

  const handleGenerateMail = useCallback(
    (lead: Lead) => {
      const leadKey = lead.leadId || lead.postUrl || lead.name;
      setActiveWorkspaceLeadId(leadKey);
      setSelectedLead(lead);
      setShowLeadDetails(false);
      setShowEmailComposer(true);
    },
    [setSelectedLead, setShowLeadDetails, setShowEmailComposer, setActiveWorkspaceLeadId]
  );

  // Folder counts
  const { newLeadsCount, contactedLeadsCount } = useMemo(() => {
    let newCount = 0;
    let contactedCount = 0;
    leads.forEach((lead) => {
      const leadKey = lead.leadId || lead.postUrl || lead.name;
      const isSent = sentLeadIds.includes(leadKey) || generatedEmails[leadKey]?.status === 'sent';
      if (isSent) contactedCount++;
      else newCount++;
    });
    return { newLeadsCount: newCount, contactedLeadsCount: contactedCount };
  }, [leads, sentLeadIds, generatedEmails]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterOptions.query) {
        const q = filterOptions.query.toLowerCase();
        const matchesName = lead.name?.toLowerCase().includes(q);
        const matchesCompany = lead.company?.toLowerCase().includes(q);
        const matchesRole = lead.role?.toLowerCase().includes(q);
        const matchesJobTitle = lead.jobTitle?.toLowerCase().includes(q);
        const matchesLocation = lead.location?.toLowerCase().includes(q);
        const matchesEmail = lead.email?.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesCompany &&
          !matchesRole &&
          !matchesJobTitle &&
          !matchesLocation &&
          !matchesEmail
        ) {
          return false;
        }
      }
      if (filterOptions.company && lead.company !== filterOptions.company) return false;
      if (filterOptions.location && lead.location !== filterOptions.location) return false;
      if (filterOptions.source && lead.source !== filterOptions.source) return false;
      if (filterOptions.status === 'hasEmail' && !lead.email) return false;
      if (filterOptions.status === 'noEmail' && lead.email) return false;

      const leadKey = lead.leadId || lead.postUrl || lead.name;
      const draft = generatedEmails[leadKey];
      const isSent = sentLeadIds.includes(leadKey) || draft?.status === 'sent';
      const hasDraft = !!(draft?.subject || draft?.body);

      if (activeTab === 'new' && isSent) return false;
      if (activeTab === 'contacted' && !isSent) return false;
      if (filterOptions.status === 'generated' && !hasDraft) return false;
      if (filterOptions.status === 'sent' && !isSent) return false;

      return true;
    });
  }, [leads, filterOptions, generatedEmails, sentLeadIds, activeTab]);

  const selectedLeads = useMemo(() => {
    return leads.filter((l) =>
      selectedLeadIds.includes(l.leadId || l.postUrl || l.name)
    );
  }, [leads, selectedLeadIds]);


  const handleBulkGenerate = async (leadsToGenerate: Lead[] = selectedLeads) => {
    setIsBulkGenerating(true);
    try {
      await generateBulkEmails(leadsToGenerate.length > 0 ? leadsToGenerate : filteredLeads);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleBulkSendConfirm = async (leadsToSend: Lead[] = selectedLeads) => {
    setIsBulkSending(true);
    try {
      await sendBulkEmails(leadsToSend.length > 0 ? leadsToSend : filteredLeads);
      setShowSendAllConfirm(false);
      setShowBulkSendConfirm(false);
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleResetConfirm = () => {
    resetLeads();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-5 animate-fadeUp pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.17em] text-[var(--text-secondary)] mb-2">
            Pipeline
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-[-.05em] m-0 text-[var(--text-primary)]">
              Leads
            </h1>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[var(--color-primary-bg)] text-[var(--accent-mid)]">
              {filteredLeads.length} of {leads.length}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-2 mb-0">
            Review, filter, and manage outreach campaigns.
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 self-start flex-wrap">
          
          <button
            onClick={() => handleBulkGenerate(filteredLeads)}
            disabled={isBulkGenerating || filteredLeads.length === 0}
            className="soft-button inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
          >
            {isBulkGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate All</span>
          </button>
          
          <button
            onClick={() => setShowSendAllConfirm(true)}
            disabled={isBulkSending || filteredLeads.length === 0}
            className="lime-button inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
          >
            {isBulkSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send All</span>
          </button>

          {/* View Switcher */}
          <div className="flex items-center surface rounded-lg p-1 ml-2">
            <button
              onClick={() => handleViewChange('table')}
              className={`p-2 rounded-lg transition-all ${
                view === 'table'
                  ? 'bg-[var(--color-primary-bg)] text-[var(--accent-mid)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewChange('grid')}
              className={`p-2 rounded-lg transition-all ${
                view === 'grid'
                  ? 'bg-[var(--color-primary-bg)] text-[var(--accent-mid)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={refreshLeads}
            disabled={leadsLoading}
            className="soft-button inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab('new')}
          className={`tab-button px-4 py-3 text-sm font-semibold ${
            activeTab === 'new' ? 'active' : ''
          }`}
        >
          New Leads
          <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-lg ${
            activeTab === 'new' ? 'bg-[var(--color-primary-bg)] text-[var(--accent-mid)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)]'
          }`}>
            {newLeadsCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('contacted')}
          className={`tab-button px-4 py-3 text-sm font-semibold ${
            activeTab === 'contacted' ? 'active' : ''
          }`}
        >
          Contacted
          <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-lg ${
            activeTab === 'contacted' ? 'bg-[var(--color-primary-bg)] text-[var(--accent-mid)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)]'
          }`}>
            {contactedLeadsCount}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      {leads.length > 0 && (
        <FilterBar
          leads={leads}
          onResetLeadsPrompt={() => setShowResetConfirm(true)}
        />
      )}

      {/* Main Workspace Layout */}
      {leadsError ? (
        <div className="surface p-8 text-center max-w-md mx-auto border-l-4 border-l-[var(--color-danger)]">
          <AlertTriangle className="w-10 h-10 text-[var(--color-danger)] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Unable to load leads
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-5">{leadsError}</p>
          <button
            onClick={refreshLeads}
            className="lime-button inline-flex items-center justify-center gap-2 px-4 py-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      ) : leadsLoading ? (
        <TableSkeleton rows={6} />
      ) : leads.length === 0 ? (
        <EmptyState
          type="no-leads"
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
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          type="no-results"
          action={
            <button
              onClick={() => {}}
              className="soft-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 grid-cols-1">
          {/* Leads List */}
          <div className="w-full">
            {view === 'table' ? (
              <LeadTable
                leads={filteredLeads}
                onView={handleViewLead}
                onGenerateMail={handleGenerateMail}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.leadId || lead.postUrl || lead.name}
                    lead={lead}
                    onClick={(l) => {
                      handleViewLead(l);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedLeads={selectedLeads}
        onGenerateAll={() => handleBulkGenerate(selectedLeads)}
        onSendAll={() => setShowBulkSendConfirm(true)}
        onClear={clearSelection}
      />

      {/* Lead Details Drawer */}
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

      {/* Email Composer */}
      {showEmailComposer && selectedLead && (
        <EmailComposer
          lead={selectedLead}
          initialDraft={emailDraft}
          onClose={() => {
            setShowEmailComposer(false);
          }}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset Leads & Start Fresh?"
        description="This will remove the leads currently stored in this frontend session. You can discover new leads anytime by running a new search."
        confirmLabel="Reset Leads"
        cancelLabel="Keep Leads"
        variant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showSendAllConfirm}
        title={`Send ${filteredLeads.length} Emails?`}
        description="These emails will be dispatched sequentially using your connected outreach workflow. This action cannot be undone."
        confirmLabel={`Send ${filteredLeads.length} Emails`}
        cancelLabel="Cancel"
        variant="success"
        loading={isBulkSending}
        onConfirm={() => handleBulkSendConfirm(filteredLeads)}
        onCancel={() => setShowSendAllConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showBulkSendConfirm}
        title={`Send ${selectedLeads.length} Selected Emails?`}
        description="These emails will be dispatched sequentially. This action cannot be undone."
        confirmLabel={`Send ${selectedLeads.length} Emails`}
        cancelLabel="Cancel"
        variant="success"
        loading={isBulkSending}
        onConfirm={() => handleBulkSendConfirm(selectedLeads)}
        onCancel={() => setShowBulkSendConfirm(false)}
      />
    </div>
  );
}
