import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Building2,
  MapPin,
  Sparkles,
  History,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Lead, SearchHistoryItem, FilterOptions } from '../types/lead';

interface FilterBarProps {
  leads: Lead[];
  onResetLeadsPrompt: () => void;
}

export default function FilterBar({ leads, onResetLeadsPrompt }: FilterBarProps) {
  const { filterOptions, setFilterOptions, resetFilters, searchHistory } = useApp();
  const [showFilters, setShowFilters] = useState(false);

  const companies = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.company && l.company.trim() && l.company !== 'Not available') {
        set.add(l.company.trim());
      }
    });
    return Array.from(set).sort();
  }, [leads]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.location && l.location.trim() && l.location !== 'Not available') {
        set.add(l.location.trim());
      }
    });
    return Array.from(set).sort();
  }, [leads]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.source && l.source.trim() && l.source !== 'Not available') {
        set.add(l.source.trim());
      }
    });
    return Array.from(set).sort();
  }, [leads]);

  const activeFilterCount =
    (filterOptions.query ? 1 : 0) +
    (filterOptions.company ? 1 : 0) +
    (filterOptions.location ? 1 : 0) +
    (filterOptions.source ? 1 : 0) +
    (filterOptions.status !== 'all' ? 1 : 0);

  const applyPreviousSearch = (item: SearchHistoryItem) => {
    setFilterOptions((prev) => ({
      ...prev,
      query: item.searchQuery === 'All' ? '' : item.searchQuery,
      location: item.location === 'Anywhere' ? '' : item.location,
    }));
  };

  return (
    <div className="space-y-3">
      {/* Main Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterOptions.query}
            onChange={(e) =>
              setFilterOptions((prev) => ({ ...prev, query: e.target.value }))
            }
            placeholder="Search leads by name, role, company, or keyword..."
            className="w-full pl-9 pr-8 py-2.5 text-sm lf-input"
          />
          {filterOptions.query && (
            <button
              onClick={() =>
                setFilterOptions((prev) => ({ ...prev, query: '' }))
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter + Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeFilterCount > 0 || showFilters
                ? 'lime-button'
                : 'soft-button'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--accent-deep)] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onResetLeadsPrompt}
            title="Reset leads"
            className="soft-button inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="surface rounded-xl p-4 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5" />
                Company
              </label>
              <select
                value={filterOptions.company}
                onChange={(e) =>
                  setFilterOptions((prev) => ({ ...prev, company: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs lf-input"
              >
                <option value="">All Companies</option>
                {companies.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </label>
              <select
                value={filterOptions.location}
                onChange={(e) =>
                  setFilterOptions((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs lf-input"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Source
              </label>
              <select
                value={filterOptions.source}
                onChange={(e) =>
                  setFilterOptions((prev) => ({ ...prev, source: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs lf-input"
              >
                <option value="">All Sources</option>
                {sources.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                value={filterOptions.status}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    status: e.target.value as FilterOptions['status'],
                  }))
                }
                className="w-full px-3 py-2 text-xs lf-input"
              >
                <option value="all">All Statuses</option>
                <option value="hasEmail">Has Email</option>
                <option value="noEmail">Missing Email</option>
                <option value="generated">Email Generated</option>
                <option value="sent">Email Sent</option>
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-secondary)]">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[var(--accent-mid)] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search History Chips */}
      {searchHistory.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1 text-[var(--text-primary)] flex-shrink-0">
            <History className="w-3.5 h-3.5" />
            <span className="font-semibold">Recent:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {searchHistory.slice(0, 5).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreviousSearch(item)}
                className="soft-button px-2.5 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-mid)] hover:border-[var(--accent-soft)] whitespace-nowrap text-xs"
              >
                {item.searchQuery || 'All'} · {item.location || 'Anywhere'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
