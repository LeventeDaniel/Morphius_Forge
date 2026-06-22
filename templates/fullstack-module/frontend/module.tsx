// {{MODULE_TITLE}} — Morphius Fullstack Module — Main Interface
// This surface is mounted by Morphius. This module owns what the user sees.
// Morphius does not build dashboards or controls for this module.
// Calls backend via Morphius runtime bridge — never directly to external APIs.
// No secrets here. See docs/SECURITY_RULES.md.

import { useState } from "react";
import "./styles.css";

interface ActionResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

export default function {{MODULE_TITLE}}Module() {
  const [input, setInput] = useState("");
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    if (!input.trim()) return;
    setRunning(true);
    setActionResult(null);

    try {
      // In production, call via Morphius runtime bridge:
      // const result = await morphius.callAction("exampleAction", { text: input });
      // For local dev, mock:
      await new Promise((r) => setTimeout(r, 400));
      setActionResult({ ok: true, result: `[MOCK] Processed: ${input}` });
    } catch (err) {
      setActionResult({ ok: false, error: (err as Error).message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mf-module">
      <div className="mf-module__header">
        <div className="mf-header-left">
          <span
            className="mf-status-dot"
            style={{
              background: actionResult
                ? actionResult.ok ? "var(--color-accent)" : "#ff4444"
                : "#333",
            }}
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
          disabled={running}
        />

        <button
          className="mf-button mf-button--primary"
          onClick={handleRun}
          disabled={running || !input.trim()}
        >
          {running ? "…" : "▶ RUN"}
        </button>

        {actionResult && (
          <div className="mf-output">
            <label className="mf-label">{actionResult.ok ? "RESULT" : "ERROR"}</label>
            <pre className="mf-pre">
              {actionResult.ok
                ? typeof actionResult.result === "string"
                  ? actionResult.result
                  : JSON.stringify(actionResult.result, null, 2)
                : actionResult.error}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
