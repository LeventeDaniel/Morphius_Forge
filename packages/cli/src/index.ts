#!/usr/bin/env node
import { runCreate } from "./commands/create";
import { runValidate } from "./commands/validate";
import { runInspect } from "./commands/inspect";
import { runServe } from "./commands/serve";

const [, , command, ...args] = process.argv;

const USAGE = `
  morphius-forge — Morphius module creation kit

  Usage:
    morphius-forge create [module-name]    Create a new module from a template
    morphius-forge validate <path>         Validate a module folder
    morphius-forge inspect <path>          Print a detailed summary of a module
    morphius-forge serve [--port=7901]     Start Forge Status server for the Forge Status module

  Examples:
    morphius-forge create my-tool
    morphius-forge validate ./my-tool
    morphius-forge inspect ./examples/prompt-cleaner
    morphius-forge serve
    morphius-forge serve --port=7902
`;

switch (command) {
  case "create":
    runCreate(args).catch((e) => {
      console.error(e);
      process.exit(1);
    });
    break;
  case "validate":
    runValidate(args);
    break;
  case "inspect":
    runInspect(args);
    break;
  case "serve":
    runServe(args);
    break;
  default:
    console.log(USAGE);
    if (command && command !== "--help" && command !== "-h") {
      console.error(`  Unknown command: "${command}"\n`);
      process.exit(1);
    }
}
