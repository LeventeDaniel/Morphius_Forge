// DEMO MODULE — Demo LLM Connector
// Shows how an LLM connector module declares its connector requirements.
// All LLM calls are MOCK — no real API keys or endpoints here.
//
// In a real deployment, Morphius Connect injects:
//   context.connectors.reasoning_api.baseUrl  →  e.g. "https://api.openai.com/v1"
//   context.secrets.LLM_API_KEY              →  real key from Morphius Connect vault

export interface GenerateInput {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface GenerateOutput {
  text: string;
  model: string;
  tokensUsed: number;
  mock: boolean;
}

export const actions = {
  async generate(input: GenerateInput): Promise<GenerateOutput> {
    // MOCK implementation — replace with real connector call at runtime
    // Real pattern (pseudocode):
    //
    //   const baseUrl = context.connectors.reasoning_api.baseUrl;
    //   const apiKey = context.secrets.LLM_API_KEY;
    //   const response = await fetch(`${baseUrl}/chat/completions`, {
    //     method: "POST",
    //     headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    //     body: JSON.stringify({ model: "gpt-4o", messages: [...], max_tokens: input.maxTokens }),
    //   });
    //   const data = await response.json();
    //   return { text: data.choices[0].message.content, ... };

    return {
      text: `[MOCK RESPONSE] You asked: "${input.prompt.substring(0, 60)}${input.prompt.length > 60 ? "..." : ""}"`,
      model: "MOCK_MODEL",
      tokensUsed: Math.floor(input.prompt.length / 4) + 50,
      mock: true,
    };
  },

  async streamGenerate(input: GenerateInput): Promise<GenerateOutput> {
    // In real usage this would stream tokens — returning whole response here for simplicity
    return actions.generate(input);
  },
};
