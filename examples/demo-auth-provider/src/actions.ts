// DEMO MODULE — Demo Auth Provider
// This is a MOCK implementation showing how an auth provider module would be structured.
// It uses NO real credentials. Connector values (client ID, secret, provider URL)
// would be injected at runtime by Morphius Connect in a real deployment.

export interface StartAuthInput {
  provider: string;
  redirectUri: string;
}

export interface StartAuthOutput {
  authUrl: string;
  state: string;
}

export interface ExchangeCodeInput {
  code: string;
  state: string;
}

export interface ExchangeCodeOutput {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

// In a real module, these would come from Morphius Connect at runtime:
// const clientId = context.secrets.OAUTH_CLIENT_ID;
// const clientSecret = context.secrets.OAUTH_CLIENT_SECRET;
// const providerUrl = context.connectors.oauth_provider.baseUrl;

export const actions = {
  async startAuthFlow(input: StartAuthInput): Promise<StartAuthOutput> {
    const state = Math.random().toString(36).substring(2, 15);
    // MOCK: real implementation would build the URL using injected connector values
    return {
      authUrl: `https://MOCK_PROVIDER/oauth/authorize?client_id=INJECTED_AT_RUNTIME&redirect_uri=${encodeURIComponent(input.redirectUri)}&state=${state}&provider=${input.provider}`,
      state,
    };
  },

  async exchangeCode(_input: ExchangeCodeInput): Promise<ExchangeCodeOutput> {
    // MOCK: real implementation would POST to the provider using injected credentials
    return {
      accessToken: "MOCK_ACCESS_TOKEN_NOT_REAL",
      expiresIn: 3600,
      tokenType: "Bearer",
    };
  },
};
