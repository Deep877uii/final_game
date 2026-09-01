import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import type { ScraperRequest } from '../types/lead';

interface SearchFormProps {
  onSubmit: (params: ScraperRequest) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [datePosted, setDatePosted] = useState<string>('past-week');
  const [maxPosts, setMaxPosts] = useState<number>(10);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      onSubmit({
        searchQuery: searchQuery.trim(),
        location: location.trim() || undefined,
        datePosted: datePosted || undefined,
        maxPosts,
      });
    },
    [searchQuery, location, datePosted, maxPosts, onSubmit]
  );



  return (
    <div className="bi-widget p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-sm bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
            Search Criteria
          </h2>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Define your LinkedIn hiring post search
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search Query */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
            Search Query
          </label>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='e.g. "hiring frontend developer" or "looking for React engineer"'
            className="w-full bi-input px-4 py-3 text-sm"
            required
          />
        </div>

        {/* Location + Date */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, Remote"
              className="w-full bi-input px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Date Posted
            </label>
            <select
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
              className="w-full bi-input px-4 py-3 text-sm appearance-none cursor-pointer"
            >
              <option value="past-24h">Past 24 hours</option>
              <option value="past-week">Past week</option>
              <option value="past-month">Past month</option>
              <option value="any-time">Any time</option>
            </select>
          </div>
        </div>

        {/* Max Posts */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Max Posts to Scrape
            </label>
            <span className="text-xs font-bold text-[var(--color-primary)] tabular-nums bg-[var(--color-primary-bg)] px-2 py-0.5 rounded-sm">
              {maxPosts}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            value={maxPosts}
            onChange={(e) => setMaxPosts(Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--border-strong)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1">
            <span>5</span>
            <span>50</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!searchQuery.trim() || isLoading}
          className="w-full bi-button flex items-center justify-center gap-2 px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--bg-surface)] border-t-transparent rounded-full animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Start AI Search
            </>
          )}
        </button>
      </form>

    </div>
  );
}
