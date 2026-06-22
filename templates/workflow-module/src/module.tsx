// Workflow module UI — shows steps, inputs, and results.
// The module owns this surface. Morphius mounts it.
// Morphius does not build a runner UI for this module — this is it.

import { useState } from "react";

interface Step {
  id: string;
  name: string;
  state: "idle" | "running" | "done" | "error";
  output?: string;
}

const INITIAL_STEPS: Step[] = [
  { id: "step-1", name: "Step 1", state: "idle" },
  { id: "step-2", name: "Step 2", state: "idle" },
];

const mono = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: 13,
  ...extra,
});

const stepColor = (s: Step["state"]) => {
  if (s === "done") return "#4ade80";
  if (s === "error") return "#ff4444";
  if (s === "running") return "#888";
  return "#2a2a2a";
};

export default function MyWorkflowModule() {
  const [userText, setUserText] = useState("");
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    if (!userText.trim()) return;
    setRunning(true);
    setFinalResult(null);
    const fresh = INITIAL_STEPS.map((s) => ({ ...s, state: "idle" as const }));
    setSteps(fresh);

    // TODO: replace mock with real workflow execution
    for (let i = 0; i < fresh.length; i++) {
      setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, state: "running" } : s));
      await new Promise((r) => setTimeout(r, 500));
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, state: "done", output: `[MOCK] Step ${i + 1} output for: ${userText}` } : s
        )
      );
    }

    setFinalResult(`[MOCK] Final result for: ${userText}`);
    setRunning(false);
  }

  function reset() {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, state: "idle" })));
    setFinalResult(null);
    setUserText("");
  }

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
        <span style={mono({ fontSize: 11, color: "#666", letterSpacing: "0.1em" })}>
          WORKFLOW RUNNER
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>

        <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>INPUT</span>
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          disabled={running}
          rows={3}
          placeholder="Enter workflow input…"
          style={{
            background: "#0a0a0a",
            border: "1px solid #2a2a2a",
            color: "#e0e0e0",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "7px 8px",
            resize: "vertical",
            outline: "none",
            width: "100%",
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleRun}
            disabled={running || !userText.trim()}
            style={mono({
              background: "transparent",
              border: "1px solid #3a3a3a",
              color: running ? "#555" : "#ccc",
              padding: "5px 16px",
              cursor: running ? "default" : "pointer",
              letterSpacing: "0.1em",
              fontSize: 12,
            })}
          >
            {running ? "RUNNING…" : "▶ RUN WORKFLOW"}
          </button>
          {finalResult && (
            <button
              onClick={reset}
              style={mono({
                background: "transparent",
                border: "1px solid #2a2a2a",
                color: "#444",
                padding: "5px 12px",
                cursor: "pointer",
                letterSpacing: "0.1em",
                fontSize: 12,
              })}
            >
              ↺ RESET
            </button>
          )}
        </div>

        {/* Step list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step) => (
            <div key={step.id} style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid #1e1e1e",
              padding: "6px 10px",
              gap: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: stepColor(step.state),
                  boxShadow: step.state === "done" ? "0 0 4px #4ade80" : "none",
                  flexShrink: 0,
                }} />
                <span style={mono({ fontSize: 13, color: step.state === "idle" ? "#444" : "#ccc" })}>
                  {step.name}
                </span>
                <span style={mono({ fontSize: 11, color: "#444", marginLeft: "auto" })}>
                  {step.state.toUpperCase()}
                </span>
              </div>
              {step.output && (
                <pre style={mono({
                  margin: 0,
                  fontSize: 11,
                  color: "#555",
                  paddingLeft: 13,
                  whiteSpace: "pre-wrap",
                })}>
                  {step.output}
                </pre>
              )}
            </div>
          ))}
        </div>

        {finalResult && (
          <div>
            <span style={mono({ fontSize: 11, color: "#555", letterSpacing: "0.1em" })}>FINAL RESULT</span>
            <pre style={mono({
              background: "#0a0a0a",
              border: "1px solid #2a2a2a",
              padding: 8,
              margin: "4px 0 0",
              fontSize: 12,
              color: "#aaa",
              whiteSpace: "pre-wrap",
            })}>
              {finalResult}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
