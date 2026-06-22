// {{MODULE_TITLE}} — Morphius Frontend Module
// Edit this file to implement your module UI.
// See docs/DESIGN_GUIDE.md for visual language rules.
//
// This file is intentionally minimal — add only what your module needs.
// No secrets, API keys, or credentials here. See docs/SECURITY_RULES.md.

import React, { useState } from "react";
import "./styles.css";

// Replace this with your module's actual props if Morphius passes context
interface ModuleProps {
  // Example: moduleId?: string;
}

export default function {{MODULE_TITLE}}Module(_props: ModuleProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  // TODO: replace this mock handler with your real logic
  function handleRun() {
    setOutput(`[MOCK] Processed: ${input}`);
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
        />
        <button className="mf-button" onClick={handleRun}>
          Run
        </button>
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
