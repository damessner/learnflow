import logger from '../lib/logger'
import type { OpenCodeClient } from '@opencode-ai/sdk'

let clientPromise: Promise<OpenCodeClient> | null = null

function getOpenCodeUrl(): string {
  return process.env.OPENCODE_URL || 'http://127.0.0.1:4096'
}

async function getClient(): Promise<OpenCodeClient> {
  if (clientPromise) return clientPromise

  try {
    const { createOpencodeClient } = await import('@opencode-ai/sdk')
    const c = createOpencodeClient({
      baseUrl: getOpenCodeUrl(),
    })
    logger.info({ url: getOpenCodeUrl() }, 'OpenCode client initialized')
    clientPromise = Promise.resolve(c)
    return c as OpenCodeClient
  } catch (err) {
    logger.error({ err }, 'Failed to initialize OpenCode client')
    clientPromise = null
    throw err
  }
}

export async function createSession(title?: string): Promise<string> {
  const c = await getClient()
  const result = await c.session.create({
    body: { title: title || 'LearnFlow AI Session' },
  })
  if (result.error) throw new Error(`OpenCode session create failed: ${JSON.stringify(result.error)}`)
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
  const c = await getClient()
  const result = await c.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: 'text', text: prompt }],
      ...(options?.system ? { system: options.system } : {}),
      ...(options?.model ? { model: options.model } : {}),
    },
  })
  if (result.error) throw new Error(`OpenCode prompt failed: ${JSON.stringify(result.error)}`)

  const data = result.data!
  const parts = (data.parts || []) as Array<Record<string, unknown>>
  const textParts = parts.filter((p) => p.type === 'text')
  return textParts.map((p) => (p.text as string) || '').join('')
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
  const c = await getClient()
  const result = await c.session.prompt({
    path: { id: sessionId },
    body: {
      parts: [{ type: 'text', text: prompt }],
      format: { type: 'json_schema', schema },
      ...(options?.system ? { system: options.system } : {}),
      ...(options?.model ? { model: options.model } : {}),
    },
  })
  if (result.error) throw new Error(`OpenCode structured prompt failed: ${JSON.stringify(result.error)}`)

  const data = result.data!
  const info = data.info as Record<string, unknown> | undefined
  if (info?.structured_output) return info.structured_output

  const parts = (data.parts || []) as Array<Record<string, unknown>>
  const textParts = parts.filter((p) => p.type === 'text')
  const text = textParts.map((p) => (p.text as string) || '').join('')
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
    const c = await getClient()
    const result = await c.global.health()
    return !result.error && !!result.data?.healthy
  } catch {
    return false
  }
}
