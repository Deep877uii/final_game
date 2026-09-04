import { Menu, Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-20 h-[76px] flex items-center justify-between px-6 md:px-10 w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-all duration-300">
      {/* Left: Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>


      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="soft-button h-10 w-10 rounded-xl grid place-items-center"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="soft-button h-10 w-10 rounded-xl grid place-items-center relative"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)]" />
        </button>
      </div>
    </header>
  );
}
