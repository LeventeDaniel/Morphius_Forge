# {{MODULE_TITLE}}

> A Morphius workflow module — composes multiple modules into a pipeline.

## Structure

- `workflow.json` — workflow definition with steps, inputs, outputs
- `manifest.json` — module manifest

## Editing the workflow

1. Open `workflow.json`
2. Add or remove steps
3. Each step references a `module` by id and an `action`
4. Use `{{steps.<id>.output.<field>}}` to pipe outputs between steps

## Development

```bash
morphius-forge validate .
morphius-forge inspect .
```

## Security

No secrets here. Module connectors and secretRefs belong in Morphius Connect.
