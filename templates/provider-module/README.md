# Provider Module Template

A template for Morphius modules that fill a system role using the `provider` metadata field.

## What is a provider module?

A provider module is any module that declares a `provider` field in its manifest, indicating it can fulfill a system-level role such as approval, audit, execution, or connection management.

**Important:** Provider metadata is informational. Morphius displays it but does not automatically enforce any policy or trigger execution. Your provider logic is implemented in your module's entry file, just like any other module.

## Minimum manifest

```json
{
  "id": "my-provider",
  "name": "My Provider",
  "version": "1.0.0",
  "type": "provider",
  "entry": "./src/provider.ts"
}
```

This is a valid Level 1 (loadable) module. Morphius can open it in a window immediately.

## Adding provider metadata

```json
{
  "provider": {
    "kind": "approval",
    "handles": ["approval.request"],
    "decisions": ["allow", "block", "needs_changes"]
  }
}
```

This reaches Level 4 (advanced) compatibility when combined with actions.

## Recognized provider kinds

- `permission` — responds to permission checks
- `approval` — handles approval requests
- `sandbox` — controls execution isolation
- `audit` — records events
- `policy` — enforces usage policies
- `auth` — handles authentication
- `execution` — runs module actions on behalf of Morphius
- `connection` — manages connections (see Morphius Connect)
- `generic` — general-purpose provider

Unknown kinds are accepted — they display as "experimental" in Morphius.

## Getting started

1. Update `manifest.json` with your provider kind and handled requests
2. Implement your logic in `src/provider.ts`
3. Run `morphius-forge validate .` to check compatibility
4. Load the module into Morphius using `MORPHIUS_MODULE_PATHS`
