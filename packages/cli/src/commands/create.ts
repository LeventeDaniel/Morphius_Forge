import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const TEMPLATES_DIR = path.resolve(__dirname, "../../../templates");

const MODULE_TYPES = [
  "frontend-module",
  "backend-module",
  "fullstack-module",
  "workflow-module",
] as const;

type ModuleTemplate = (typeof MODULE_TYPES)[number];

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function copyDir(src: string, dest: string, replacements: Record<string, string>): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, replacements);
    } else {
      let content = fs.readFileSync(srcPath, "utf-8");
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replaceAll(placeholder, value);
      }
      fs.writeFileSync(destPath, content, "utf-8");
    }
  }
}

export async function runCreate(args: string[]): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    let moduleName = args[0];
    if (!moduleName) {
      moduleName = await ask(rl, "Module name (kebab-case, e.g. my-tool): ");
    }
    moduleName = moduleName.trim().toLowerCase();

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(moduleName)) {
      console.error(
        `\n  Error: "${moduleName}" is not valid kebab-case.\n  Use only lowercase letters, numbers, and hyphens (e.g. my-tool).\n`
      );
      process.exit(1);
    }

    console.log("\nModule type:");
    MODULE_TYPES.forEach((t, i) => console.log(`  [${i + 1}] ${t}`));
    const choice = await ask(rl, "Choose [1-4]: ");
    const idx = parseInt(choice.trim(), 10) - 1;
    if (idx < 0 || idx >= MODULE_TYPES.length) {
      console.error("\n  Error: invalid choice.\n");
      process.exit(1);
    }
    const templateName: ModuleTemplate = MODULE_TYPES[idx];

    // Project root: <cwd>/<name>/
    // Module lives in: <cwd>/<name>/module/
    const projectDir = path.resolve(process.cwd(), moduleName);
    const outputDir = path.join(projectDir, "module");

    if (fs.existsSync(projectDir)) {
      console.error(`\n  Error: directory "${projectDir}" already exists.\n`);
      process.exit(1);
    }

    const templateDir = path.join(TEMPLATES_DIR, templateName);
    if (!fs.existsSync(templateDir)) {
      console.error(`\n  Error: template not found at ${templateDir}\n`);
      process.exit(1);
    }

    const type = templateName.replace("-module", "");
    const replacements: Record<string, string> = {
      "{{MODULE_NAME}}": moduleName,
      "{{MODULE_TYPE}}": type,
      "{{MODULE_TITLE}}": moduleName
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    };

    // Copy template files into module/ subfolder
    copyDir(templateDir, outputDir, replacements);

    console.log(`\n  Created: ${moduleName}/`);
    console.log(`           ${moduleName}/module/   ← manifest.json and source files`);
    console.log(`  Template: ${templateName}`);
    console.log(`\n  Next steps:`);
    console.log(`    cd ${moduleName}/module`);
    console.log(`    # Edit manifest.json — fill in description, author, actions`);
    console.log(`    # Edit src/ files — implement your module`);
    console.log(`    morphius-forge validate .`);
    console.log(`\n  Load in Morphius:`);
    console.log(`    Press / → load module → enter path to ${moduleName}/ or ${moduleName}/module/`);
    console.log(``);
  } finally {
    rl.close();
  }
}
