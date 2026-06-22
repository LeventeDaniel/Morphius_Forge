// Diagnostics surface — shows provider internals, log entries, and health.
// Declared in manifest as ui.surfaces[1] with purpose: "diagnostics".

export default function Diagnostics() {
  return (
    <div style={{ padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#555" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#444", marginBottom: 10 }}>
        DIAGNOSTICS
      </div>
      {/* TODO: render provider logs, decision history, error counts here */}
      <div>No diagnostic data yet.</div>
    </div>
  );
}
