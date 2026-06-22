# {{MODULE_TITLE}}

> A Morphius frontend module.

## What this module does

TODO: describe what this module does.

## Development

```bash
# Validate the module
morphius-forge validate .

# Inspect the manifest
morphius-forge inspect .
```

## Manifest

See `manifest.json`. Key fields to fill in:
- `description` — one sentence about what this module does
- `author` — your name or org
- `permissions` — add only what you need (see module-types for the full list)
- `actions` — declare any actions this module exposes
- `connectors` — list symbolic connector names (e.g. `local_llm`, not a URL)
- `secretRefs` — list required secret names (e.g. `OPENAI_API_KEY`, not the value)

## Security

This module contains **no secrets**. All credentials belong in Morphius Connect.
See `docs/SECURITY_RULES.md` in Morphius Forge for the full policy.

## Design

Follow the Morphius visual language: black/white/dark grey, monospace type, minimal borders.
See `docs/DESIGN_GUIDE.md` in Morphius Forge for details.
