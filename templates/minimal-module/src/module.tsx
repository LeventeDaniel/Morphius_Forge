// Minimal module — Level 1 (loadable). This is enough to mount in Morphius.
// Add description + ui.surfaces to your manifest to reach Level 2 (usable).
// See docs/MODULE_UI_GUIDE.md for how to build a real module interface.

export default function MyModule() {
  return (
    <div style={{ padding: 16, color: '#e8e8e8', fontFamily: 'monospace', fontSize: 13 }}>
      My Module — replace this with your interface.
    </div>
  );
}
