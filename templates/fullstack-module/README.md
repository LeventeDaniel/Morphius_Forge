# {{MODULE_TITLE}}

> A Morphius fullstack module (frontend + backend).

## Structure

- `frontend/module.tsx` — React UI (entry point)
- `frontend/styles.css` — Morphius visual language styles
- `backend/actions.ts` — Action handlers (backendEntry)

## Development

```bash
morphius-forge validate .
morphius-forge inspect .
```

## Security

No secrets here. Use `secretRefs` in manifest.json to declare required credentials by name.
Real values are injected at runtime by Morphius Connect.
