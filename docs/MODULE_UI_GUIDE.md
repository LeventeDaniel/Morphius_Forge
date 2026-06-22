# Module UI Guide

Every serious module should ship its own interface.

Morphius is a blank canvas. It mounts modules. It does not build dashboards, status cards, or action buttons for them. Whatever the user sees when they open a module comes entirely from the module itself.

This guide explains how to design and declare that interface.

---

## The core rule

> **The module owns its interface. Morphius only mounts it.**

Morphius does not invent controls for your module. Morphius does not generate a status card from your manifest fields. Morphius does not build a button for each action you declare.

You declare the surface. You build the UI. Morphius mounts it.

---

## What belongs in a module interface

Think about what your module actually does — then surface it directly.

| Module type | What the UI should show |
|---|---|
| Connect | Connections, health status, missing env refs, redacted diagnostics |
| Module Host | Registered capabilities, running state, call tester |
| Prompt Cleaner | Input box, cleaned output, token count, rewrite controls |
| Benchmark | Models, tests, run history, results table, cost |
| Approval | Pending approvals, allow/block/defer buttons, context, audit trail |
| Source Search | Query box, source list, results, filters, evidence extraction |
| LLM Connector | Connection status, model info, test prompt, latency |
| Memory | Memory entries, search, add/delete, tags |
| Logger | Log stream, filters, level counts, clear button |

If your module does something, the UI should reflect it — not hide it behind a generic card.

---

## Declaring UI surfaces in the manifest

Add a `ui` block to your `manifest.json`:

```json
{
  "ui": {
    "surfaces": [
      {
        "id": "main",
        "name": "Main Interface",
        "entry": "./src/module.tsx",
        "kind": "window",
        "purpose": "primary-control",
        "reflects": ["status", "capabilities", "actions", "results"],
        "actions": ["run", "clear"],
        "defaultSize": {
          "width": 720,
          "height": 520
        }
      }
    ],
    "primarySurface": "main"
  }
}
```

### Surface fields

| Field | Required | Description |
|---|---|---|
| `id` | yes | Kebab-case identifier (e.g. `main`, `task-runner`) |
| `name` | yes | Human-readable name shown in Morphius surface picker |
| `entry` | yes | Path to the React component file |
| `kind` | no | `window` \| `panel` \| `overlay` \| `embedded` |
| `purpose` | no | See purposes table below |
| `reflects` | no | What this surface shows — informational |
| `actions` | no | Action IDs that appear as controls in this surface |
| `defaultSize` | no | Initial width/height in pixels |

### Surface purposes

| Purpose | When to use |
|---|---|
| `primary-control` | The main interface — what the user opens the module for |
| `status` | A compact read-only status view |
| `settings` | Module configuration |
| `task-runner` | Workflow or multi-step task execution |
| `results` | Output, history, or record display |
| `logs` | Log stream or event history |
| `review` | Review/approval/decision surface |
| `diagnostics` | Health checks, internals, debug info |

---

## Multiple surfaces

A module can expose more than one surface. Each surface is a separate component.

```json
{
  "ui": {
    "surfaces": [
      {
        "id": "main",
        "purpose": "primary-control",
        "entry": "./src/module.tsx",
        ...
      },
      {
        "id": "logs",
        "purpose": "logs",
        "entry": "./src/logs.tsx",
        ...
      },
      {
        "id": "diagnostics",
        "purpose": "diagnostics",
        "entry": "./src/diagnostics.tsx",
        ...
      }
    ],
    "primarySurface": "main"
  }
}
```

Morphius can mount each surface in a separate window or tab. Start with one surface. Add more as the module matures.

---

## Action UI metadata

Actions are not just metadata. They become controls inside your module.

Declare `ui` on each action to tell Forge (and future tooling) how that action is represented:

```json
{
  "actions": [
    {
      "id": "run",
      "name": "Run",
      "kind": "safe",
      "ui": {
        "buttonLabel": "▶ RUN",
        "placement": "primary"
      }
    },
    {
      "id": "delete",
      "name": "Delete Record",
      "kind": "destructive",
      "ui": {
        "buttonLabel": "DELETE",
        "placement": "context",
        "confirmMessage": "This will permanently delete the record. Continue?"
      }
    },
    {
      "id": "approve",
      "name": "Approve",
      "kind": "approval-required",
      "ui": {
        "buttonLabel": "APPROVE",
        "placement": "primary"
      }
    }
  ]
}
```

