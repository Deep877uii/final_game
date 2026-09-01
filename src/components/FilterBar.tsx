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

  // Extract unique options from current leads
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
      {/* Main Search & Quick Filter Bar */}
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
            className="w-full pl-9 pr-8 py-2 text-sm bi-input"
          />
          {filterOptions.query && (
            <button
              onClick={() =>
                setFilterOptions((prev) => ({ ...prev, query: '' }))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border text-sm font-semibold transition-all duration-150 ${
              activeFilterCount > 0 || showFilters
                ? 'bg-[var(--color-primary-bg)] border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'bi-button-secondary'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-sm bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset Leads Action Button */}
          <button
            type="button"
            onClick={onResetLeadsPrompt}
            title="Reset leads to start a fresh search"
            className="bi-button-secondary inline-flex items-center gap-1.5 px-3 py-2 hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Expanded Filter Controls */}
      {showFilters && (
        <div className="bi-widget p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Company Dropdown */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5" />
                Company
              </label>
              <select
                value={filterOptions.company}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    company: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 text-xs bi-input"
              >
                <option value="">All Companies</option>
                {companies.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </label>
              <select
                value={filterOptions.location}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 text-xs bi-input"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Dropdown */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Source
              </label>
              <select
                value={filterOptions.source}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    source: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 text-xs bi-input"
              >
                <option value="">All Sources</option>
                {sources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
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
                className="w-full px-3 py-1.5 text-xs bi-input"
              >
                <option value="all">All Statuses</option>
                <option value="hasEmail">Has Email Address</option>
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
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Previous Searches Quick Chips */}
      {searchHistory.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1 text-[var(--text-primary)] flex-shrink-0">
            <History className="w-3.5 h-3.5" />
            <span className="font-medium">Recent:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {searchHistory.slice(0, 5).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreviousSearch(item)}
                className="px-2 py-1 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-[var(--color-primary)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
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
