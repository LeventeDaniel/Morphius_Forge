import { validateModuleFolder } from "@morphius-forge/validator";

const LEVEL_LABEL: Record<string, string> = {
  loadable:   "LEVEL 1 — LOADABLE",
  usable:     "LEVEL 2 — USABLE",
  actionable: "LEVEL 3 — ACTIONABLE",
  advanced:   "LEVEL 4 — ADVANCED",
};

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
  const levelLabel = LEVEL_LABEL[result.compatibilityLevel] ?? result.compatibilityLevel.toUpperCase();

  console.log("");
  console.log(`  ┌─ ${m.name}`);
  console.log(`  │  id:           ${m.id}`);
  console.log(`  │  version:      ${m.version}`);
  console.log(`  │  type:         ${m.type}`);
  console.log(`  │  description:  ${m.description ?? "(none)"}`);
  if (m.author) console.log(`  │  author:       ${m.author}`);
  console.log(`  │  license:      ${m.license}`);
  if (m.morphiusVersion) console.log(`  │  morphius:     ${m.morphiusVersion}+`);
  if (m.tags.length > 0) console.log(`  │  tags:         ${m.tags.join(", ")}`);
  console.log(`  │`);
  console.log(`  │  entry:        ${m.entry}`);
  if (m.backendEntry) console.log(`  │  backendEntry: ${m.backendEntry}`);

  // ── UI surfaces ──────────────────────────────────────────────────────────────
  if (m.ui && m.ui.surfaces.length > 0) {
    console.log(`  │`);
    console.log(`  │  ui.surfaces:  (module owns its interface — Morphius mounts these)`);
    for (const s of m.ui.surfaces) {
      const isPrimary =
        m.ui.primarySurface === s.id || (!m.ui.primarySurface && s.id === "main");
      const primary = isPrimary ? " ★" : "";
      const kind = s.kind ? ` [${s.kind}]` : "";
      const purpose = s.purpose ? ` (${s.purpose})` : "";
      console.log(`  │    · ${s.id}${primary}${kind}${purpose}`);
      console.log(`  │        entry:  ${s.entry}`);
      if (s.defaultSize) {
        console.log(`  │        size:   ${s.defaultSize.width}×${s.defaultSize.height}`);
      }
      if (s.reflects && s.reflects.length > 0) {
        console.log(`  │        reflects: ${s.reflects.join(", ")}`);
      }
      if (s.actions && s.actions.length > 0) {
        console.log(`  │        actions: ${s.actions.join(", ")}`);
      }
    }
    if (m.ui.statusSurface) {
      console.log(`  │    status surface: ${m.ui.statusSurface}`);
    }
  } else {
    console.log(`  │`);
    console.log(`  │  ui.surfaces:  none declared`);
    console.log(`  │    → modules should own their UI — see docs/MODULE_UI_GUIDE.md`);
  }

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
    console.log(`  │  window (legacy / fallback):`);
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
      const kind = a.kind ? ` [${a.kind}]` : "";
      const desc = a.description ? `  — ${a.description}` : "";
      console.log(`  │    · ${a.id} (${a.name})${kind}${desc}`);
      if (a.ui) {
        const label = a.ui.buttonLabel ? `label: "${a.ui.buttonLabel}"` : "";
        const placement = a.ui.placement ? `placement: ${a.ui.placement}` : "";
        const uiParts = [label, placement].filter(Boolean).join(", ");
        if (uiParts) console.log(`  │        ui: ${uiParts}`);
        if (a.ui.confirmMessage) {
          console.log(`  │        confirm: "${a.ui.confirmMessage}"`);
        }
      }
      if (a.inputSchema) {
        console.log(`  │        input:  ${JSON.stringify(a.inputSchema)}`);
      }
      if (a.outputSchema) {
        console.log(`  │        output: ${JSON.stringify(a.outputSchema)}`);
      }
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

  if (m.provider) {
    console.log(`  │`);
    console.log(`  │  provider:`);
    console.log(`  │    kind:      ${m.provider.kind}`);
    if (m.provider.handles?.length) {
      console.log(`  │    handles:   ${m.provider.handles.join(", ")}`);
    }
    if (m.provider.decisions?.length) {
      console.log(`  │    decisions: ${m.provider.decisions.join(", ")}`);
    }
  }

  if (m.workflowCompatible !== undefined) {
    console.log(`  │`);
    console.log(`  │  workflowCompatible: ${m.workflowCompatible}`);
  }

  if (m.mockMode !== undefined) {
    console.log(`  │  mockMode:           ${m.mockMode}`);
  }

  if (result.warnings.length > 0) {
    console.log(`  │`);
    console.log(`  │  warnings:`);
    for (const w of result.warnings) console.log(`  │    ⚠  ${w}`);
  }

  if (result.recommendations.length > 0) {
    console.log(`  │`);
    console.log(`  │  recommendations:`);
    for (const r of result.recommendations) console.log(`  │    ·  ${r}`);
  }

  console.log(`  │`);
  console.log(`  └─ ${levelLabel}`);
  console.log("");
}
