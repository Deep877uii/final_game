import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Lead,
  Toast,
  EmailDraft,
  SearchHistoryItem,
  FilterOptions,
  BulkProgressState,
  AttachmentItem,
} from '../types/lead';
import {
  getLeads,
  checkConnection,
  generateEmail as apiGenerateEmail,
  sendEmail as apiSendEmail,
} from '../api/n8n';

export type Theme = 'light' | 'dark';

interface AppState {
  leads: Lead[];
  leadsLoading: boolean;
  leadsError: string | null;
  connected: boolean;
  toasts: Toast[];
  emailsSent: number;
  emailsGenerated: number;
  selectedLead: Lead | null;
  emailDraft: EmailDraft | null;
  showLeadDetails: boolean;
  showEmailComposer: boolean;

  // New state additions for UX & bulk operations
  selectedLeadIds: string[];
  generatedEmails: Record<string, EmailDraft>;
  sentLeadIds: string[];
  activeWorkspaceLeadId: string | null;
  bulkProgress: BulkProgressState | null;
  searchHistory: SearchHistoryItem[];
  filterOptions: FilterOptions;
  theme: Theme;
}

interface AppContextType extends AppState {
  refreshLeads: () => Promise<void>;
  resetLeads: () => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  incrementEmailsSent: () => void;
  incrementEmailsGenerated: () => void;
  setSelectedLead: (lead: Lead | null) => void;
  setEmailDraft: (draft: EmailDraft | null) => void;
  setShowLeadDetails: (show: boolean) => void;
  setShowEmailComposer: (show: boolean) => void;
  toggleTheme: () => void;

  // Selection methods
  toggleSelectLead: (leadId: string) => void;
  selectAllLeads: (leadIds?: string[]) => void;
  clearSelection: () => void;

  // Email & Draft methods
  setActiveWorkspaceLeadId: (leadId: string | null) => void;
  updateDraft: (
    leadId: string,
    draftUpdates: Partial<EmailDraft>
  ) => void;
  generateEmailForLead: (lead: Lead) => Promise<EmailDraft | null>;
  sendEmailForLead: (
    leadId: string,
    recipient: string,
    subject: string,
    body: string,
    attachments?: AttachmentItem[]
  ) => Promise<boolean>;
  generateBulkEmails: (leadsToProcess?: Lead[]) => Promise<void>;
  sendBulkEmails: (leadsToSend?: Lead[]) => Promise<{ sent: number; failed: number }>;

  // Filter & Search History
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  addSearchHistory: (item: SearchHistoryItem) => void;
}

const defaultFilters: FilterOptions = {
  query: '',
  company: '',
  role: '',
  location: '',
  source: '',
  status: 'all',
};

const AppContext = createContext<AppContextType | null>(null);

