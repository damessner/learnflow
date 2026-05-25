import logger from '../lib/logger'

let clientPromise: Promise<unknown> | null = null

function getOpenCodeUrl(): string {
  return process.env.OPENCODE_URL || 'http://127.0.0.1:4096'
}

async function getClient() {
  if (!clientPromise) {
    const sdk = require('@opencode-ai/sdk')
    const c = sdk.createOpencodeClient({
      baseUrl: getOpenCodeUrl(),
    })
    logger.info({ url: getOpenCodeUrl() }, 'OpenCode client initialized')
    clientPromise = Promise.resolve(c)
  }
  return clientPromise
}

type OpenCodeClient = {
  session: {
    create: (opts: unknown) => Promise<{ data?: { id: string }; error?: unknown }>
    prompt: (opts: unknown) => Promise<{ data?: { info?: unknown; parts?: unknown[] }; error?: unknown }>
  }
  global: {
    health: () => Promise<{ data?: { healthy?: boolean }; error?: unknown }>
  }
}

export async function createSession(title?: string): Promise<string> {
  const c = (await getClient()) as OpenCodeClient
  const result = await c.session.create({
    body: { title: title || 'LearnFlow AI Session' },
  })
  if (result.error) throw new Error(`Failed to create session: ${JSON.stringify(result.error)}`)
  return result.data!.id
}

export async function sendPrompt(
  sessionId: string,
  prompt: string,
  options?: {
    system?: string
    model?: { providerID: string; modelID: string }
  },
): Promise<string> {
  const c = (await getClient()) as OpenCodeClient
  const result = await c.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: 'text', text: prompt }],
      ...(options?.system ? { system: options.system } : {}),
      ...(options?.model ? { model: options.model } : {}),
    },
  })
  if (result.error) throw new Error(`Prompt failed: ${JSON.stringify(result.error)}`)

  const data = result.data!
  const parts = (data.parts || []) as Array<Record<string, unknown>>
  const textParts = parts.filter((p) => p.type === 'text')
  return textParts
    .map((p) => (p.text as string) || '')
    .join('')
}

export async function sendPromptStructured(
  sessionId: string,
  prompt: string,
  schema: Record<string, unknown>,
  options?: {
    system?: string
    model?: { providerID: string; modelID: string }
  },
): Promise<unknown> {
  const c = (await getClient()) as OpenCodeClient
  const result = await c.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: 'text', text: prompt }],
      format: {
        type: 'json_schema',
        schema,
      },
      ...(options?.system ? { system: options.system } : {}),
      ...(options?.model ? { model: options.model } : {}),
    },
  })
  if (result.error) throw new Error(`Structured prompt failed: ${JSON.stringify(result.error)}`)

  const data = result.data!
  const info = data.info as Record<string, unknown> | undefined
  if (info?.structured_output) return info.structured_output

  const parts = (data.parts || []) as Array<Record<string, unknown>>
  const textParts = parts.filter((p) => p.type === 'text')
  const text = textParts
    .map((p) => (p.text as string) || '')
    .join('')
  return JSON.parse(text)
}

export function getModelConfig(): { providerID: string; modelID: string } | undefined {
  const provider = process.env.OPENCODE_PROVIDER
  const model = process.env.OPENCODE_MODEL
  if (provider && model) return { providerID: provider, modelID: model }
  return undefined
}

export async function isOpenCodeAvailable(): Promise<boolean> {
  try {
    const c = (await getClient()) as OpenCodeClient
    const result = await c.global.health()
    return !result.error && !!result.data?.healthy
  } catch {
    return false
  }
}
