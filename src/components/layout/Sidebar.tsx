import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  ContactRound,
  Send,
  Settings2,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/find-leads', icon: Search, label: 'Search Leads' },
  { to: '/leads', icon: ContactRound, label: 'Leads' },
  { to: '/outreach', icon: Send, label: 'Email Campaigns' },
  { to: '/settings', icon: Settings2, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  collapsed?: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const { connected, leads } = useApp();
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[248px]
          bg-[var(--nav)] text-[#edf4ed]
          flex flex-col
          transition-transform duration-300 ease-out
          ${collapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ padding: '25px 16px' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <header className="flex items-center gap-3 px-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[#17211d] grid place-items-center font-bold text-sm"
               style={{ boxShadow: '0 8px 20px rgba(223,244,90,.16)' }}>
            L
          </div>
          <div className="min-w-0 hidden sm:block sidebar-copy">
            <p className="text-[15px] font-bold tracking-tight leading-none m-0">LeadForge</p>
            <p className="text-[10px] uppercase tracking-[.16em] text-[#9bad9f] mt-0.5 m-0">AI Platform</p>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-[#b9c4bc] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
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
                  w-full flex items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium border transition-all duration-150
                  ${
                    isActive
                      ? 'text-white bg-white/[.09] border-white/[.06]'
                      : 'text-[#b9c4bc] border-transparent hover:text-white hover:bg-white/[.09] hover:border-white/[.06]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="sidebar-copy">{label}</span>

                {/* Active dot */}
                <span
                  className={`ml-auto w-1.5 h-1.5 rounded-full sidebar-copy transition-all ${
                    isActive
                      ? 'bg-[var(--accent)]'
                      : 'bg-transparent'
                  }`}
                  style={isActive ? { boxShadow: '0 0 0 4px rgba(223,244,90,.12)' } : undefined}
                />

                {/* Lead count badge */}
                {to === '/leads' && leads.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold text-[#9bad9f] sidebar-copy">
                    {leads.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* AI Credits / Connection Status */}
        <div className="mt-auto rounded-lg bg-white/5 border border-white/10 p-3 sidebar-copy">
          <div className={`flex items-center gap-2 text-xs font-semibold ${connected ? 'text-[var(--accent)]' : 'text-[#d4a23e]'}`}>
            {connected ? <Sparkles className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{connected ? 'n8n Connected' : 'Setup Required'}</span>
          </div>
          <p className="text-xs text-[#b9c4bc] mt-2 mb-2">
            {leads.length} leads in workspace
          </p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: connected ? '82%' : '0%' }}
            />
          </div>
        </div>
      </aside>

      {/* Responsive styles for collapsed sidebar */}
      <style>{`
        @media (max-width: 900px) and (min-width: 641px) {
          aside[role="navigation"] {
            width: 76px !important;
            flex-basis: 76px !important;
            padding: 22px 10px !important;
          }
          .sidebar-copy { display: none !important; }
          aside[role="navigation"] a { justify-content: center; padding: 12px; }
        }
        @media (max-width: 640px) {
          aside[role="navigation"].lg\\:sticky { position: fixed; }
        }
      `}</style>
    </>
  );
}
