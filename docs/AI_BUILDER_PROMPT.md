# AI Builder Prompt

Use this prompt when asking Claude Code, Codex, Cursor, or any other AI coding tool to build a Morphius-compatible module.

---

## Copy-paste prompt for AI tools

```
You are building a Morphius-compatible module.

Morphius is a blank-canvas webtop host. Modules are independent packages
that plug into Morphius via a manifest.json file. Morphius discovers modules
by scanning a folder path and reading their manifests — it never imports or
executes module code automatically.

RULES:

1. Minimum manifest (required):
   {
     "id": "my-module",       // kebab-case, unique
     "name": "My Module",     // human-readable
     "version": "1.0.0",      // semver
     "type": "frontend",      // frontend | backend | fullstack | workflow | provider | any string
     "entry": "./src/module.tsx"
   }
   This is a valid Level 1 (loadable) module. Everything else is optional.

2. Add optional fields to reach higher compatibility levels:
   - Level 2 (usable): add description, permissions, window config
   - Level 3 (integrated): add actions, connectors, workflowCompatible
   - Level 4 (advanced): add provider metadata, sandbox hints

3. Do NOT store secrets in the manifest or any source file.
   Use secretRefs (names only) for anything that needs a private value:
   "secretRefs": [{ "name": "MY_API_KEY", "description": "..." }]
   The actual value lives in Morphius Connect (a separate private config).

4. Do NOT modify Morphius core (the webtop host).
   Keep the module completely isolated in its own folder.

5. Use Connect references for private endpoints:
   "connectors": [{ "name": "my-api", "description": "..." }]
   The module requests the connection by name — it never receives the key.

6. Include a safe mock mode when possible:
   - Add "mockMode": true to the manifest
   - When mock mode is active, return realistic fake data without real API calls

7. Do NOT install Morphius as a dependency in your module.
   Modules are standalone — they have no dependency on Morphius core.

8. Module types:
   - frontend: React/UI component, runs in browser
   - backend: Node.js actions/API, runs on server
   - fullstack: both entry + backendEntry
   - workflow: orchestrates other modules, JSON-driven
   - provider: fills a system role (approval, audit, auth, etc.)
   - any other string: valid, displays as "experimental"

9. After building:
   - Run: morphius-forge validate .
   - Fix all errors (they block loading)
   - Address warnings second
   - Apply recommendations to reach a higher level
   - Errors must be zero before the module is loadable

10. Morphius visual design (if building UI):
    - Dark background (#0a0a0a or #111)
    - Monospace font for labels and metadata
    - Minimal borders (#2a2a2a)
    - Accent colors: green (#4ade80), blue (#60a5fa), yellow (#facc15)
    - All caps labels with letter-spacing
    - No drop shadows, no gradients, no rounded corners

Build the module in its own isolated folder. Do not touch any other repo.
```

---

## Tips for specific module types

### Frontend module
- React component as default export
- Can use any UI library
- Receives no Morphius-specific props — it just renders in a window
- Can call backend APIs via fetch (declare them in `connectors`)

### Backend module
- Node.js module with exported action handlers
- `backendEntry` must be declared in the manifest
- Actions are invoked by Morphius's execution layer (if configured)
- Return structured JSON

### Workflow module
- Describes a multi-step flow in JSON
- `workflowCompatible: true` makes it usable in workflow windows
- Can reference other modules by their IDs in the workflow config

### Provider module
- Any module with a `provider` field in the manifest
- Provider metadata is informational — add your logic in the entry file
- Use the `templates/provider-module/` template as a starting point
- Unknown provider kinds are fine — they display as experimental

---

## What Forge validator checks

| Check | Result |
|---|---|
| Missing id/name/version/type/entry | ERROR — cannot load |
| Invalid JSON | ERROR — cannot load |
| Plaintext secret detected | ERROR — cannot load |
| Unknown type string | WARNING — loads as experimental |
| Missing description | RECOMMENDATION |
| Missing actions | RECOMMENDATION |
| Missing README.md | RECOMMENDATION |
| Unknown provider kind | WARNING |

Run `morphius-forge validate .` after every change. Fix errors first, then warnings, then recommendations.
