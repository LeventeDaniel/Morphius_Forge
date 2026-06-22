# Morphius Compatibility Levels

Morphius uses **progressive compatibility**. A module does not need to be fully specified to load — it just needs the minimum required fields. Additional fields unlock higher levels with richer Morphius integration.

Forge validates against these levels and reports which level a module has reached.

---

## Levels

### LEVEL 1 — Loadable

Morphius can discover the module and mount the entry file as a surface.

**Required:**

| Field | Description |
|---|---|
| `id` | Unique kebab-case identifier (e.g. `my-module`) |
| `name` | Human-readable display name |
| `version` | Semver string (e.g. `1.0.0`) |
| `type` | Module type string |
| `entry` | Path to the entry file |

**Validator output:** PASSED with recommendations for missing UI surfaces and description.

---

### LEVEL 2 — Usable

Morphius can display the module with useful context, and the user can see a real interface.

**Adds (recommended):**

- `description` — short human-readable description
- `ui.surfaces` — at least one declared surface with `entry`, `id`, `purpose`
- `ui.primarySurface` — which surface is the main interface
- `permissions` — declared permission requirements
- `window` — default window size fallback
- `README.md` — human-readable documentation

**Why `ui.surfaces` matters here:**  
Morphius does not build a UI for the module. If no surface is declared, the user sees only the raw entry file without any module context. Declaring a surface with `purpose: "primary-control"` tells Morphius this is the module's real interface.

---

### LEVEL 3 — Actionable

The module exposes controls that reflect its true capabilities, and those controls are represented in the module's own UI.

**Adds (recommended):**

- `actions` — declared module actions with `kind` and `ui` metadata
- `actions[*].ui.buttonLabel` — label for the action control in the module's surface
- `actions[*].ui.placement` — where the control appears (`primary`, `secondary`, `toolbar`, `context`)
- `connectors` — symbolic references to Connect connections
- `secretRefs` — named references to secrets (names only, never values)
- `workflowCompatible` — whether the module participates in workflows
- `mockMode` — whether the module has a safe mock mode

**Note:** Actions appear as controls inside the module's own UI surface. Morphius does not auto-generate buttons from the actions array. The module's `module.tsx` renders the actual controls.

---

### LEVEL 4 — Advanced

The module fills a system role and exposes diagnostics.

**Adds (recommended):**

- `provider` — provider role metadata (see [PROVIDER_HINTS.md](PROVIDER_HINTS.md))
- `sandbox` — sandbox hints
- `ui.surfaces` with a `diagnostics` or `logs` surface
- Typed input/output schemas on actions (`inputSchema`, `outputSchema` as objects)
- `actions[*].ui.confirmMessage` on destructive actions

---

## Validation output

The Forge validator always outputs four categories:

| Category | Meaning |
|---|---|
| `errors` | Cannot load — fix these first |
| `warnings` | Can load but may be limited |
| `recommendations` | Would improve Morphius compatibility |
| `compatibilityLevel` | Current level based on present fields |

**Only errors block loading.** Warnings and recommendations are informational.

---

## How level is computed

| Condition | Level reached |
|---|---|
| Has all 5 required fields | ≥ Level 1 |
| Has `description` AND `ui.surfaces` (≥1 surface) | ≥ Level 2 |
| Has `actions` with `ui` metadata | ≥ Level 3 |
| Has `provider` or `sandbox` | ≥ Level 4 |

Missing `ui.surfaces` keeps a module at Level 1 even if it has a description. This is intentional — a module that provides no declared interface is functionally loadable but not truly usable.

---

## Module types

Standard types (known to Morphius):

| Type | Description |
|---|---|
| `frontend` | UI surface, runs in browser |
| `backend` | Actions/API with backend server |
| `fullstack` | UI surface + backend actions |
| `workflow` | Orchestrates other modules |
| `provider` | Fills a system role |

**Unknown types are allowed.** They display as "experimental" in Morphius but load normally if minimum fields are present.

---

## What triggers an error (cannot load)

- Missing any of: `id`, `name`, `version`, `type`, `entry`
- Invalid JSON in `manifest.json`
- Entry file not found (during folder validation)
- Obvious plaintext secret detected in manifest or source files

**Everything else** produces a warning or recommendation, never an error.

---

## What triggers a warning (can load, limited)

- `fullstack` type without `backendEntry`
- Unknown module type
- Unknown surface purpose
- Destructive action without `ui.confirmMessage`
- Design system violations (forbidden colors, font size < 11px)
- Suspicious pattern in source files

---

## What triggers a recommendation (improve quality)

- No `description`
- No `ui.surfaces` declared
- No `ui.primarySurface` set
- No `window` config
- Actions without `ui` metadata
- No `workflowCompatible` declaration
- No `provider` on an otherwise advanced module
- No diagnostics/logs surface on a Level 4 candidate
