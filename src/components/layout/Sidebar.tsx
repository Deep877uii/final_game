import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  Mail,
  Settings,
  X,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/find-leads', icon: Search, label: 'Find Leads' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/outreach', icon: Mail, label: 'Outreach' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { connected, leads } = useApp();
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]
          flex flex-col transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo & Brand Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)] block leading-none">
                LeadGen Analytics
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-3 py-2 text-sm font-medium
                  transition-colors rounded-sm relative
                  ${
                    isActive
                      ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] rounded-r-sm" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                    }`}
                  />
                  <span>{label}</span>
                </div>
                {to === '/leads' && leads.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {leads.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer — Status */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    connected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    connected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
                  }`}
                />
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {connected ? 'n8n Active' : 'Offline'}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
