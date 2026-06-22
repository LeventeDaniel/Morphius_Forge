// Settings surface — optional second surface example.
// This is where the module exposes its config controls.
// See manifest.json ui.surfaces for how surfaces are declared.

export default function Settings() {
  return (
    <div style={{ padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#aaa" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginBottom: 12 }}>
        SETTINGS
      </div>
      {/* TODO: add your module's config controls here */}
      <div style={{ color: "#333" }}>No settings configured.</div>
    </div>
  );
}
