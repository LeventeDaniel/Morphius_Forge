# Provider Hints

A **provider module** is any Morphius module that declares a `provider` field in its manifest, indicating it can fill a system-level role.

Provider metadata is **informational only**. Morphius displays it but does not automatically enforce policies, trigger execution, or give special permissions based on provider declarations. Your provider logic lives in your module's entry file like any other module.

---

## Provider metadata shape

```json
{
  "provider": {
    "kind": "approval",
    "handles": ["approval.request"],
    "decisions": ["allow", "block", "needs_changes"]
  }
}
```

### Fields

| Field | Required | Description |
|---|---|---|
| `kind` | Yes | The role this module fills (see below) |
| `handles` | Recommended | Request types this provider handles |
| `decisions` | Recommended | Possible decision values this provider can return |

Extra fields in `provider` are allowed — Morphius passes them through unchanged.

---

## Recognized provider kinds

These kinds are known to Morphius and display with standard labels:

| Kind | Intended role |
|---|---|
| `permission` | Responds to permission checks |
| `approval` | Handles approval requests before actions run |
| `sandbox` | Controls execution isolation |
| `audit` | Records events and decisions |
| `policy` | Enforces usage policies |
| `auth` | Handles authentication |
| `execution` | Runs module actions on behalf of Morphius |
| `connection` | Manages connections (see Morphius Connect) |
| `generic` | General-purpose / custom role |

**Unknown kinds are allowed.** They display as "experimental" in Morphius with a warning, but the module still loads.

---

## What Morphius does with provider metadata

1. Displays the provider kind and handles in the module window
2. Shows it in the Providers window (`show providers` in command launcher)
3. Notes if the kind is unknown/experimental
4. **Does not** automatically route requests to this module
5. **Does not** enforce decisions automatically
6. **Does not** grant extra permissions

The execution layer (how requests actually get routed to providers) is not built into Morphius core. It is designed to be added as a future optional module or deployment configuration.

---

## Example: minimal provider (Level 1)

```json
{
  "id": "my-approver",
  "name": "My Approver",
  "version": "1.0.0",
  "type": "provider",
  "entry": "./src/provider.ts"
}
```

This loads in Morphius immediately.

## Example: full provider (Level 4)

```json
{
  "id": "my-approver",
  "name": "My Approver",
  "version": "1.0.0",
  "type": "provider",
  "entry": "./src/provider.ts",
  "description": "Approves or blocks module actions based on policy.",
  "provider": {
    "kind": "approval",
    "handles": ["approval.request"],
    "decisions": ["allow", "block", "needs_changes"]
  },
  "actions": [
    { "id": "handleRequest", "name": "Handle Request", "description": "Process an approval request" }
  ],
  "mockMode": true
}
```

---

## Do I need to use a provider template?

No. Provider metadata is just an optional field in your manifest. Any module can declare it. You don't need a separate repo, a separate template, or Forge's permission to build a provider module.

Use the `templates/provider-module/` template as a starting point if it helps.
