# Morphius Design Guide

Version: 0.5.0

---

## Philosophy

Morphius is a desktop-like webtop: floating windows on a canvas, not a page. Modules should feel like tools in a professional workspace — focused, minimal, and fast.

**Morphius is a blank canvas. Every interface the user sees comes from a module.**

Morphius mounts what modules declare. It does not generate status cards from manifest fields, does not create buttons from action arrays, does not build dashboards. If a module has a real capability, its UI surface must show it.

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
- `#4ade80` is the **only** accent color. Use it sparingly — status dots, active indicators, button hover borders.
- **No** yellows, blues, purples, or other accent colors. Forge validator will warn on these.
- Warnings use `var(--status-warn)` (`#555`/`#666`) not yellow.
- Errors use `var(--status-error)` only when something has actually failed.
- All other UI: use CSS variables or the grey shades `#111`–`#e8e8e8`.

---

## Typography

- Monospace font only: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`
- Minimum font size is **11px** — Forge validator warns on anything smaller.

| Role | Size |
|---|---|
| Tiny labels / badges | 11px |
| Section labels / chips | 12–13px |
| Body data / descriptions | 13px |
| Standard UI text | 13px |
| Primary readable text | 14px |

- Uppercase labels with `letter-spacing: 0.08–0.12em`
- No drop shadows, no text shadows

---

## Window design

- Dark background — no white or near-white surfaces
- 1px borders with `var(--border)`
- **No rounded corners** — `border-radius: 0` everywhere
- **No gradients**
- **No drop shadows**
- Compact padding: 8–12px
- Section dividers with `border-top: 1px solid var(--border-subtle)`

---

## Window sizing and surfaces

Declare `ui.surfaces` with `defaultSize` for each surface. Also declare a `window` block as a sizing fallback.

```json
"ui": {
  "surfaces": [
    {
      "id": "main",
      "entry": "./src/module.tsx",
      "kind": "window",
      "purpose": "primary-control",
      "defaultSize": { "width": 620, "height": 460 }
    }
  ],
  "primarySurface": "main"
},
"window": {
  "defaultWidth": 620,
  "defaultHeight": 460,
  "resizable": true,
  "minimizable": true,
  "initialPosition": "center"
}
```

Recommended sizes:
- Narrow information panels: 360–420px wide
- Action-heavy modules: 480–640px wide
- Data-heavy modules: 640–760px wide
- Height: 360–560px for most use cases

---

## Labels

Use all-caps short labels above data blocks:

```jsx
<div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
  PERMISSIONS
</div>
```

---

## Status indicators

Small colored dots for status. Green for ok. Red for error. Dark (`#2a2a2a`–`#333`) for idle.

```jsx
<span style={{
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: isOnline ? '#4ade80' : '#ff4444',
  boxShadow: isOnline ? '0 0 4px #4ade80' : 'none',
  flexShrink: 0,
  display: 'inline-block',
}} />
```

---

## Chips / tags

```jsx
<span style={{
  fontSize: 11,
  color: '#666',
  fontFamily: 'var(--font-mono)',
  border: '1px solid var(--border)',
  padding: '1px 5px',
  letterSpacing: '0.05em',
}}>
  CHIP LABEL
</span>
```

---

## Buttons

```jsx
<button style={{
  background: 'transparent',
  border: '1px solid var(--border)',
  color: '#ccc',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.1em',
  padding: '5px 14px',
  cursor: 'pointer',
  textTransform: 'uppercase',
}}>
  ▶ RUN
</button>
```

On hover (primary action):
```css
border-color: #4ade80;
color: #4ade80;
```

On disabled:
```css
opacity: 0.4;
cursor: default;
```

---

## Scrollable areas

Use `overflow-y: auto` with `flex: 1` on the body area. Do not show scrollbars unless content exceeds available space.

---

## Module UI: what to show

**Morphius mounts your surface and stops there. The rest is yours.**

A capable module's main surface should show:

| Category | What to include |
|---|---|
| Status | Online / offline / degraded — status dot + label |
| Capabilities | What the module can actually do — list or summary |
| Config needs | Whether required config/connections are present (not the values) |
| Action controls | A button or control for each action the module exposes |
| Results / output | Inline output block after action runs |
| Logs / diagnostics | In a separate logs or diagnostics surface |

---

## What to avoid

**Avoid generic status cards.** "Module: Active" tells the user nothing. Show the actual state, data, and controls.

**Avoid SaaS dashboard patterns:**
- No hero metric tiles
- No donut charts for things that don't need them
- No empty state illustrations
- No friendly onboarding copy

**Avoid copying Morphius chrome.** The module surface is inside a Morphius window. Don't recreate a window titlebar, app sidebar, or navigation drawer inside the surface.

**Avoid hiding real capability.** If the module has 5 actions, show 5 controls.

---

## Security

- **Never expose** secrets, tokens, API keys, raw env values
- **Never auto-execute** risky actions on load
- **Never import** server-only code or credential files into surface components

---

## Forge validation

Running `morphius-forge validate <path>` checks:
- Manifest structure and required fields
- Entry and surface files exist
- No hardcoded secrets in source files
- No off-palette accent colors (blues, purples, yellows, oranges) — **warning**
- No font sizes below 11px — **warning**

Validation warnings do not block loading.

---

## Size guidance

| Module complexity | Expected surface |
|---|---|
| Single read-only capability | Status row + one data section |
| Multiple capabilities | Status header + section per capability |
| Action-heavy | Status + capability list + per-action controls |
| Provider / host | Status + registered items + health per item + diagnostic surface |
