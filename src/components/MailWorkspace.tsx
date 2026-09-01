import { useState, useRef } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  Paperclip,
  X,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Lead, AttachmentItem } from '../types/lead';

interface MailWorkspaceProps {
  lead: Lead | null;
  onClose?: () => void;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function MailWorkspace({ lead, onClose }: MailWorkspaceProps) {
  if (!lead) {
    return (
      <div className="h-full bi-widget p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-sm bg-[var(--color-primary-bg)] border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          Select a Lead to View Email
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Click on any lead in the table or card view to preview, generate, and edit personalized outreach emails.
        </p>
      </div>
    );
  }

  // Key the inner editor by leadKey so switching leads immediately mounts a fresh instance
  const leadKey = lead.leadId || lead.postUrl || lead.name;
  return <MailEditorPanel key={leadKey} lead={lead} leadKey={leadKey} onClose={onClose} />;
}

function MailEditorPanel({
  lead,
  leadKey,
  onClose,
}: {
  lead: Lead;
  leadKey: string;
  onClose?: () => void;
}) {
  const {
    generatedEmails,
    updateDraft,
    generateEmailForLead,
    sendEmailForLead,
    sentLeadIds,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendClickedRef = useRef(false);

  const currentDraft = generatedEmails[leadKey];
  const isSent = sentLeadIds.includes(leadKey) || currentDraft?.status === 'sent';

  const [recipient, setRecipient] = useState(
    currentDraft?.recipient || lead.email || ''
  );
  const [subject, setSubject] = useState(currentDraft?.subject || '');
  const [body, setBody] = useState(currentDraft?.body || '');
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    currentDraft?.attachments || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Handle local edits & persist to context draft
  const handleRecipientChange = (val: string) => {
    setRecipient(val);
    updateDraft(leadKey, { recipient: val });
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    updateDraft(leadKey, { subject: val });
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    updateDraft(leadKey, { body: val });
  };

  // Attachments handler with Base64 conversion
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newAttachments: AttachmentItem[] = [];

    for (const f of fileList) {
      try {
        const base64 = await readFileAsBase64(f);
        newAttachments.push({
          id: Date.now() + Math.random().toString(36).slice(2),
          name: f.name,
          size: f.size,
          type: f.type,
          base64,
        });
      } catch (err) {
        console.error('Failed to read file as base64', err);
      }
    }

    const updated = [...attachments, ...newAttachments];
    setAttachments(updated);
    updateDraft(leadKey, { attachments: updated });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    const updated = attachments.filter((a) => a.id !== id);
    setAttachments(updated);
    updateDraft(leadKey, { attachments: updated });
  };

  // Generate Email
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateEmailForLead(lead);
      if (draft) {
        setRecipient(draft.recipient);
        setSubject(draft.subject);
        setBody(draft.body);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Send Email
  const handleSend = async () => {
    if (sendClickedRef.current || isSending) return;
    sendClickedRef.current = true;

    const errs: Record<string, string> = {};
    if (!recipient.trim()) {
      errs.recipient = 'Recipient email is required.';
    } else if (!validateEmail(recipient.trim())) {
      errs.recipient = 'Please enter a valid email address.';
    }
    if (!subject.trim()) {
      errs.subject = 'Subject is required.';
    }
    if (!body.trim()) {
      errs.body = 'Email body is required.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      sendClickedRef.current = false;
      return;
    }

    setIsSending(true);
    try {
      await sendEmailForLead(lead.leadId, recipient.trim(), subject.trim(), body.trim(), attachments);
    } finally {
      setIsSending(false);
      sendClickedRef.current = false;
    }
  };

  const hasDraft = !!(subject || body);

  return (
    <div className="h-full bi-widget flex flex-col overflow-hidden">
      {/* Lead Top Banner in Workspace */}
      <div className="px-5 py-4 border-b border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-primary-bg)] border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm flex-shrink-0">
            {(lead.name || '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                {lead.name}
              </h3>
              {isSent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)] uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Sent
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {lead.role} · {lead.company}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Close workspace"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--bg-body)]">
        {!hasDraft && !isGenerating ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-sm bg-[var(--color-purple-bg)] border border-[var(--color-purple)] flex items-center justify-center mx-auto text-[var(--color-purple)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                No Email Draft Yet
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-1">
                Generate an AI-personalized email tailored to {lead.name}'s role and background.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bi-button inline-flex items-center gap-2 px-5 py-2.5 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              Generate Outreach Email
            </button>
          </div>
        ) : isGenerating ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Generating tailored email with AI...
            </p>
          </div>
        ) : (
          <>
            {/* Recipient */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                Recipient Email
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => handleRecipientChange(e.target.value)}
                placeholder="lead@company.com"
                className={`w-full bi-input px-3.5 py-2 text-xs transition-all duration-150 ${
                  errors.recipient
                    ? '!border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
                    : ''
                }`}
              />
              {errors.recipient && (
                <p className="text-[11px] font-semibold text-[var(--color-danger)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.recipient}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="e.g. Exploring Collaboration with [Company]"
                className={`w-full bi-input px-3.5 py-2 text-xs transition-all duration-150 ${
                  errors.subject
                    ? '!border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
                    : ''
                }`}
              />
              {errors.subject && (
                <p className="text-[11px] font-semibold text-[var(--color-danger)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.subject}
                </p>
              )}
            </div>

            {/* Email Body */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={10}
                placeholder="Write your email here..."
                className={`w-full bi-input px-3.5 py-2.5 text-xs leading-relaxed resize-y transition-all duration-150 ${
                  errors.body
                    ? '!border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
                    : ''
                }`}
              />
              {errors.body && (
                <p className="text-[11px] font-semibold text-[var(--color-danger)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.body}
                </p>
              )}
            </div>

            {/* Attachment Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  Attachments
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 uppercase tracking-wider"
                >
                  <Paperclip className="w-3 h-3" /> Attach File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                    >
                      <Paperclip className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span className="max-w-[140px] truncate font-semibold">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="text-[var(--text-tertiary)] hover:text-[var(--color-danger)] p-0.5 rounded-sm transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-tertiary)] italic">
                  No attachments selected. (Attach resumes, portfolios, or pitch decks)
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer Controls */}
      {hasDraft && (
        <div className="px-5 py-3 border-t border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || isSending}
            className="bi-button-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
            />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isGenerating || isSending || !recipient.trim() || !subject.trim() || !body.trim()}
            className="bi-button !bg-[var(--color-success)] hover:!bg-[#0D6535] inline-flex items-center gap-1.5 px-5 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
