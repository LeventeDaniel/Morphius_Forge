# Minimal Module Template

The smallest possible Morphius-compatible module.

## What this is

A Level 1 (loadable) module. Morphius can discover it and open a window for it with just these five fields.

## Manifest

```json
{
  "id": "my-module",
  "name": "My Module",
  "version": "1.0.0",
  "type": "frontend",
  "entry": "./src/module.tsx"
}
```

## Getting started

1. Replace `my-module`, `My Module`, and the entry path with your values
2. Create your entry file at the declared path
3. Set `MORPHIUS_MODULE_PATHS` to the parent folder of this module
4. Morphius will discover it on next scan

## Going further

Add any of these to reach higher compatibility levels:

- `description` → Level 2 (usable)
- `actions` + `description` → Level 3 (integrated)
- `provider` metadata + actions → Level 4 (advanced)

Run `morphius-forge validate .` at any point to see your current level and suggestions.
