import { validateModuleFolder } from "@morphius-forge/validator";

const LEVEL_LABEL: Record<string, string> = {
  loadable:   "LEVEL 1 — LOADABLE",
  usable:     "LEVEL 2 — USABLE",
  integrated: "LEVEL 3 — INTEGRATED",
  advanced:   "LEVEL 4 — ADVANCED",
};

export function runValidate(args: string[]): void {
  const modulePath = args[0];
  if (!modulePath) {
    console.error("\n  Usage: morphius-forge validate <module-path>\n");
    process.exit(1);
  }

  console.log(`\n  Validating: ${modulePath}\n`);

  const result = validateModuleFolder(modulePath);

  // Errors (cannot load)
  if (result.errors.length > 0) {
    console.log("  ERRORS (module cannot load):");
    for (const e of result.errors) {
      console.log(`    ✗  ${e}`);
    }
    console.log("");
  }

  // Warnings (can load but limited)
  if (result.warnings.length > 0) {
    console.log("  WARNINGS (can load, may be limited):");
    for (const w of result.warnings) {
      console.log(`    ⚠  ${w}`);
    }
    console.log("");
  }

  // Recommendations (improvements)
  if (result.recommendations.length > 0) {
    console.log("  RECOMMENDATIONS (improves compatibility):");
    for (const r of result.recommendations) {
      console.log(`    ·  ${r}`);
    }
    console.log("");
  }

  if (result.errors.length > 0) {
    console.log(`  FAILED — ${result.errors.length} error(s). Fix errors first.\n`);
    process.exit(1);
  }

  if (result.manifest) {
    const m = result.manifest;
    const levelLabel = LEVEL_LABEL[result.compatibilityLevel] ?? result.compatibilityLevel.toUpperCase();
    console.log(`  ✓ ${m.name} v${m.version} [${m.type}]`);
    console.log(`    id:               ${m.id}`);
    console.log(`    entry:            ${m.entry}`);
    if (m.backendEntry) console.log(`    backendEntry:     ${m.backendEntry}`);
    console.log(`    permissions:      ${m.permissions.length > 0 ? m.permissions.join(", ") : "none"}`);
    console.log(`    connectors:       ${m.connectors.length > 0 ? m.connectors.map((c) => c.name).join(", ") : "none"}`);
    console.log(`    secretRefs:       ${m.secretRefs.length > 0 ? m.secretRefs.map((s) => s.name).join(", ") : "none"}`);
    console.log(`    actions:          ${m.actions.length > 0 ? m.actions.map((a) => a.id).join(", ") : "none"}`);
    if (m.provider) {
      console.log(`    provider.kind:    ${m.provider.kind}`);
    }
    if (m.workflowCompatible !== undefined) {
      console.log(`    workflowCompat:   ${m.workflowCompatible}`);
    }
    console.log(`\n  COMPATIBILITY:  ${levelLabel}`);
    if (result.warnings.length === 0 && result.recommendations.length === 0) {
      console.log(`  PASSED — no warnings, no recommendations.\n`);
    } else {
      console.log(`  PASSED — ${result.warnings.length} warning(s), ${result.recommendations.length} recommendation(s).\n`);
    }
  }
}
