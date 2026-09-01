export interface Lead {
  leadId: string;
  name: string;
  company: string;
  role: string;
  email: string | null;
  linkedinUrl: string;
  postUrl: string;
  postContent: string;
  postedAt: string;
  location: string;
  companyWebsite: string;
  jobTitle: string;
  source: string;
}

export interface ScraperRequest {
  searchQuery?: string;
  location?: string;
  datePosted?: string;
  maxPosts?: number;
}

export interface ScraperResponse {
  success: boolean;
  message?: string;
  leadsProcessed?: number;
  error?: string;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
}

export interface GenerateEmailRequest {
  leadId: string;
  name: string;
  company: string;
  role: string;
  email: string | null;
  linkedinUrl: string;
  postUrl: string;
  postContent: string;
  jobTitle: string;
  location: string;
}

export interface GenerateEmailResponse {
  success: boolean;
  leadId: string;
  recipient: string;
  subject: string;
  body: string;
  error?: string;
}

export interface SendEmailRequest {
  leadId: string;
  recipient: string;
  subject: string;
  body: string;
  attachments?: {
    name: string;
    type?: string;
    size?: number;
    base64: string;
  }[];
}

export interface SendEmailResponse {
  success: boolean;
  message?: string;
  recipient?: string;
  error?: string;
}

export interface SearchHistoryItem {
  searchQuery: string;
  location: string;
  datePosted: string;
  maxPosts: number;
  timestamp: number;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  type?: string;
  base64?: string;
}

export interface EmailDraft {
  leadId: string;
  recipient: string;
  subject: string;
  body: string;
  attachments?: AttachmentItem[];
  generatedAt?: number;
  status?: 'idle' | 'generating' | 'generated' | 'sending' | 'sent' | 'error';
  error?: string;
}

export interface FilterOptions {
  query: string;
  company: string;
  role: string;
  location: string;
  source: string;
  status: 'all' | 'hasEmail' | 'noEmail' | 'generated' | 'sent';
}

export interface BulkProgressState {
  active: boolean;
  type: 'generate' | 'send';
  current: number;
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

