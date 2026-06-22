// Backend module UI — this surface shows server status and lets you call actions.
// The module owns this interface. Morphius mounts it. Morphius builds nothing here.
// No secrets in this file. Backend credentials stay in Morphius Connect.

import { useState, useEffect } from "react";

const BACKEND_URL =
  typeof window !== "undefined"
    ? (window as any).__MODULE_BACKEND_URL__ ?? "http://localhost:9100"
    : "http://localhost:9100";

interface ServerStatus {
  ok: boolean;
  uptime?: number;
  error?: string;
}

interface ActionResult {
  ok: boolean;
  result?: string;
  error?: string;
}

const mono = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: 13,
  ...extra,
});

export default function MyBackendModule() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [input, setInput] = useState("");
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => { checkHealth(); }, []);

  async function checkHealth() {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus({ ok: true, uptime: data.uptime });
    } catch (err) {
      setStatus({ ok: false, error: err instanceof Error ? err.message : "unreachable" });
    }
  }

  async function handleRun() {
    if (!input.trim()) return;
    setRunning(true);
    setActionResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/action/exampleAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setActionResult({ ok: true, result: JSON.stringify(data, null, 2) });
    } catch (err) {
      setActionResult({ ok: false, error: err instanceof Error ? err.message : "Call failed" });
    } finally {
      setRunning(false);
    }
  }

  const statusColor = status === null ? "#333" : status.ok ? "#4ade80" : "#ff4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#111" }}>

      {/* Header */}
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid #2a2a2a",
        background: "#181818",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: statusColor,
          boxShadow: status?.ok ? `0 0 4px ${statusColor}` : "none",
          flexShrink: 0,
        }} />
        <span style={mono({ fontSize: 11, color: "#666", letterSpacing: "0.1em" })}>
          MY BACKEND MODULE
        </span>
        {status?.uptime !== undefined && (
          <span style={mono({ fontSize: 11, color: "#444", marginLeft: "auto" })}>
            uptime {Math.floor(status.uptime)}s
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>

        {status && !status.ok && (
          <div style={mono({ fontSize: 12, color: "#ff4444", padding: "6px 8px", border: "1px solid #3a1a1a", background: "#1a0d0d" })}>
            BACKEND UNREACHABLE — {status.error}<br />
            <span style={{ color: "#555" }}>Start the server: npm run dev</span>
          </div>
        )}

        <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>INPUT</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text…"
          style={{
            background: "#0a0a0a",
            border: "1px solid #2a2a2a",
            color: "#e0e0e0",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "6px 8px",
            outline: "none",
          }}
        />

        <button
          onClick={handleRun}
          disabled={running || !input.trim()}
          style={mono({
            background: "transparent",
            border: "1px solid #3a3a3a",
            color: running ? "#555" : "#ccc",
            padding: "5px 14px",
            cursor: running ? "default" : "pointer",
            letterSpacing: "0.1em",
            alignSelf: "flex-start",
            fontSize: 12,
          })}
        >
          {running ? "…" : "▶ RUN"}
        </button>

        {actionResult && (
          <div>
            <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>
              {actionResult.ok ? "RESULT" : "ERROR"}
            </span>
            <pre style={mono({
              background: "#0a0a0a",
              border: "1px solid #2a2a2a",
              padding: 8,
              margin: "4px 0 0",
              color: actionResult.ok ? "#aaa" : "#ff4444",
              fontSize: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            })}>
              {actionResult.ok ? actionResult.result : actionResult.error}
            </pre>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #2a2a2a",
        padding: "5px 12px",
        display: "flex",
        gap: 8,
        flexShrink: 0,
      }}>
        <button
          onClick={checkHealth}
          style={mono({
            background: "transparent",
            border: "1px solid #2a2a2a",
            color: "#444",
            padding: "3px 10px",
            cursor: "pointer",
            fontSize: 11,
            letterSpacing: "0.08em",
          })}
        >
          ↺ REFRESH
        </button>
      </div>

    </div>
  );
}
