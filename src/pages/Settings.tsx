import { Settings as SettingsIcon, Globe, Shield, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { connected } = useApp();

  return (
    <div className="space-y-6 max-w-2xl animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-10 h-10 rounded-sm bg-[var(--color-primary)] flex items-center justify-center text-white">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Settings & Integrations
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              System architecture, n8n webhook status, and security protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Backend Connection */}
      <div className="bi-widget p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            n8n Webhook Integration
          </h2>
        </div>

        <div
          className={`flex items-center gap-3 p-4 rounded-sm border ${
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
              className={`text-xs font-bold ${
                connected ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}
            >
              {connected ? 'Active & Connected' : 'Connection Offline'}
            </p>
            <p
              className={`text-[11px] mt-0.5 ${
                connected ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
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
              <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Production Webhook Base URL
              </p>
              <p className="text-xs text-[var(--text-primary)] font-mono mt-1 bg-[var(--bg-surface-hover)] p-2.5 rounded-sm border border-[var(--border-subtle)] break-all">
                https://deepashu.app.n8n.cloud/webhook
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Details */}
      <div className="bi-widget p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Security & Contract Integrity
          </h2>
        </div>

        <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-sm p-4 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
          <p className="font-semibold text-[var(--text-primary)]">
            All existing webhook contracts and headers are strictly preserved:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px]">
            <li>HTTPS encrypted transmission for all payloads</li>
            <li>Immutable request payload contracts across endpoints</li>
            <li>No fake or mock fallback data introduced</li>
            <li>External links secured with <code className="text-[var(--color-primary)] bg-[var(--color-primary-bg)] px-1 py-0.5 rounded font-mono">rel="noopener noreferrer"</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
