import { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import ScrapingProgress from '../components/ScrapingProgress';
import { startScraper } from '../api/n8n';
import { useApp } from '../context/AppContext';
import type { ScraperRequest } from '../types/lead';

export default function FindLeads() {
  const { refreshLeads, addToast } = useApp();
  const navigate = useNavigate();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Poll for new leads after async scraper trigger
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    let polls = 0;
    pollTimerRef.current = setInterval(async () => {
      polls++;
      console.log(`[FindLeads] Polling for new leads... (${polls}/6)`);
      await refreshLeads();
      if (polls >= 6) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }, 5000);
  }, [refreshLeads]);

  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleSearch = async (params: ScraperRequest) => {
    setScraping(true);
    setResult(null);

    try {
      const response = await startScraper(params);

      if (response.success) {
        const isAsync = response.leadsProcessed === undefined;
        setResult({
          success: true,
          message:
            response.message ||
            (isAsync
              ? 'Scraping triggered! New leads will appear shortly.'
              : 'Lead scraping completed successfully.'),
          count: response.leadsProcessed,
        });
        addToast(
          'success',
          isAsync
            ? 'Scraping triggered! Checking for new leads...'
            : `Lead scraping completed. ${response.leadsProcessed || 0} leads found.`
        );
        await refreshLeads();
        if (isAsync) {
          startPolling();
        }
      } else {
        setResult({
          success: false,
          message:
            response.error ||
            'Failed to scrape leads. Please try again later.',
        });
        addToast(
          'error',
          response.error || 'Failed to scrape leads. Please try again later.'
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to scrape leads. Please try again later.';
      setResult({ success: false, message });
      addToast('error', message);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-primary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Find New Leads
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Discover hiring opportunities and turn them into qualified outreach prospects.
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <SearchForm onSubmit={handleSearch} isLoading={scraping} />

      {/* Scraping Progress */}
      <ScrapingProgress isActive={scraping} />

      {/* Result Card */}
      {result && !scraping && (
        <div
          className={`bi-widget p-5 sm:p-6 flex items-start justify-between gap-4 border-l-4 ${
            result.success
              ? 'border-l-[var(--color-success)]'
              : 'border-l-[var(--color-danger)]'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <div className="w-8 h-8 rounded-sm bg-[var(--color-success-bg)] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-sm bg-[var(--color-danger-bg)] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
              </div>
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  result.success ? 'text-[var(--text-primary)]' : 'text-[var(--color-danger)]'
                }`}
              >
                {result.message}
              </p>
              {result.success && result.count !== undefined && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                  {result.count} new lead{result.count !== 1 ? 's' : ''} retrieved.
                </p>
              )}
            </div>
          </div>

          {result.success && (
            <button
              type="button"
              onClick={() => navigate('/leads')}
              className="bi-button flex items-center gap-1 px-3 py-1.5 flex-shrink-0 text-xs"
            >
              <span>View in Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
