# Morphius Compatibility Levels

Morphius uses **progressive compatibility**. A module does not need to be fully specified to load — it just needs the minimum required fields. Additional fields unlock higher levels with richer Morphius integration.

---

## Levels

### LEVEL 1 — Loadable

Morphius can discover the module and open a generic window.

**Required:**

| Field | Description |
|---|---|
| `id` | Unique kebab-case identifier (e.g. `my-module`) |
| `name` | Human-readable display name |
| `version` | Semver string (e.g. `1.0.0`) |
| `type` | Module type string (see below) |
| `entry` | Path to frontend entry file |

**Validator output:** PASSED with recommendations for missing optional fields.

---

### LEVEL 2 — Usable

Morphius can display useful metadata about the module.

**Adds (recommended):**

- `description` — short human-readable description
- `permissions` — declared permission requirements
- `window` — default window size and behavior
- `README.md` — human-readable documentation

---

### LEVEL 3 — Integrated

Morphius can display full module capabilities and link to workflows.

**Adds (recommended):**

- `actions` — declared module actions (id, name, description)
- `connectors` — symbolic references to Connect connections
- `secretRefs` — named references to secrets (names only, never values)
- `workflowCompatible` — whether the module participates in workflows
- `mockMode` — whether the module has a safe mock mode

---

### LEVEL 4 — Advanced

Morphius displays advanced metadata including provider roles and sandbox hints.

**Adds (recommended):**

- `provider` — provider role metadata (see [PROVIDER_HINTS.md](PROVIDER_HINTS.md))
- `sandbox` — sandbox hints
- Typed input/output schemas on actions

---

## Validation Output

The Forge validator always outputs four categories:

| Category | Meaning |
|---|---|
| `errors` | Cannot load — fix these first |
| `warnings` | Can load but may be limited |
| `recommendations` | Would improve Morphius compatibility |
| `compatibilityLevel` | Current level based on present fields |

**Only errors block loading.** Warnings and recommendations are informational.

---

## Module Types

Standard types (known to Morphius):

| Type | Description |
|---|---|
| `frontend` | UI-only, runs in browser |
| `backend` | Actions/API, little or no UI |
| `fullstack` | UI + backend actions |
| `workflow` | Orchestrates other modules |
| `provider` | Fills a system role |

**Unknown types are allowed.** They display as "experimental" in Morphius but will still load if minimum fields are present.

---

## What triggers an error (cannot load)

- Missing any of: `id`, `name`, `version`, `type`, `entry`
- Invalid JSON in `manifest.json`
- Entry file not found (during folder validation)
- Obvious plaintext secret detected in manifest

**Everything else** produces a warning or recommendation, never an error.
