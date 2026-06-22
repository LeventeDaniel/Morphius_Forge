// EXAMPLE MODULE — Prompt Cleaner
// This is a demo module for Morphius Forge. It runs entirely in the browser.
// No external API calls, no secrets, no connectors needed.

import React, { useState } from "react";

export interface CleanPromptInput {
  text: string;
}

export interface CleanPromptOutput {
  cleaned: string;
  originalLength: number;
  cleanedLength: number;
}

function cleanPrompt(text: string): CleanPromptOutput {
  const originalLength = text.length;
  let cleaned = text
    .replace(/\r\n/g, "\n")           // normalize line endings
    .replace(/[ \t]+$/gm, "")         // trim trailing whitespace per line
    .replace(/\n{3,}/g, "\n\n")       // collapse 3+ blank lines to 2
    .replace(/^\s+|\s+$/g, "")        // trim leading/trailing blank lines
    .split("\n")
    .filter((line, i, arr) => {       // remove exact duplicate consecutive lines
      return i === 0 || line !== arr[i - 1];
    })
    .join("\n");

  return { cleaned, originalLength, cleanedLength: cleaned.length };
}

export default function PromptCleanerModule() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CleanPromptOutput | null>(null);

  function handleClean() {
    if (!input.trim()) return;
    setResult(cleanPrompt(input));
  }

  function handleCopy() {
    if (result) navigator.clipboard.writeText(result.cleaned);
  }

  const savings = result
    ? Math.round(((result.originalLength - result.cleanedLength) / result.originalLength) * 100)
    : 0;

  return (
    <div style={styles.module}>
      <div style={styles.header}>
        <span style={styles.title}>Prompt Cleaner</span>
        <span style={styles.badge}>EXAMPLE</span>
      </div>
      <div style={styles.body}>
        <label style={styles.label}>Raw Prompt</label>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your prompt here..."
          rows={6}
        />
        <button style={styles.button} onClick={handleClean}>
          Clean
        </button>
        {result && (
          <div>
            <div style={styles.stats}>
              {result.originalLength} → {result.cleanedLength} chars
              {savings > 0 ? ` (−${savings}%)` : ""}
            </div>
            <label style={styles.label}>Cleaned</label>
            <pre style={styles.pre}>{result.cleaned}</pre>
            <button style={{ ...styles.button, marginTop: 6 }} onClick={handleCopy}>
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  module: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: 18,
    color: "#e0e0e0",
    background: "#111",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #2a2a2a",
  },
  header: {
    padding: "8px 12px",
    borderBottom: "1px solid #2a2a2a",
    background: "#181818",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" },
  badge: {
    fontSize: 13,
    letterSpacing: "0.1em",
    color: "#555",
    border: "1px solid #333",
    padding: "1px 5px",
  },
  body: { padding: 12, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" },
  textarea: {
    background: "#0a0a0a", color: "#e0e0e0", border: "1px solid #2a2a2a",
    padding: 8, fontFamily: "inherit", fontSize: 17, resize: "vertical", outline: "none",
  },
  button: {
    background: "#1e1e1e", color: "#ccc", border: "1px solid #333",
    padding: "6px 14px", fontFamily: "inherit", fontSize: 15,
    textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", alignSelf: "flex-start",
  },
  stats: { fontSize: 15, color: "#555", marginBottom: 4 },
  pre: {
    background: "#0a0a0a", border: "1px solid #2a2a2a", padding: 8,
    fontFamily: "inherit", fontSize: 17, whiteSpace: "pre-wrap", wordBreak: "break-word",
    margin: 0, color: "#aaa",
  },
};
