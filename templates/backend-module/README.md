# {{MODULE_TITLE}}

> A Morphius backend module.

## What this module does

TODO: describe what this module does.

## Structure

- `src/actions.ts` — action handlers (the entry point)
- `src/server.ts` — HTTP server that Morphius starts at runtime

## Development

```bash
morphius-forge validate .
morphius-forge inspect .
```

## Security

No secrets in this module. Credentials belong in Morphius Connect.
Connector values (API endpoints, tokens) are injected at runtime.
