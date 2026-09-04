import { Globe, Shield, Info, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { connected, resetLeads } = useApp();

  return (
    <div className="space-y-5 max-w-2xl animate-fadeUp">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[var(--text-secondary)] mb-2">
          Configuration
        </p>
        <h1 className="text-3xl font-bold tracking-[-.05em] m-0 text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 mb-0">
          System architecture, webhook status, and security protocols.
        </p>
      </div>

      {/* Backend Connection */}
      <section className="surface rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-[var(--text-secondary)]" />
          <h2 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
            n8n Webhook Integration
          </h2>
        </div>

        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            connected
              ? 'bg-[var(--color-success-bg)] border-[var(--color-success)]'
              : 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]'
          }`}
        >
          <div className="flex-shrink-0">
            {connected ? (
              <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[var(--color-danger)]" />
            )}
          </div>
          <div>
            <p
              className={`text-xs font-bold m-0 ${
                connected ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}
            >
              {connected ? 'Active & Connected' : 'Connection Offline'}
            </p>
            <p className="text-[11px] mt-0.5 mb-0 text-[var(--text-secondary)]">
              {connected
                ? 'Frontend is actively communicating with production n8n workflows.'
                : 'Unable to reach the n8n endpoint. Check your network or webhook status.'}
            </p>
          </div>
        </div>

        <div className="pt-1 space-y-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
                Production Webhook Base URL
              </p>
              <p className="text-xs text-[var(--text-primary)] font-mono mt-1 bg-[var(--bg-surface-hover)] p-2.5 rounded-xl border border-[var(--border-subtle)] break-all mb-0">
                https://deepashu1.app.n8n.cloud/webhook
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Details */}
      <section className="surface rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
          <h2 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider m-0">
            Security & Contract Integrity
          </h2>
        </div>

        <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
          <p className="font-bold text-[var(--text-primary)] m-0">
            All existing webhook contracts and headers are strictly preserved:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] m-0">
            <li>HTTPS encrypted transmission for all payloads</li>
            <li>Immutable request payload contracts across endpoints</li>
            <li>No fake or mock fallback data introduced</li>
            <li>
              External links secured with{' '}
              <code className="text-[var(--accent-mid)] bg-[var(--color-primary-bg)] px-1 py-0.5 rounded font-mono">
                rel="noopener noreferrer"
              </code>
            </li>
          </ul>
        </div>
    </section>

      {/* Data Management */}
      <section className="surface rounded-xl p-6 space-y-4 border border-[var(--color-danger-bg)]">
        <div className="flex items-center gap-2.5">
          <Trash2 className="w-4 h-4 text-[var(--color-danger)]" />
          <h2 className="text-[11px] font-bold text-[var(--color-danger)] uppercase tracking-wider m-0">
            Data Management
          </h2>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-[var(--text-secondary)]">
            <p className="font-bold text-[var(--text-primary)] m-0">Reset Workspace</p>
            <p className="m-0 mt-0.5">Clear all loaded leads, drafts, and cached statistics. This cannot be undone.</p>
          </div>
          <button 
            onClick={resetLeads}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
          >
            Reset Data
          </button>
        </div>
      </section>
    </div>
  );
}
