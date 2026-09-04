import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  RefreshCw,
  Mail,
  User,
  FileText,
  AlertCircle,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import type { Lead, EmailDraft, AttachmentItem } from '../types/lead';
import { useApp } from '../context/AppContext';

interface EmailComposerProps {
  lead: Lead;
  initialDraft: EmailDraft | null;
  onClose: () => void;
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

export default function EmailComposer({
  lead,
  initialDraft,
  onClose,
}: EmailComposerProps) {
  const {
    generatedEmails,
    updateDraft,
    generateEmailForLead,
    sendEmailForLead,
    sentLeadIds,
  } = useApp();

  const leadKey = lead.leadId || lead.postUrl || lead.name;
  const activeDraft = generatedEmails[leadKey] || initialDraft;
  const isSent = sentLeadIds.includes(leadKey) || activeDraft?.status === 'sent';

  const [recipient, setRecipient] = useState(
    activeDraft?.recipient || lead.email || ''
  );
  const [subject, setSubject] = useState(activeDraft?.subject || '');
  const [body, setBody] = useState(activeDraft?.body || '');
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    activeDraft?.attachments || []
  );
  const [loading, setLoading] = useState(!activeDraft?.subject && !activeDraft?.body);
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendClickedRef = useRef(false);

  // If no draft exists yet, generate on first mount
  useEffect(() => {
    if (!activeDraft?.subject && !activeDraft?.body) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose, sending]);

  async function handleGenerate() {
    setLoading(true);
    setRegenerating(true);
    try {
      const res = await generateEmailForLead(lead);
      if (res) {
        setRecipient(res.recipient);
        setSubject(res.subject);
        setBody(res.body);
      }
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
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
  }

  function handleRemoveAttachment(id: string) {
    const updated = attachments.filter((a) => a.id !== id);
    setAttachments(updated);
    updateDraft(leadKey, { attachments: updated });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!lead.leadId) {
      newErrors.general = 'Lead ID is missing.';
    }
    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient email is required.';
    } else if (!validateEmail(recipient.trim())) {
      newErrors.recipient = 'Please enter a valid recipient email.';
    }
    if (!subject.trim()) {
      newErrors.subject = 'Subject cannot be empty.';
    }
    if (!body.trim()) {
      newErrors.body = 'Email body cannot be empty.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSend() {
    if (sendClickedRef.current || sending) return;
    sendClickedRef.current = true;

    if (!validate()) {
      sendClickedRef.current = false;
      return;
    }

    setSending(true);
    try {
      const ok = await sendEmailForLead(
        lead.leadId,
        recipient.trim(),
        subject.trim(),
        body.trim(),
        attachments
      );
      if (ok) {
        onClose();
      }
    } finally {
      setSending(false);
      sendClickedRef.current = false;
    }
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current && !sending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Email composer"
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-sm shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-strong)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[var(--color-primary-bg)] border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  AI Outreach Mail
                </h2>
                {isSent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)] uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Sent
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Personalized for {lead.name || 'this lead'} · {lead.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-1.5 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors disabled:opacity-50"
            aria-label="Close email composer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--bg-body)]">
          {loading && !recipient && !subject ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {regenerating
                  ? 'Crafting new draft with AI...'
                  : 'Generating personalized email...'}
              </p>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className="flex items-center gap-2 p-3 rounded-sm bg-[var(--color-danger-bg)] border border-[var(--color-danger)]">
                  <AlertCircle className="w-4 h-4 text-[var(--color-danger)] flex-shrink-0" />
                  <span className="text-xs text-[var(--color-danger)] font-medium">
                    {errors.general}
                  </span>
                </div>
              )}

              {/* Recipient */}
              <div>
                <label
                  htmlFor="modal-email-recipient"
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
                >
                  <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  Recipient Email
                </label>
                <input
                  id="modal-email-recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    updateDraft(leadKey, { recipient: e.target.value });
                    if (errors.recipient) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.recipient;
                        return n;
                      });
                    }
                  }}
                  placeholder="name@company.com"
                  className={`w-full bi-input px-3.5 py-2.5 text-sm transition-all duration-150
                    ${errors.recipient ? '!border-[var(--color-danger)] bg-[var(--color-danger-bg)]' : ''}`}
                />
                {errors.recipient && (
                  <p className="mt-1 text-xs text-[var(--color-danger)] flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    {errors.recipient}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="modal-email-subject"
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  Subject
                </label>
                <input
                  id="modal-email-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    updateDraft(leadKey, { subject: e.target.value });
                    if (errors.subject) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.subject;
                        return n;
                      });
                    }
                  }}
                  placeholder="Enter email subject"
                  className={`w-full bi-input px-3.5 py-2.5 text-sm transition-all duration-150
                    ${errors.subject ? '!border-[var(--color-danger)] bg-[var(--color-danger-bg)]' : ''}`}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-[var(--color-danger)] flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Body */}
              <div>
                <label
                  htmlFor="modal-email-body"
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  Email Message
                </label>
                <textarea
                  id="modal-email-body"
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    updateDraft(leadKey, { body: e.target.value });
                    if (errors.body) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.body;
                        return n;
                      });
                    }
                  }}
                  placeholder="Compose your message..."
                  rows={9}
                  className={`w-full bi-input px-3.5 py-3 text-sm leading-relaxed resize-y transition-all duration-150
                    ${errors.body ? '!border-[var(--color-danger)] bg-[var(--color-danger-bg)]' : ''}`}
                />
                {errors.body && (
                  <p className="mt-1 text-xs text-[var(--color-danger)] flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    {errors.body}
                  </p>
                )}
              </div>

              {/* Attachments */}
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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                      >
                        <Paperclip className="w-3 h-3 text-[var(--text-tertiary)]" />
                        <span className="max-w-[160px] truncate font-semibold">
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
                  <p className="text-xs text-[var(--text-tertiary)] italic">
                    No attachments selected. (Attach resumes, portfolios, or pitch decks)
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-[var(--border-strong)] bg-[var(--bg-surface)]">
          <button
            onClick={onClose}
            disabled={sending}
            className="bi-button-secondary px-4 py-2 text-xs"
          >
            Close
          </button>
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={handleGenerate}
              disabled={loading || sending}
              className="flex-1 sm:flex-none bi-button-secondary inline-flex items-center justify-center gap-2 px-4 py-2 text-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`}
              />
              Regenerate
            </button>
            <button
              onClick={handleSend}
              disabled={loading || sending || !recipient.trim() || !subject.trim() || !body.trim()}
              className="flex-1 sm:flex-none bi-button !bg-[var(--color-success)] hover:!bg-[#0D6535] inline-flex items-center justify-center gap-2 px-6 py-2 text-xs"
            >
              {sending ? (
               <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
