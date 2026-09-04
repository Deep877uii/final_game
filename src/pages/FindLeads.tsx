import { useState, useRef, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

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
    <div className="space-y-6 max-w-5xl mx-auto pt-3 animate-fadeUp">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[var(--text-secondary)] mb-3">
          AI-Powered Discovery
        </p>
        <h1 className="text-3xl font-bold tracking-[-.055em] m-0 text-[var(--text-primary)]">
          Find New Leads
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-md mx-auto">
          Discover hiring opportunities and turn them into qualified outreach prospects with AI.
        </p>
      </div>

      {/* Search Form */}
      <SearchForm onSubmit={handleSearch} isLoading={scraping} />

      {/* Scraping Progress */}
      {scraping && (
        <div className="mt-8">
          <ScrapingProgress isActive={scraping} />
        </div>
      )}

      {/* Result Card */}
      {result && !scraping && (
        <div
          className={`surface p-5 flex items-start justify-between gap-4 rounded-xl ${
            result.success
              ? 'border-l-4 border-l-[var(--color-success)]'
              : 'border-l-4 border-l-[var(--color-danger)]'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <div className="w-9 h-9 rounded-xl bg-[var(--color-success-bg)] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center flex-shrink-0">
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
              className="lime-button flex items-center gap-1.5 px-4 py-2 text-xs flex-shrink-0 rounded-xl"
            >
              <span>View Leads</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
