// {{MODULE_TITLE}} — Morphius Backend Module — Actions
// This file declares the actions this module exposes to Morphius.
// No secrets here. Credentials come from Morphius Connect at runtime.

// Input/output types for your actions
export interface ExampleInput {
  text: string;
}

export interface ExampleOutput {
  result: string;
  processedAt: string;
}

// Action registry — export all action handlers here
export const actions = {
  /**
   * exampleAction — replace with your real logic.
   * Connector values (API keys, URLs) will be injected at runtime by Morphius Connect.
   */
  async exampleAction(input: ExampleInput): Promise<ExampleOutput> {
    // TODO: implement real logic here
    // Access connectors via the runtime context, never hardcode credentials
    return {
      result: `[MOCK] Processed: ${input.text}`,
      processedAt: new Date().toISOString(),
    };
  },
};
