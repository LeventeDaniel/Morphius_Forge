# Morphius Design Guide

Version: 0.4.0

---

## Philosophy

Morphius is a desktop-like webtop: floating windows on a canvas, not a page. Modules should feel like tools in a professional workspace — focused, minimal, and fast.

**Following this guide is required for Forge validation.** Modules that use off-palette colors or font sizes below 11px will generate warnings during `morphius-forge validate`.

---

## Color palette

Use CSS variables where possible. Raw hex is accepted only from the allowed spectrum below.

| CSS Variable | Value | Usage |
|---|---|---|
| `--bg-webtop` | `#050505` | Canvas background |
| `--bg-primary` | `#0a0a0a` | Page base |
| `--bg-deep` | `#0d0d0d` | Deepest panels |
| `--bg-secondary` | `#111` | Window interiors |
| `--bg-panel` | `#161616` | Cards, inputs |
| `--bg-elevated` | `#1a1a1a` | Slightly raised surfaces |
| `--bg-titlebar` | `#1e1e1e` | Title bars, section headers |
| `--border-subtle` | `#1a1a1a` | Section dividers |
| `--border` | `#2a2a2a` | All borders |
| `--border-accent` | `#3a3a3a` | Focused borders |
| `--text-primary` | `#e8e8e8` | Main readable text |
| `--text-secondary` | `#888` | Descriptions |
| `--text-dim` | `#666` | Dimmer secondary |
| `--text-muted` | `#444` | Labels, metadata |
| `--text-ghost` | `#333` | Placeholders, very dim |
| `--status-ok` / `--accent` | `#4ade80` | **Only accent** — active states, success |
| `--status-warn` | `#555` | Warnings — never yellow |
| `--status-error` | `#f87171` | Errors only |

**Rules:**
- `#4ade80` is the **only** accent color. Use it sparingly — status dots, active indicators, caret color.
- No yellows, blues, purples, or other accent colors. Forge validator will warn on these.
- Warnings use `var(--status-warn)` (`#555`/`#666`) not yellow.
- Errors use `var(--status-error)` only when something has actually failed.
- All other UI: use CSS variables or the grey shades `#111`–`#e8e8e8`.

---

## Typography

- Monospace font: use `var(--font-mono)` or `'JetBrains Mono', 'Fira Code', 'Courier New', monospace`
- Minimum font size is **11px** — Forge validator warns on anything smaller.

| Role | Size |
|---|---|
| Tiny labels / badges | 11px |
| Section labels / chips | 13px |
| Body data / descriptions | 14px |
| Standard UI text | 15px |
| Primary readable text | 17–18px |
| Module base font-size | 18px |
| Headings / names | 17–18px |

- Uppercase labels with `letter-spacing: 0.08–0.12em`
- No drop shadows, no text shadows

---

## Window design

- Dark background — no white or near-white surfaces
- 1px borders with `var(--border)`
- No rounded corners (sharp edges)
- No gradients
- No drop shadows
- Compact padding: 8–12px
- Section dividers with `border-top: 1px solid var(--border-subtle)`

---

## Window sizing and positioning

Declare a `window` block in your manifest. `initialPosition: "center"` is recommended — it places the window in the center of the canvas when first opened, which works for any screen size.

```json
"window": {
  "defaultWidth": 480,
  "defaultHeight": 380,
  "resizable": true,
  "minimizable": true,
  "initialPosition": "center"
}
```

`initialPosition` options: `"center"`, `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`

Recommended sizes:
- Narrow information panels: 360–420px wide
- Action-heavy modules: 420–520px wide
- Data-heavy modules: 520–640px wide
- Height: 300–520px for most use cases

---

## Labels

Use all-caps short labels above data blocks:

```jsx
<div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
  PERMISSIONS
</div>
```

---

## Status indicators

Small colored dots for status. Green only for active/ok:

```jsx
<span style={{
  width: 6, height: 6, borderRadius: '50%',
  background: isOnline ? 'var(--status-ok)' : 'var(--status-warn)',
  flexShrink: 0,
}} />
```

---

## Chips / tags

```jsx
<span style={{
  fontSize: 13,
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  border: '1px solid var(--border)',
  padding: '2px 6px',
  letterSpacing: '0.05em',
}}>
  CHIP LABEL
</span>
```

---

## Buttons

```jsx
<button style={{
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  letterSpacing: '0.08em',
  padding: '4px 10px',
  cursor: 'pointer',
  textAlign: 'left',
}}>
  ▶ ACTION NAME
</button>
```

---

## Scrollable areas

Use `overflowY: 'auto'` with a max height. Do not show scroll bars unless content exceeds available space.

---

## Forge validation

Running `morphius-forge validate <path>` checks:
- Manifest structure and required fields
- Entry files exist
- No hardcoded secrets in source files
- No off-palette accent colors (blues, purples, yellows, oranges) — **warning**
- No font sizes below 11px — **warning**

Validation warnings do not block loading but are shown in the Forge status window inside Morphius.

---

## Progressive design

If your module is Level 1 (loadable) only, Morphius will show its name, version, type, and source. You don't need to implement any UI for the module to appear — the generic module window handles the basics.

Add UI progressively as you add more manifest metadata.
