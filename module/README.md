# Forge Status Module

A plug-and-play Morphius module that shows live Forge scan results in a floating window.

## What it shows

- Configured module paths and scan counts
- Per-module: name, version, valid/invalid, errors, warnings
- Last scan timestamp
- Reload button
- Error message if the Forge server is not running

## How to use

**Step 1 — Start the Forge server:**
```bash
cd Morphius_Forge
npx morphius-forge serve
```
This starts a lightweight HTTP server on port 7901. Module paths are read from `forge.config.json` in the current directory.

**Step 2 — Load the module in Morphius:**
1. Open Morphius
2. Press `/` → `load module`
3. Enter the path to this folder (e.g. `C:\path\to\Morphius_Forge\module`)

The Forge Status window appears and connects to `http://localhost:7901`.

## Setting module paths

Either edit `forge.config.json` in the Morphius_Forge directory:
```json
{
  "modulePaths": ["C:/path/to/my/modules"]
}
```

Or send a POST request:
```bash
curl -X POST http://localhost:7901/paths \
  -H "Content-Type: application/json" \
  -d '{"paths": ["C:/path/to/my/modules"]}'
```

Then click `▶ RELOAD` in the module window.

## Architecture

- **Forge server** (`morphius-forge serve`) runs on port 7901 — fully standalone
- **This module** connects to `http://localhost:7901/status` and `/reload`
- **Morphius** has no knowledge of Forge — it loads this module like any other
- No secrets, no credentials, no file copying

## Custom port

```bash
npx morphius-forge serve --port=7902
```

To connect the module to a different port, set `window.__FORGE_API__` before loading — or edit `module/src/module.tsx` and rebuild.
