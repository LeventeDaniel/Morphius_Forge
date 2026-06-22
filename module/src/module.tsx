import { useState, useEffect } from 'react';

// The Forge Status server runs via `morphius-forge serve` (default port 7901).
// Override by setting window.__FORGE_API__ before the module loads.
const FORGE_API: string = typeof window !== 'undefined'
  ? (window as any).__FORGE_API__ ?? 'http://localhost:7901'
  : 'http://localhost:7901';

interface ModuleResult {
  path: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  name?: string;
  version?: string;
  id?: string;
}

interface ForgeStatus {
  forgePath?: string;
  modulePathCount: number;
  validModuleCount: number;
  invalidModuleCount: number;
  lastScanAt: string | null;
  modules: ModuleResult[];
}

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 15 };
const label: React.CSSProperties = { ...mono, color: 'var(--text-muted)', letterSpacing: '0.08em' };
const value: React.CSSProperties = { ...mono, color: 'var(--text-primary)' };

export default function ForgeStatusModule() {
  const [status, setStatus] = useState<ForgeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${FORGE_API}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus(await res.json());
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — is "morphius-forge serve" running?`
          : 'Failed to load Forge status'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReload() {
    setReloading(true);
    try {
      await fetch(`${FORGE_API}/reload`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reload failed');
    } finally {
      setReloading(false);
    }
  }

  if (loading) return <div style={{ ...mono, color: 'var(--text-muted)', padding: 16 }}>LOADING…</div>;
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ ...mono, color: 'var(--status-error)' }}>ERROR: {error}</div>
      <div style={{ ...mono, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Start the server with:<br />
        <span style={{ color: 'var(--text-secondary)' }}>morphius-forge serve</span>
      </div>
    </div>
  );
  if (!status) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12, height: '100%', overflow: 'auto' }}>

      {/* Forge info */}
      <div style={{ border: '1px solid var(--border)', padding: '8px 10px' }}>
        <div style={{ ...label, marginBottom: 8 }}>MORPHIUS-FORGE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {status.forgePath && (
            <>
              <span style={label}>PATH</span>
              <span style={{ ...mono, fontSize: 14, color: 'var(--text-secondary)' }}>{status.forgePath}</span>
            </>
          )}
          <span style={label}>SERVER</span>
          <span style={{ ...value, color: 'var(--status-ok)', fontSize: 13 }}>{FORGE_API}</span>
        </div>
      </div>

      {/* Module scan */}
      <div style={{ border: '1px solid var(--border)', padding: '8px 10px' }}>
        <div style={{ ...label, marginBottom: 8 }}>MODULE PATHS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          <span style={label}>CONFIGURED</span>
          <span style={{ ...value, color: status.modulePathCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {status.modulePathCount}
          </span>
          <span style={label}>VALID</span>
          <span style={{ ...value, color: status.validModuleCount > 0 ? 'var(--status-ok)' : 'var(--text-muted)' }}>
            {status.validModuleCount}
          </span>
          <span style={label}>INVALID</span>
          <span style={{ ...value, color: status.invalidModuleCount > 0 ? 'var(--status-warn)' : 'var(--text-muted)' }}>
            {status.invalidModuleCount}
          </span>
          <span style={label}>LAST SCAN</span>
          <span style={{ ...mono, fontSize: 13, color: 'var(--text-secondary)' }}>
            {status.lastScanAt ? new Date(status.lastScanAt).toLocaleTimeString() : '—'}
          </span>
        </div>
      </div>

      {/* Per-module results */}
      {status.modules.length > 0 && (
        <div style={{ border: '1px solid var(--border)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ ...label, marginBottom: 4 }}>MODULES</div>
          {status.modules.map((m) => (
            <div key={m.path} style={{ paddingBottom: 6, borderBottom: '1px solid var(--bg-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...mono, fontSize: 13, color: m.valid ? 'var(--status-ok)' : 'var(--status-error)' }}>
                  {m.valid ? '●' : '○'}
                </span>
                <span style={{ ...mono, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>
                  {m.name ?? m.path.split(/[\\/]/).pop()}
                </span>
                {m.version && (
                  <span style={{ ...mono, fontSize: 12, color: 'var(--text-muted)' }}>v{m.version}</span>
                )}
              </div>
              {m.errors.length > 0 && m.errors.map((e, i) => (
                <div key={i} style={{ ...mono, fontSize: 12, color: 'var(--status-error)', paddingLeft: 22, lineHeight: 1.5 }}>{e}</div>
              ))}
              {m.warnings.length > 0 && m.warnings.map((w, i) => (
                <div key={i} style={{ ...mono, fontSize: 12, color: 'var(--status-warn)', paddingLeft: 22, lineHeight: 1.5 }}>{w}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Reload */}
      <button
        onClick={handleReload}
        disabled={reloading}
        style={{
          ...mono, fontSize: 14, background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          padding: '4px 10px',
          cursor: 'pointer',
          letterSpacing: '0.06em', alignSelf: 'flex-start',
        }}
      >
        {reloading ? 'SCANNING…' : '▶ RELOAD'}
      </button>

      {/* Setup hint */}
      {status.modulePathCount === 0 && (
        <div style={{ border: '1px solid var(--border)', padding: '8px 10px' }}>
          <div style={{ ...label, marginBottom: 4 }}>SETUP</div>
          <div style={{ ...mono, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Add module paths via POST /paths or edit forge.config.json:<br />
            <span style={{ color: 'var(--text-secondary)' }}>{'{ "modulePaths": ["C:/path/to/modules"] }'}</span>
          </div>
        </div>
      )}

    </div>
  );
}