### Action kinds

| Kind | When to use |
|---|---|
| `safe` | Read-only or reversible — no side effects |
| `external` | Calls an external API or service |
| `destructive` | Deletes, overwrites, or irreversibly modifies — add `confirmMessage` |
| `approval-required` | Requires human approval before executing |

### Action placement

| Placement | Meaning |
|---|---|
| `primary` | Main action button — visible prominently |
| `secondary` | Supporting action — below or alongside primary |
| `toolbar` | Icon/compact button in a toolbar row |
| `context` | Inline with a record or item (e.g. per-row delete) |

---

## Compatibility levels and UI

The validator uses UI completeness as part of level assignment:

| Level | UI requirement |
|---|---|
| Level 1 — Loadable | No UI surface required — module will load with the entry file only |
| Level 2 — Usable | `ui.surfaces` declared with at least one surface |
| Level 3 — Actionable | `actions` declared with `ui` metadata on each action |
| Level 4 — Advanced | Multiple surfaces including `diagnostics` or `logs` |

Minimal modules (Level 1) are fine. They load. The validator will recommend adding UI surfaces to reach Level 2.

---

## Design rules

See [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for the full visual language.

Quick rules:

- **Palette**: black (`#000`–`#111`), dark grey (`#181818`–`#2a2a2a`), mid grey (`#555`–`#888`), light grey (`#aaa`–`#e0e0e0`). Single accent: `#4ade80`.
- **No** blue, purple, yellow, or orange. Ever.
- **No** rounded corners. `border-radius: 0` everywhere.
- **No** drop shadows or gradients.
- **Fonts**: monospace only. Minimum 11px.
- **Labels**: `UPPERCASE` with `letter-spacing: 0.1em` in `#555`–`#666`.
- **Status dots**: 5–6px circle. Green glow = ok. Red = error. Dark = idle.
- **Buttons**: transparent background, 1px border, uppercase label. Hover shifts border to accent color.

---

## What to avoid

**Avoid generic status cards.** A card that says "Module: Active / Version: 1.0.0" tells the user nothing about what the module does. Show the actual state, the actual data, the actual controls.

**Avoid SaaS dashboard patterns.** No big hero metric tiles. No donut charts for things that don't need them. No empty state illustrations. No friendly onboarding copy.

**Avoid hiding real capability.** If the module has 5 actions, show 5 controls — not a generic "Run" button that could mean anything.

**Avoid copying Morphius chrome.** The module surface is inside a Morphius window. Don't recreate a window titlebar, app sidebar, or nav drawer inside the surface. That's Morphius's job.

---

## Example: minimal real interface

A Prompt Cleaner module (input → cleaned output):

```tsx
export default function PromptCleaner() {
  const [prompt, setPrompt] = useState('');
  const [cleaned, setCleaned] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState<number | null>(null);

  async function clean() {
    const result = await callAction('clean', { prompt });
    setCleaned(result.cleaned);
    setTokenCount(result.tokenCount);
  }

  return (
    <div className="mf-module">
      <div className="mf-module__header">
        <span className="mf-label">PROMPT CLEANER</span>
        {tokenCount !== null && (
          <span style={{ color: '#555', fontSize: 11 }}>{tokenCount} TOKENS</span>
        )}
      </div>
      <div className="mf-module__body">
        <label className="mf-label">INPUT PROMPT</label>
        <textarea className="mf-textarea" value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} />
        <button className="mf-button mf-button--primary" onClick={clean}>▶ CLEAN</button>
        {cleaned && (
          <>
            <label className="mf-label">CLEANED OUTPUT</label>
            <pre className="mf-pre">{cleaned}</pre>
          </>
        )}
      </div>
    </div>
  );
}
```

This is small — 40 lines — but it shows: the module's name, the token budget, the real action, the real output.

---

## Checklist

Before shipping a module:

- [ ] `ui.surfaces` declared in manifest with at least one surface
- [ ] `ui.primarySurface` set
- [ ] Each declared action has `ui.buttonLabel` and `ui.placement`
- [ ] Destructive actions have `ui.confirmMessage`
- [ ] The main surface shows actual module state — not a placeholder
- [ ] Colors pass design rules (no blue/purple/yellow/orange, no rounded corners)
- [ ] Font size ≥ 11px throughout
- [ ] No secrets or credentials in any UI file
- [ ] `morphius-forge validate <path>` passes with no errors
