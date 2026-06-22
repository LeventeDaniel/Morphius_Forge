// EXAMPLE MODULE — Output Validator
// Validates that text is valid JSON and optionally checks required keys.
// No secrets, no external API calls.

import React, { useState } from "react";

interface ValidationResult {
  valid: boolean;
  isJson: boolean;
  missingKeys: string[];
  parseError?: string;
}

function validate(text: string, requiredKeys: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { valid: false, isJson: false, missingKeys: [], parseError: (e as Error).message };
  }

  const keys = requiredKeys
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const missing =
    typeof parsed === "object" && parsed !== null
      ? keys.filter((k) => !(k in (parsed as Record<string, unknown>)))
      : keys.length > 0
      ? keys
      : [];

  return { valid: missing.length === 0, isJson: true, missingKeys: missing };
}

export default function OutputValidatorModule() {
  const [text, setText] = useState("");
  const [keys, setKeys] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  function handleValidate() {
    setResult(validate(text, keys));
  }

  return (
    <div style={styles.module}>
      <div style={styles.header}>
        <span style={styles.title}>Output Validator</span>
        <span style={styles.badge}>EXAMPLE</span>
      </div>
      <div style={styles.body}>
        <label style={styles.label}>LLM Output (JSON)</label>
        <textarea
          style={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{"key": "value"}'
          rows={5}
        />
        <label style={styles.label}>Required Keys (comma-separated, optional)</label>
        <input
          style={styles.input}
          value={keys}
          onChange={(e) => setKeys(e.target.value)}
          placeholder="e.g. result, status, timestamp"
        />
        <button style={styles.button} onClick={handleValidate}>
          Validate
        </button>
        {result && (
          <div style={{ ...styles.resultBox, borderColor: result.valid ? "#2a4a2a" : "#4a2a2a" }}>
            <div style={{ color: result.valid ? "#4ade80" : "#f87171", fontSize: 17, fontWeight: "bold" }}>
              {result.valid ? "✓ VALID" : "✗ INVALID"}
            </div>
            {!result.isJson && (
              <div style={styles.detail}>JSON parse error: {result.parseError}</div>
            )}
            {result.missingKeys.length > 0 && (
              <div style={styles.detail}>Missing keys: {result.missingKeys.join(", ")}</div>
            )}
            {result.valid && <div style={styles.detail}>All checks passed.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  module: { fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", fontSize: 18, color: "#e0e0e0", background: "#111", height: "100%", display: "flex", flexDirection: "column", border: "1px solid #2a2a2a" },
  header: { padding: "8px 12px", borderBottom: "1px solid #2a2a2a", background: "#181818", display: "flex", alignItems: "center", gap: 10 },
  title: { fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" },
  badge: { fontSize: 13, letterSpacing: "0.1em", color: "#555", border: "1px solid #333", padding: "1px 5px" },
  body: { padding: 12, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" },
  textarea: { background: "#0a0a0a", color: "#e0e0e0", border: "1px solid #2a2a2a", padding: 8, fontFamily: "inherit", fontSize: 17, resize: "vertical", outline: "none" },
  input: { background: "#0a0a0a", color: "#e0e0e0", border: "1px solid #2a2a2a", padding: "6px 8px", fontFamily: "inherit", fontSize: 17, outline: "none" },
  button: { background: "#1e1e1e", color: "#ccc", border: "1px solid #333", padding: "6px 14px", fontFamily: "inherit", fontSize: 15, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", alignSelf: "flex-start" },
  resultBox: { border: "1px solid #333", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 },
  detail: { fontSize: 15, color: "#777" },
};
