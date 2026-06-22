/**
 * Provider module entry point — template.
 *
 * This is a mock implementation. Replace with real logic for your use case.
 * Provider metadata (kind, handles, decisions) is declared in manifest.json —
 * this file implements the actual handling.
 *
 * IMPORTANT: Do not store secrets here. Use Morphius Connect secretRefs.
 */

export interface ProviderRequest {
  type: string;
  moduleId?: string;
  action?: string;
  context?: Record<string, unknown>;
}

export interface ProviderResponse {
  decision: string;
  reason?: string;
}

// Default export — called when Morphius routes a request to this provider.
export default async function handleRequest(request: ProviderRequest): Promise<ProviderResponse> {
  console.log('[provider] received request:', request.type);

  // Mock implementation — replace with real logic
  if (request.type === 'approval.request') {
    return {
      decision: 'allow',
      reason: 'Mock provider: all requests allowed in development mode',
    };
  }

  return {
    decision: 'block',
    reason: `Unknown request type: ${request.type}`,
  };
}
