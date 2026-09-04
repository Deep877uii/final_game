import { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
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
    <form onSubmit={handleSubmit} className="search-prompt surface p-2 rounded-[19px]">
      {/* Main search row */}
      <div className="flex items-center gap-3 p-3">
        <Sparkles className="w-5 h-5 text-[var(--accent-mid)] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find hiring leads..."
          className="flex-1 outline-none text-base placeholder:text-[var(--text-tertiary)] bg-transparent text-[var(--text-primary)]"
          required
        />
        <button
          type="submit"
          disabled={!searchQuery.trim() || isLoading}
          className="lime-button rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[var(--accent-deep)] border-t-transparent rounded-full animate-spin" />
              Searching…
            </span>
          ) : (
            'Start AI Search'
          )}
        </button>
      </div>

      {/* Filter pills */}
      <div className="border-t border-[var(--border-subtle)] flex flex-wrap gap-2 p-3">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="soft-button rounded-lg px-3 py-2 text-xs flex gap-2 items-center font-medium"
        >
          Location <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="soft-button rounded-lg px-3 py-2 text-xs flex gap-2 items-center font-medium"
        >
          Date Posted <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="soft-button rounded-lg px-3 py-2 text-xs flex gap-2 items-center font-medium"
        >
          Max Posts <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="soft-button rounded-lg px-3 py-2 text-xs flex gap-2 items-center font-medium"
        >
          LinkedIn <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="border-t border-[var(--border-subtle)] p-4 space-y-4 animate-fadeIn">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, Remote"
                className="w-full lf-input px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Date Posted
              </label>
              <select
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                className="w-full lf-input px-3 py-2.5 text-sm appearance-none cursor-pointer"
              >
                <option value="past-24h">Past 24 hours</option>
                <option value="past-week">Past week</option>
                <option value="past-month">Past month</option>
                <option value="any-time">Any time</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Max Posts
                </label>
                <span className="text-xs font-bold font-mono text-[var(--accent-mid)] bg-[var(--color-primary-bg)] px-2 py-0.5 rounded-lg">
                  {maxPosts}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={maxPosts}
                onChange={(e) => setMaxPosts(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--border-strong)] rounded-full appearance-none cursor-pointer accent-[var(--accent-mid)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
