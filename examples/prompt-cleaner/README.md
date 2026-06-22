# Prompt Cleaner — Example Module

> **This is an example module.** It demonstrates Morphius Forge conventions.
> Do not use in production without reviewing and adapting it.

## What it does

Cleans and compresses prompts by:
- Normalizing line endings
- Removing trailing whitespace per line
- Collapsing excess blank lines
- Removing exact duplicate consecutive lines

## Type

`frontend` — runs entirely in the browser, no backend or external APIs needed.

## Permissions

None. This module is fully self-contained.

## Validation

```bash
morphius-forge validate .
morphius-forge inspect .
```
