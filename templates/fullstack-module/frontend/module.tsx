// {{MODULE_TITLE}} — Morphius Fullstack Module — Frontend
// Calls backend actions via Morphius runtime bridge (never directly to external APIs).
// No secrets here. See docs/SECURITY_RULES.md.

import React, { useState } from "react";
import "./styles.css";

export default function {{MODULE_TITLE}}Module() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setOutput("");

    try {
      // In production, call via Morphius runtime bridge:
      // const result = await morphius.callAction("exampleAction", { text: input });
      // For now, mock locally:
      await new Promise((r) => setTimeout(r, 400));
      setOutput(`[MOCK] Processed: ${input}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mf-module">
      <div className="mf-module__header">
        <span className="mf-module__title">{{MODULE_TITLE}}</span>
      </div>
      <div className="mf-module__body">
        <label className="mf-label">Input</label>
        <textarea
          className="mf-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input..."
          rows={4}
          disabled={loading}
        />
        <button className="mf-button" onClick={handleRun} disabled={loading}>
          {loading ? "Running..." : "Run"}
        </button>
        {error && <div className="mf-error">{error}</div>}
        {output && (
          <div className="mf-output">
            <label className="mf-label">Output</label>
            <pre className="mf-pre">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
