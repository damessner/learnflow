declare module '@opencode-ai/sdk' {
  export interface OpenCodeClient {
    session: {
      create: (opts: unknown) => Promise<{ data?: { id: string }; error?: unknown }>
      prompt: (
        opts: unknown,
      ) => Promise<{ data?: { info?: unknown; parts?: unknown[] }; error?: unknown }>
    }
    global: {
      health: () => Promise<{ data?: { healthy?: boolean }; error?: unknown }>
    }
  }
  export function createOpencodeClient(config?: { baseUrl?: string }): OpenCodeClient
}
