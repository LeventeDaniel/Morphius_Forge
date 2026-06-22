// Provider module UI — shows provider status, pending requests, and decisions.
// This is the interface for an approval/permission/policy provider.
// Morphius mounts this surface. The module owns what the user sees here.
// No secrets in this file. See docs/SECURITY_RULES.md.

import { useState } from "react";

interface Request {
  id: string;
  type: string;
  context?: string;
  decision?: "allow" | "block" | "needs_changes";
}

const mono = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: 13,
  ...extra,
});

const DECISION_COLOR: Record<string, string> = {
  allow: "#4ade80",
  block: "#ff4444",
  needs_changes: "#888",
};

export default function MyProvider() {
  const [requests, setRequests] = useState<Request[]>([
    { id: "req-1", type: "approval.request", context: '{ "action": "deploy", "env": "staging" }' },
    { id: "req-2", type: "approval.request", context: '{ "action": "delete", "resource": "users/42" }' },
  ]);
  const [testInput, setTestInput] = useState('{ "type": "approval.request" }');
  const [testResult, setTestResult] = useState<string | null>(null);

  function decide(id: string, decision: Request["decision"]) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, decision } : r));
  }

  function handleTest() {
    try {
      const parsed = JSON.parse(testInput);
      // TODO: replace with real handler call
      setTestResult(JSON.stringify({ decision: "allow", reason: "[MOCK] Auto-allowed" }, null, 2));
      void parsed;
    } catch {
      setTestResult("Invalid JSON input");
    }
  }

  const pending = requests.filter((r) => !r.decision);
  const resolved = requests.filter((r) => r.decision);

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
          background: "#4ade80",
          boxShadow: "0 0 4px #4ade80",
          flexShrink: 0,
        }} />
        <span style={mono({ fontSize: 11, color: "#666", letterSpacing: "0.1em", flex: 1 })}>
          PROVIDER — APPROVAL
        </span>
        <span style={mono({ fontSize: 11, color: "#444" })}>
          {pending.length} PENDING
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #1e1e1e" }}>
            <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>
              PENDING APPROVALS
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {pending.map((r) => (
                <div key={r.id} style={{ border: "1px solid #2a2a2a", padding: "8px 10px" }}>
                  <div style={mono({ fontSize: 12, color: "#ccc", marginBottom: 4 })}>{r.type}</div>
                  {r.context && (
                    <pre style={mono({ fontSize: 11, color: "#555", margin: "0 0 8px", whiteSpace: "pre-wrap" })}>
                      {r.context}
                    </pre>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["allow", "block", "needs_changes"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => decide(r.id, d)}
                        style={mono({
                          background: "transparent",
                          border: `1px solid ${DECISION_COLOR[d]}44`,
                          color: DECISION_COLOR[d],
                          padding: "3px 10px",
                          cursor: "pointer",
                          fontSize: 11,
                          letterSpacing: "0.08em",
                        })}
                      >
                        {d.toUpperCase().replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #1e1e1e" }}>
            <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>RESOLVED</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
              {resolved.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: DECISION_COLOR[r.decision!],
                    flexShrink: 0,
                  }} />
                  <span style={mono({ fontSize: 12, color: "#555", flex: 1 })}>{r.type}</span>
                  <span style={mono({ fontSize: 11, color: DECISION_COLOR[r.decision!] })}>
                    {r.decision!.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test panel */}
        <div style={{ padding: "10px 12px" }}>
          <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>TEST REQUEST</span>
          <div style={{ display: "flex", gap: 6, marginTop: 6, marginBottom: 6 }}>
            <input
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              style={{
                flex: 1,
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                color: "#e0e0e0",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                padding: "5px 8px",
                outline: "none",
              }}
            />
            <button
              onClick={handleTest}
              style={mono({
                background: "transparent",
                border: "1px solid #3a3a3a",
                color: "#ccc",
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: "0.08em",
                flexShrink: 0,
              })}
            >
              ▶ TEST
            </button>
          </div>
          {testResult && (
            <pre style={mono({
              background: "#0a0a0a",
              border: "1px solid #2a2a2a",
              padding: 8,
              margin: 0,
              fontSize: 11,
              color: "#aaa",
              whiteSpace: "pre-wrap",
            })}>
              {testResult}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
}
