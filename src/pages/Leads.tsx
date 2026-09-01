import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  AlertTriangle,
  LayoutGrid,
  List,
  Columns2,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import LeadTable from '../components/LeadTable';
import LeadCard from '../components/LeadCard';
import LeadDetails from '../components/LeadDetails';
import EmailComposer from '../components/EmailComposer';
import MailWorkspace from '../components/MailWorkspace';
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
    activeWorkspaceLeadId,
    setActiveWorkspaceLeadId,
    filterOptions,
    generateBulkEmails,
    sendBulkEmails,
    generatedEmails,
    sentLeadIds,
  } = useApp();

  const navigate = useNavigate();

  // View state: 'table' | 'grid'
  const [view, setView] = useState<'table' | 'grid'>(() => {
    return (localStorage.getItem('leadgen_lead_view') as 'table' | 'grid') || 'table';
  });

  // Tab state: 'new' | 'contacted'
  const [activeTab, setActiveTab] = useState<'new' | 'contacted'>('new');

  // Split workspace panel toggle on large screens
  const [showSideWorkspace, setShowSideWorkspace] = useState(true);

  // Modals state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
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

  // Filter leads based on filterOptions and activeTab
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Query filter
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

      // Company filter
      if (filterOptions.company && lead.company !== filterOptions.company) {
        return false;
      }

      // Location filter
      if (filterOptions.location && lead.location !== filterOptions.location) {
        return false;
      }

      // Source filter
      if (filterOptions.source && lead.source !== filterOptions.source) {
        return false;
      }

      // Status filter
      if (filterOptions.status === 'hasEmail' && !lead.email) {
        return false;
      }
      if (filterOptions.status === 'noEmail' && lead.email) {
        return false;
      }

      const leadKey = lead.leadId || lead.postUrl || lead.name;
      const draft = generatedEmails[leadKey];
      const isSent = sentLeadIds.includes(leadKey) || draft?.status === 'sent';
      const hasDraft = !!(draft?.subject || draft?.body);

      // Folder Tab check
      if (activeTab === 'new' && isSent) {
        return false;
      }
      if (activeTab === 'contacted' && !isSent) {
        return false;
      }

      if (filterOptions.status === 'generated' && !hasDraft) {
        return false;
      }
      if (filterOptions.status === 'sent' && !isSent) {
        return false;
      }

      return true;
    });
  }, [leads, filterOptions, generatedEmails, sentLeadIds]);

  // Selected leads list
  const selectedLeads = useMemo(() => {
    return leads.filter((l) =>
      selectedLeadIds.includes(l.leadId || l.postUrl || l.name)
    );
  }, [leads, selectedLeadIds]);

  // Active lead for side workspace
  const activeWorkspaceLead = useMemo(() => {
    if (!activeWorkspaceLeadId) return filteredLeads[0] || null;
    return (
      leads.find(
        (l) => (l.leadId || l.postUrl || l.name) === activeWorkspaceLeadId
      ) ||
      filteredLeads[0] ||
      null
    );
  }, [activeWorkspaceLeadId, leads, filteredLeads]);

  // Bulk Actions
  const handleBulkGenerate = () => {
    generateBulkEmails(selectedLeads);
  };

  const handleBulkSendConfirm = async () => {
    setIsBulkSending(true);
    try {
      await sendBulkEmails(selectedLeads);
      setShowSendAllConfirm(false);
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleResetConfirm = () => {
    resetLeads();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-primary)] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Leads Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-sm text-xs font-bold bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {filteredLeads.length} of {leads.length}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Review, filter, generate outreach emails, and execute campaigns.
            </p>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 self-start flex-wrap">
          {/* Side-by-side workspace toggle (desktop only) */}
          <button
            type="button"
            onClick={() => setShowSideWorkspace((prev) => !prev)}
            className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border text-xs font-semibold transition-all ${
              showSideWorkspace
                ? 'bg-[var(--color-primary-bg)] border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
            title="Toggle side-by-side Email Workspace"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Email Workspace</span>
          </button>

          {/* Grid vs Table Switcher */}
          <div className="flex items-center border border-[var(--border-strong)] rounded-sm bg-[var(--bg-surface)] p-0.5">
            <button
              onClick={() => handleViewChange('table')}
              className={`p-1.5 rounded-sm transition-all ${
                view === 'table'
                  ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
              aria-label="Table view"
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewChange('grid')}
              className={`p-1.5 rounded-sm transition-all ${
                view === 'grid'
                  ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshLeads}
            disabled={leadsLoading}
            className="bi-button-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] pb-px">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'new'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
          }`}
        >
          New Leads
          <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-sm ${activeTab === 'new' ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)]'}`}>
            {newLeadsCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('contacted')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'contacted'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
          }`}
        >
          Contacted
          <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-sm ${activeTab === 'contacted' ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)]'}`}>
            {contactedLeadsCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {leads.length > 0 && (
        <FilterBar
          leads={leads}
          onResetLeadsPrompt={() => setShowResetConfirm(true)}
        />
      )}

      {/* Main Workspace Layout */}
      {leadsError ? (
        <div className="bi-widget p-8 text-center max-w-md mx-auto border-l-4 border-[var(--color-danger)]">
          <AlertTriangle className="w-10 h-10 text-[var(--color-danger)] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Unable to load leads
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-5">{leadsError}</p>
          <button
            onClick={refreshLeads}
            className="bi-button inline-flex items-center justify-center gap-2 px-4 py-2 text-xs"
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
              className="bi-button inline-flex items-center gap-2 px-5 py-2.5 text-xs"
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
              className="bi-button-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <div
          className={`grid gap-6 ${
            showSideWorkspace
              ? 'xl:grid-cols-12 xl:items-start'
              : 'grid-cols-1'
          }`}
        >
          {/* Left Column: Leads List (Table or Grid) */}
          <div
            className={
              showSideWorkspace ? 'xl:col-span-7 2xl:col-span-8' : 'w-full'
            }
          >
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

          {/* Right Column: Generated Email Workspace (Desktop) */}
          {showSideWorkspace && (
            <div className="hidden xl:block xl:col-span-5 2xl:col-span-4 sticky top-6 max-h-[calc(100vh-6rem)]">
              <MailWorkspace lead={activeWorkspaceLead} />
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedLeads={selectedLeads}
        onGenerateAll={handleBulkGenerate}
        onSendAll={() => setShowSendAllConfirm(true)}
        onClear={clearSelection}
      />

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

      {/* Email Composer Modal (for mobile or direct modal edit) */}
      {showEmailComposer && selectedLead && (
        <EmailComposer
          lead={selectedLead}
          initialDraft={emailDraft}
          onClose={() => {
            setShowEmailComposer(false);
          }}
        />
      )}

      {/* Reset Leads Confirmation Modal */}
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

      {/* Bulk Send Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSendAllConfirm}
        title={`Send ${selectedLeads.length} Emails?`}
        description="These emails will be dispatched sequentially using your connected outreach workflow. This action cannot be undone."
        confirmLabel={`Send ${selectedLeads.length} Emails`}
        cancelLabel="Cancel"
        variant="success"
        loading={isBulkSending}
        onConfirm={handleBulkSendConfirm}
        onCancel={() => setShowSendAllConfirm(false)}
      />
    </div>
  );
}
