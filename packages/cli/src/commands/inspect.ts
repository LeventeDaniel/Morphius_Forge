import { validateModuleFolder } from "@morphius-forge/validator";

export function runInspect(args: string[]): void {
  const modulePath = args[0];
  if (!modulePath) {
    console.error("\n  Usage: morphius-forge inspect <module-path>\n");
    process.exit(1);
  }

  const result = validateModuleFolder(modulePath);

  if (!result.manifest) {
    console.error(`\n  Cannot inspect — module has validation errors:\n`);
    for (const e of result.errors) {
      console.error(`    ✗  ${e}`);
    }
    console.error("");
    process.exit(1);
  }

  const m = result.manifest;

  console.log("");
  console.log(`  ┌─ ${m.name}`);
  console.log(`  │  id:           ${m.id}`);
  console.log(`  │  version:      ${m.version}`);
  console.log(`  │  type:         ${m.type}`);
  console.log(`  │  description:  ${m.description}`);
  if (m.author) console.log(`  │  author:       ${m.author}`);
  console.log(`  │  license:      ${m.license}`);
  if (m.morphiusVersion) console.log(`  │  morphius:     ${m.morphiusVersion}+`);
  if (m.tags.length > 0) console.log(`  │  tags:         ${m.tags.join(", ")}`);
  console.log(`  │`);
  console.log(`  │  entry:        ${m.entry}`);
  if (m.backendEntry) console.log(`  │  backendEntry: ${m.backendEntry}`);

  if (m.permissions.length > 0) {
    console.log(`  │`);
    console.log(`  │  permissions:`);
    for (const p of m.permissions) console.log(`  │    · ${p}`);
  }

  if (m.connectors.length > 0) {
    console.log(`  │`);
    console.log(`  │  connectors (symbolic):`);
    for (const c of m.connectors) {
      const desc = c.description ? `  — ${c.description}` : "";
      console.log(`  │    · ${c.name}${desc}`);
    }
  }

  if (m.secretRefs.length > 0) {
    console.log(`  │`);
    console.log(`  │  secretRefs (names only — real values live in Morphius Connect):`);
    for (const s of m.secretRefs) {
      const desc = s.description ? `  — ${s.description}` : "";
      console.log(`  │    · ${s.name}${desc}`);
    }
  }

  if (m.window) {
    const w = m.window;
    console.log(`  │`);
    console.log(`  │  window:`);
    if (w.defaultWidth) console.log(`  │    defaultWidth:  ${w.defaultWidth}`);
    if (w.defaultHeight) console.log(`  │    defaultHeight: ${w.defaultHeight}`);
    if (w.resizable !== undefined) console.log(`  │    resizable:     ${w.resizable}`);
    if (w.collapsible !== undefined) console.log(`  │    collapsible:   ${w.collapsible}`);
    if (w.minimizable !== undefined) console.log(`  │    minimizable:   ${w.minimizable}`);
  }

  if (m.actions.length > 0) {
    console.log(`  │`);
    console.log(`  │  actions:`);
    for (const a of m.actions) {
      const desc = a.description ? `  — ${a.description}` : "";
      console.log(`  │    · ${a.id} (${a.name})${desc}`);
      if (a.inputSchema) console.log(`  │        input:  ${a.inputSchema}`);
      if (a.outputSchema) console.log(`  │        output: ${a.outputSchema}`);
    }
  }

  if (m.eventsEmitted.length > 0) {
    console.log(`  │`);
    console.log(`  │  events emitted:`);
    for (const e of m.eventsEmitted) console.log(`  │    · ${e.name}`);
  }

  if (m.eventsListened.length > 0) {
    console.log(`  │`);
    console.log(`  │  events listened:`);
    for (const e of m.eventsListened) console.log(`  │    · ${e.name}`);
  }

  if (result.warnings.length > 0) {
    console.log(`  │`);
    console.log(`  │  warnings:`);
    for (const w of result.warnings) console.log(`  │    ⚠  ${w}`);
  }

  console.log(`  └─`);
  console.log("");
}
