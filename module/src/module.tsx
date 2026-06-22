import { useState, useEffect } from 'react';

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

const mono = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  ...extra,
});

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

  if (loading) return (
    <div style={mono({ color: 'var(--text-muted)', padding: 20 })}>LOADING…</div>
  );

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
      <div style={mono({ color: 'var(--status-error)', fontSize: 14 })}>ERROR: {error}</div>
      <div style={mono({ color: 'var(--text-muted)', lineHeight: 1.6 })}>
        Start the server with:<br />
        <span style={{ color: 'var(--text-secondary)' }}>morphius-forge serve</span>
      </div>
    </div>
  );

  if (!status) return null;

  const allValid = status.modules.length > 0 && status.invalidModuleCount === 0;
  const hasIssues = status.invalidModuleCount > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>

      {/* ── Header bar ── */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={mono({ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.12em', flex: 1 })}>
          FORGE STATUS
        </span>
        {status.forgePath && (
          <span style={mono({ fontSize: 11, color: 'var(--text-muted)' })}>{status.forgePath}</span>
        )}
        <span style={mono({
          fontSize: 11,
          color: allValid ? 'var(--status-ok)' : hasIssues ? 'var(--status-error)' : 'var(--text-muted)',
          letterSpacing: '0.08em',
        })}>
          {allValid ? '● ALL VALID' : hasIssues ? `● ${status.invalidModuleCount} INVALID` : '○ NO MODULES'}
        </span>
      </div>

      {/* ── Summary row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {[
          { label: 'PATHS', val: status.modulePathCount, dim: status.modulePathCount === 0 },
          { label: 'VALID', val: status.validModuleCount, ok: status.validModuleCount > 0 },
          { label: 'INVALID', val: status.invalidModuleCount, err: status.invalidModuleCount > 0 },
        ].map(({ label, val, dim, ok, err }) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 0',
            borderRight: label !== 'INVALID' ? '1px solid var(--border)' : undefined,
          }}>
            <span style={mono({
              fontSize: 22,
              color: err ? 'var(--status-error)' : ok ? 'var(--status-ok)' : dim ? 'var(--text-muted)' : 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: 4,
            })}>
              {val}
            </span>
            <span style={mono({ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' })}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Module list ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>

        {status.modulePathCount === 0 && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={mono({ color: 'var(--text-muted)', lineHeight: 1.7 })}>
              No module paths configured.<br />
              Edit <span style={{ color: 'var(--text-secondary)' }}>forge.config.json</span> to add paths:
            </div>
            <div style={mono({ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 })}>
              {'{ "modulePaths": ["C:/path/to/modules"] }'}
            </div>
          </div>
        )}

        {status.modules.map((m, i) => (
          <div
            key={m.path}
            style={{
              borderBottom: i < status.modules.length - 1 ? '1px solid var(--border)' : undefined,
              padding: '10px 14px',
            }}
          >
            {/* Module name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: m.errors.length + m.warnings.length > 0 ? 6 : 0 }}>
              {/* Valid / invalid badge */}
              <div style={{
                flexShrink: 0,
                width: 6, height: 6, borderRadius: '50%',
                background: m.valid ? 'var(--status-ok)' : 'var(--status-error)',
                boxShadow: m.valid ? '0 0 4px var(--status-ok)' : '0 0 4px var(--status-error)',
              }} />
              <span style={mono({ fontSize: 14, color: 'var(--text-primary)', flex: 1 })}>
                {m.name ?? m.path.split(/[\\/]/).pop()}
              </span>
              {m.version && (
                <span style={mono({
                  fontSize: 11, color: 'var(--text-muted)',
                  border: '1px solid var(--border)', padding: '1px 5px',
                })}>
                  v{m.version}
                </span>
              )}
              <span style={mono({
                fontSize: 11,
                color: m.valid ? 'var(--status-ok)' : 'var(--status-error)',
                letterSpacing: '0.08em',
              })}>
                {m.valid ? 'VALID' : 'INVALID'}
              </span>
            </div>

            {/* Errors */}
            {m.errors.map((e, ei) => (
              <div key={ei} style={{
                display: 'flex', alignItems: 'flex-start', gap: 6,
                padding: '3px 0 3px 14px',
              }}>
                <span style={mono({ fontSize: 11, color: 'var(--status-error)', flexShrink: 0, marginTop: 1 })}>✕</span>
                <span style={mono({ fontSize: 12, color: 'var(--status-error)', lineHeight: 1.5 })}>{e}</span>
              </div>
            ))}

            {/* Warnings */}
            {m.warnings.map((w, wi) => (
              <div key={wi} style={{
                display: 'flex', alignItems: 'flex-start', gap: 6,
                padding: '3px 0 3px 14px',
              }}>
                <span style={mono({ fontSize: 11, color: '#888', flexShrink: 0, marginTop: 1 })}>!</span>
                <span style={mono({ fontSize: 12, color: '#888', lineHeight: 1.5 })}>{w}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Footer: last scan + reload ── */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={mono({ fontSize: 11, color: 'var(--text-muted)', flex: 1 })}>
          {status.lastScanAt
            ? `LAST SCAN  ${new Date(status.lastScanAt).toLocaleTimeString()}`
            : 'NOT SCANNED YET'}
        </span>
        <button
          onClick={handleReload}
          disabled={reloading}
          style={{
            ...mono({ fontSize: 12, letterSpacing: '0.08em' }),
            background: 'transparent',
            border: '1px solid var(--border)',
            color: reloading ? 'var(--text-muted)' : 'var(--text-secondary)',
            padding: '4px 12px',
            cursor: reloading ? 'default' : 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!reloading) {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#555';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = reloading ? 'var(--text-muted)' : 'var(--text-secondary)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
          }}
        >
          {reloading ? 'SCANNING…' : '▶ RELOAD'}
        </button>
      </div>

    </div>
  );
}