function parseGenerateResponse(result: unknown, lead: Lead): {
  success: boolean;
  subject: string;
  body: string;
  recipient: string;
  error?: string;
} {
  const data = (Array.isArray(result) ? result[0] : result) as Record<string, unknown>;

  let output: Record<string, unknown> | null = null;
  if (data?.output) {
    if (typeof data.output === 'object') {
      output = data.output as Record<string, unknown>;
    } else if (typeof data.output === 'string') {
      try {
        const parsed = JSON.parse(data.output as string);
        if (typeof parsed === 'object' && parsed !== null) {
          output = parsed;
        }
      } catch {
        output = { body: data.output };
      }
    }
  }

  const success = data?.success ?? true;
  const emailSubject = String(output?.subject || data?.subject || '');
  const emailBody = String(output?.body || data?.body || data?.message || data?.text || '');
  const emailRecipient = String(
    data?.recipient ||
      data?.recipientEmail ||
      output?.recipientEmail ||
      data?.email ||
      lead.email ||
      ''
  );

  return {
    success: success && (!!emailSubject || !!emailBody),
    subject: emailSubject,
    body: emailBody,
    recipient: emailRecipient,
    error: data?.error ? String(data.error) : undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [emailsSent, setEmailsSent] = useState(() => {
    const stored = localStorage.getItem('emailsSent');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [emailsGenerated, setEmailsGenerated] = useState(() => {
    const stored = localStorage.getItem('emailsGenerated');
    return stored ? parseInt(stored, 10) : 0;
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme');
      return (stored === 'dark' || stored === 'light') ? stored : 'light';
    } catch {
      return 'light';
    }
  });

  // New states
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [generatedEmails, setGeneratedEmails] = useState<Record<string, EmailDraft>>(() => {
    try {
      const stored = localStorage.getItem('leadgen_generated_emails');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [sentLeadIds, setSentLeadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('leadgen_sent_lead_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeWorkspaceLeadId, setActiveWorkspaceLeadId] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkProgressState | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilters);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('searchHistory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save drafts & sent IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('leadgen_generated_emails', JSON.stringify(generatedEmails));
    } catch {
      // Ignore quota errors
    }
  }, [generatedEmails]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('leadgen_sent_lead_ids', JSON.stringify(sentLeadIds));
    } catch {
      // Ignore quota errors
    }
  }, [sentLeadIds]);

  const addToast = useCallback(
    (type: Toast['type'], message: string) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const refreshLeads = useCallback(async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const data = await getLeads();
      setLeads(data);
      setConnected(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load leads';
      setLeadsError(message);
      setConnected(false);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const resetLeads = useCallback(() => {
    setLeads([]);
    setSelectedLeadIds([]);
    setSelectedLead(null);
    setEmailDraft(null);
    setActiveWorkspaceLeadId(null);
    setBulkProgress(null);
    addToast('info', 'Leads reset. Start a fresh search.');
  }, [addToast]);

  const incrementEmailsSent = useCallback(() => {
    setEmailsSent((prev) => {
      const next = prev + 1;
      localStorage.setItem('emailsSent', String(next));
      return next;
    });
  }, []);

  const incrementEmailsGenerated = useCallback(() => {
    setEmailsGenerated((prev) => {
      const next = prev + 1;
      localStorage.setItem('emailsGenerated', String(next));
      return next;
    });
  }, []);

  // Selection handlers
  const toggleSelectLead = useCallback((leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  }, []);

  const selectAllLeads = useCallback((leadIds?: string[]) => {
    if (leadIds) {
      setSelectedLeadIds(leadIds);
    } else {
      setSelectedLeadIds(leads.map((l) => l.leadId || l.postUrl || l.name));
    }
  }, [leads]);

  const clearSelection = useCallback(() => {
    setSelectedLeadIds([]);
  }, []);

  // Draft update handler
  const updateDraft = useCallback((leadId: string, draftUpdates: Partial<EmailDraft>) => {
    setGeneratedEmails((prev) => {
      const current = prev[leadId] || {
        leadId,
        recipient: '',
        subject: '',
        body: '',
        generatedAt: Date.now(),
        status: 'idle',
      };
      return {
        ...prev,
        [leadId]: {
          ...current,
          ...draftUpdates,
        },
      };
    });
  }, []);

  // Single email generate
  const generateEmailForLead = useCallback(
    async (lead: Lead): Promise<EmailDraft | null> => {
      const leadKey = lead.leadId || lead.postUrl || lead.name;
      updateDraft(leadKey, { status: 'generating' });

      try {
        const result = await apiGenerateEmail({
          leadId: lead.leadId,
          name: lead.name,
          company: lead.company,
          role: lead.role,
          email: lead.email,
          linkedinUrl: lead.linkedinUrl,
          postUrl: lead.postUrl,
          postContent: lead.postContent,
          jobTitle: lead.jobTitle,
          location: lead.location,
        });

        const parsed = parseGenerateResponse(result, lead);

        if (parsed.success) {
          const draft: EmailDraft = {
            leadId: lead.leadId,
            recipient: parsed.recipient,
            subject: parsed.subject,
            body: parsed.body,
            generatedAt: Date.now(),
            status: 'generated',
          };
          updateDraft(leadKey, draft);
          incrementEmailsGenerated();
          addToast('success', `Email generated for ${lead.name || 'lead'}.`);
          return draft;
        } else {
          const err = parsed.error || 'Failed to generate email';
          updateDraft(leadKey, { status: 'error', error: err });
          addToast('error', `Generation failed: ${err}`);
          return null;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed';
        updateDraft(leadKey, { status: 'error', error: message });
        addToast('error', `Generation failed: ${message}`);
        return null;
      }
    },
    [updateDraft, incrementEmailsGenerated, addToast]
  );

  // Single email send
  const sendEmailForLead = useCallback(
    async (
      leadId: string,
      recipient: string,
      subject: string,
      body: string,
      attachments?: AttachmentItem[]
    ): Promise<boolean> => {
      updateDraft(leadId, { status: 'sending' });

      try {
        const payloadAttachments = attachments?.filter((a) => a.base64).map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          base64: a.base64 as string,
        }));

        const result = await apiSendEmail({
          leadId,
          recipient: recipient.trim(),
          subject: subject.trim(),
          body: body.trim(),
          attachments: payloadAttachments && payloadAttachments.length > 0 ? payloadAttachments : undefined,
        });

        if (result.success) {
          updateDraft(leadId, { status: 'sent' });
          setSentLeadIds((prev) => (prev.includes(leadId) ? prev : [...prev, leadId]));
          incrementEmailsSent();
          addToast('success', `Email sent successfully to ${recipient.trim()}.`);
          return true;
        } else {
          const err = result.error || result.message || 'Failed to send email.';
          updateDraft(leadId, { status: 'error', error: err });
          addToast('error', `Send failed: ${err}`);
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send email.';
        updateDraft(leadId, { status: 'error', error: message });
        addToast('error', `Send failed: ${message}`);
        return false;
      }
    },
    [updateDraft, incrementEmailsSent, addToast]
  );

  // Bulk generate
  const generateBulkEmails = useCallback(
    async (leadsToProcess?: Lead[]) => {
      const targets = leadsToProcess || leads.filter((l) => selectedLeadIds.includes(l.leadId || l.postUrl || l.name));
      if (targets.length === 0) {
        addToast('warning', 'Please select at least one lead to generate emails.');
        return;
      }

      setBulkProgress({
        active: true,
        type: 'generate',
        current: 0,
        total: targets.length,
        completed: 0,
        failed: 0,
        inProgress: true,
      });

      let completed = 0;
      let failed = 0;

      for (let i = 0; i < targets.length; i++) {
        const lead = targets[i];
        setBulkProgress((prev) => prev ? { ...prev, current: i + 1 } : null);

        const res = await generateEmailForLead(lead);
        if (res) {
          completed++;
        } else {
          failed++;
        }

        setBulkProgress((prev) =>
          prev ? { ...prev, completed, failed } : null
        );
      }

      setBulkProgress((prev) =>
        prev ? { ...prev, inProgress: false } : null
      );

      addToast(
        failed === 0 ? 'success' : 'info',
        `Bulk generation finished: ${completed} generated, ${failed} failed.`
      );

      // Dismiss progress banner after 4s
      setTimeout(() => {
        setBulkProgress(null);
      }, 4000);
    },
    [leads, selectedLeadIds, generateEmailForLead, addToast]
  );

  // Bulk send
  const sendBulkEmails = useCallback(
    async (leadsToSend?: Lead[]): Promise<{ sent: number; failed: number }> => {
      const targets = leadsToSend || leads.filter((l) => selectedLeadIds.includes(l.leadId || l.postUrl || l.name));
      const readyToSend = targets.filter((lead) => {
        const leadKey = lead.leadId || lead.postUrl || lead.name;
        const draft = generatedEmails[leadKey];
        const recipient = draft?.recipient || lead.email;
        return (
          draft &&
          draft.subject &&
          draft.body &&
          recipient &&
          draft.status !== 'sent' &&
          !sentLeadIds.includes(leadKey)
        );
      });

      if (readyToSend.length === 0) {
        addToast('warning', 'No generated and unsent email drafts found for the selected leads.');
        return { sent: 0, failed: 0 };
      }

      setBulkProgress({
        active: true,
        type: 'send',
        current: 0,
        total: readyToSend.length,
        completed: 0,
        failed: 0,
        inProgress: true,
      });

      let sent = 0;
      let failed = 0;

      for (let i = 0; i < readyToSend.length; i++) {
        const lead = readyToSend[i];
        const leadKey = lead.leadId || lead.postUrl || lead.name;
        const draft = generatedEmails[leadKey];
        const recipient = (draft.recipient || lead.email || '').trim();

        setBulkProgress((prev) => prev ? { ...prev, current: i + 1 } : null);

        const ok = await sendEmailForLead(lead.leadId, recipient, draft.subject, draft.body, draft.attachments);
        if (ok) {
          sent++;
        } else {
          failed++;
        }

        setBulkProgress((prev) =>
          prev ? { ...prev, completed: sent, failed } : null
        );
      }

      setBulkProgress((prev) =>
        prev ? { ...prev, inProgress: false } : null
      );

      addToast(
        failed === 0 ? 'success' : 'info',
        `Bulk sending finished: ${sent} sent, ${failed} failed.`
      );

      setTimeout(() => {
        setBulkProgress(null);
      }, 4000);

      return { sent, failed };
    },
    [leads, selectedLeadIds, generatedEmails, sentLeadIds, sendEmailForLead, addToast]
  );

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
  }, []);

  const addSearchHistory = useCallback((item: SearchHistoryItem) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (h) => h.searchQuery !== item.searchQuery || h.location !== item.location
      );
      const updated = [item, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('searchHistory', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Initial connection check and leads load
  useEffect(() => {
    const init = async () => {
      const isConnected = await checkConnection();
      setConnected(isConnected);
      if (isConnected) {
        await refreshLeads();
      } else {
        setLeadsLoading(false);
        setLeadsError('Unable to connect to the lead service.');
      }
    };
    init();
  }, [refreshLeads]);

  return (
    <AppContext.Provider
      value={{
        leads,
        leadsLoading,
        leadsError,
        connected,
        toasts,
        emailsSent,
        emailsGenerated,
        selectedLead,
        emailDraft,
        showLeadDetails,
        showEmailComposer,
        selectedLeadIds,
        generatedEmails,
        sentLeadIds,
        activeWorkspaceLeadId,
        bulkProgress,
        searchHistory,
        filterOptions,
        theme,
        refreshLeads,
        resetLeads,
        addToast,
        removeToast,
        incrementEmailsSent,
        incrementEmailsGenerated,
        setSelectedLead,
        setEmailDraft,
        setShowLeadDetails,
        setShowEmailComposer,
        toggleTheme,
        toggleSelectLead,
        selectAllLeads,
        clearSelection,
        setActiveWorkspaceLeadId,
        updateDraft,
        generateEmailForLead,
        sendEmailForLead,
        generateBulkEmails,
        sendBulkEmails,
        setFilterOptions,
        resetFilters,
        addSearchHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
