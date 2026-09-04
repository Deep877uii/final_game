const N8N_BASE_URL = 'https://deepashu1.app.n8n.cloud/webhook';
// For testing (requires n8n editor open with "Listen for test event"):
// const N8N_BASE_URL = 'https://deepashu1.app.n8n.cloud/webhook-test';

const N8N_API_KEY = 'e85dec84295eeb7445823c5462425156f2e182fb08e0914f4c57db11ce4f11cc';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-API-KEY': N8N_API_KEY,
};

import type {
  ScraperRequest,
  ScraperResponse,
  LeadsResponse,
  GenerateEmailRequest,
  GenerateEmailResponse,
  SendEmailRequest,
  SendEmailResponse,
  Lead,
} from '../types/lead';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  emptyFallback?: T
): Promise<T> {
  const url = `${N8N_BASE_URL}${endpoint}`;
  console.log(`[n8n] ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log(`[n8n] Request body:`, options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  console.log(`[n8n] Response status: ${response.status} ${response.statusText}`);
  console.log(`[n8n] Response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error(`[n8n] Error response body:`, errorText);
    throw new Error(
      `Request failed (${response.status}): ${errorText}`
    );
  }

  // Read as text first — n8n webhooks sometimes return empty or non-JSON responses
  const text = await response.text();
  console.log(`[n8n] Response body (${text.length} chars):`, text.substring(0, 500));

  if (!text || !text.trim()) {
    if (emptyFallback !== undefined) {
      console.log('[n8n] Empty response — using fallback value');
      return emptyFallback;
    }
    throw new Error('Empty response from server. The n8n workflow may not have a "Respond to Webhook" node configured.');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response from server: ${text.substring(0, 200)}`);
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    await apiRequest<LeadsResponse>('/leads', { method: 'GET' });
    return true;
  } catch {
    return false;
  }
}

export async function getLeads(): Promise<Lead[]> {
  const response = await apiRequest<LeadsResponse>('/leads', { method: 'GET' });
  if (response.success && Array.isArray(response.data)) {
    return response.data;
  }
  // Handle case where response is an array directly
  if (Array.isArray(response)) {
    return response as unknown as Lead[];
  }
  throw new Error('Failed to load leads');
}

// Main scraper webhook — triggers the full scraping pipeline
export async function startScraper(
  params: ScraperRequest
): Promise<ScraperResponse> {
  // n8n scraper may run async without a "Respond to Webhook" node,
  // so we provide a fallback for empty responses
  const fallback: ScraperResponse = {
    success: true,
    message: 'Scraping triggered successfully. Leads will appear shortly.',
  };
  const response = await apiRequest<ScraperResponse>(
    '/start-scraper',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    fallback
  );
  return response;
}

// Stage 0 — Run Scraper sub-workflow trigger
export async function runScraper(
  params: ScraperRequest
): Promise<ScraperResponse> {
  const fallback: ScraperResponse = {
    success: true,
    message: 'Scraping triggered successfully. Leads will appear shortly.',
  };
  const response = await apiRequest<ScraperResponse>(
    '/run-scraper',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    fallback
  );
  return response;
}

export async function generateEmail(
  lead: GenerateEmailRequest
): Promise<GenerateEmailResponse> {
  const response = await apiRequest<GenerateEmailResponse>(
    '/generate-email',
    {
      method: 'POST',
      body: JSON.stringify(lead),
    }
  );
  return response;
}

export async function sendEmail(
  data: SendEmailRequest
): Promise<SendEmailResponse> {
  const response = await apiRequest<SendEmailResponse>('/send-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response;
}
