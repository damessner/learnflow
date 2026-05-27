import logger from '../lib/logger'
import type { OpenCodeClient } from '@opencode-ai/sdk'
import { getKnex } from '../db/knex'

let clientPromise: Promise<OpenCodeClient> | null = null
let cachedDbSettings: Record<string, string> | null = null

async function getDbSettings(): Promise<Record<string, string>> {
  if (cachedDbSettings) return cachedDbSettings
  try {
    const knex = getKnex()
    const rows = await knex('settings').select('key', 'value')
    cachedDbSettings = {}
    for (const r of rows) cachedDbSettings[r.key] = r.value
    // Refresh cache every 60 seconds
    setTimeout(() => { cachedDbSettings = null }, 60000)
    return cachedDbSettings
  } catch {
    return {}
  }
}

async function getSetting(key: string, envKey: string, defaultValue: string): Promise<string> {
  const db = await getDbSettings()
  return db[key] || process.env[envKey] || defaultValue
}

export async function getOpenCodeUrlFromSettings(): Promise<string> {
  return getSetting('opencode_url', 'OPENCODE_URL', 'http://127.0.0.1:4096')
}

export async function getOpenCodeProvider(): Promise<string | undefined> {
  const db = await getDbSettings()
  return db['opencode_provider'] || process.env.OPENCODE_PROVIDER || undefined
}

export async function getOpenCodeModel(): Promise<string | undefined> {
  const db = await getDbSettings()
  return db['opencode_model'] || process.env.OPENCODE_MODEL || undefined
}

async function getClient(): Promise<OpenCodeClient> {
  if (clientPromise) return clientPromise

  try {
    const url = await getOpenCodeUrlFromSettings()
    const { createOpencodeClient } = await import('@opencode-ai/sdk')
    const c = createOpencodeClient({
      baseUrl: url,
    })
    logger.info({ url }, 'OpenCode client initialized')
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

export async function getModelConfig(): Promise<{ providerID: string; modelID: string } | undefined> {
  const provider = await getOpenCodeProvider()
  const model = await getOpenCodeModel()
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
