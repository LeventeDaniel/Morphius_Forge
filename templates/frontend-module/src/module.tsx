// {{MODULE_TITLE}} — Morphius Frontend Module
// This is your module's interface. Morphius mounts this surface.
// Morphius does not build controls or dashboards for your module — this file is it.
//
// Design rules (docs/DESIGN_GUIDE.md):
//   - Black/white/dark-grey palette only — no blue, purple, yellow, orange
//   - Monospace font, minimum 11px
//   - No rounded corners, no drop shadows, no gradients
//   - Labels in UPPERCASE with letter-spacing
//   - Status dots: green = ok, red = error
//
// Security rules (docs/SECURITY_RULES.md):
//   - No secrets, API keys, or credentials in this file ever

import { useState } from "react";
import "./styles.css";

interface RunResult {
  ok: boolean;
  output?: string;
  error?: string;
}

export default function {{MODULE_TITLE}}Module() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  // TODO: replace this mock handler with your real action logic
  async function handleRun() {
    if (!input.trim()) return;
    setRunning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 300));
    setResult({ ok: true, output: `[MOCK] Processed: ${input}` });
    setRunning(false);
  }

  return (
    <div className="mf-module">
      <div className="mf-module__header">
        <div className="mf-header-left">
          <span
            className="mf-status-dot"
            style={{ background: result ? (result.ok ? 'var(--color-accent)' : '#ff4444') : '#333' }}
          />
          <span className="mf-label">{{MODULE_TITLE}}</span>
        </div>
      </div>

      <div className="mf-module__body">

        <label className="mf-label">INPUT</label>
        <textarea
          className="mf-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input…"
          rows={4}
        />

        <button
          className="mf-button mf-button--primary"
          onClick={handleRun}
          disabled={running || !input.trim()}
        >
          {running ? "…" : "▶ RUN"}
        </button>

        {result && (
          <div className="mf-output">
            <label className="mf-label">{result.ok ? "OUTPUT" : "ERROR"}</label>
            <pre className="mf-pre">{result.ok ? result.output : result.error}</pre>
          </div>
        )}

      </div>
    </div>
  );
}
