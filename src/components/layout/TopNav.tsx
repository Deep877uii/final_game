import { Menu, BarChart3, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-[var(--shadow-widget)]">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-1.5 -ml-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 bg-[var(--color-primary)] flex items-center justify-center text-white">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              LeadGen
            </span>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center gap-2"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
