import * as process from 'process'

const ZEN_API_URL = 'https://opencode.ai/zen/v1/chat/completions'
const DEFAULT_FETCH_TIMEOUT_MS = 60_000

export interface AIProvider {
  name: string
  displayName: string
  model: string
  isAvailable(): Promise<boolean>
  generate(prompt: string, system?: string, extraBody?: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }>
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Gemini Provider ────────────────────────────────────────────────────

class GeminiProvider implements AIProvider {
  name = 'gemini'
  displayName = 'Google Gemini 2.0 Flash'
  model = 'gemini-2.0-flash'

  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY
  }

  async isAvailable(): Promise<boolean> {
    return !!this.getApiKey()
  }

  async generate(prompt: string, system?: string, extraBody?: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    const key = this.getApiKey()
    if (!key) return { ok: false, error: 'Gemini API key not configured' }

    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: system ? `${system}\n\n${prompt}` : prompt }] }],
            generationConfig: { responseMimeType: 'application/json', ...extraBody },
          }),
        },
      )
      const data = await response.json()
      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        const parsed = JSON.parse(text)
        return { ok: true, data: parsed }
      }
      return { ok: false, error: `Gemini API error (${response.status}): ${data.error?.message || 'unknown error'}` }
    } catch (err: any) {
      return { ok: false, error: `Gemini fetch failed: ${err.message || err}` }
    }
  }
}

// ─── OpenCode Zen Provider ──────────────────────────────────────────────

class ZenProvider implements AIProvider {
  name = 'zen'
  displayName = 'OpenCode Zen (DeepSeek V4 Flash)'
  model = 'deepseek-v4-flash-free'

  private getApiKey(): string | undefined {
    return process.env.OPENCODE_ZEN_API_KEY
  }

  private getModel(): string {
    return process.env.OPENCODE_ZEN_MODEL || 'deepseek-v4-flash-free'
  }

  async isAvailable(): Promise<boolean> {
    return !!this.getApiKey()
  }

  async generate(prompt: string, system?: string, extraBody?: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    const key = this.getApiKey()
    if (!key) return { ok: false, error: 'OpenCode Zen API key not configured' }

    const messages: { role: string; content: string }[] = []
    if (system) messages.push({ role: 'system', content: system })
    messages.push({ role: 'user', content: prompt })

    try {
      const response = await fetchWithTimeout(
        ZEN_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: this.getModel(),
            messages,
            stream: false,
            ...extraBody,
          }),
        },
      )
      const data = await response.json()
      if (response.ok) {
        const text = data.choices?.[0]?.message?.content || '{}'
        const parsed = JSON.parse(text)
        return { ok: true, data: parsed }
      }
      return { ok: false, error: `OpenCode Zen API error (${response.status}): ${data.error?.message || 'unknown error'}` }
    } catch (err: any) {
      return { ok: false, error: `OpenCode Zen fetch failed: ${err.message || err}` }
    }
  }
}

// ─── Ollama Provider ────────────────────────────────────────────────────

class OllamaProvider implements AIProvider {
  name = 'ollama'
  displayName = 'Ollama (Local)'
  model = 'llama3'

  getBaseUrl(): string {
    return process.env.OLLAMA_URL || ''
  }

  getModelName(): string {
    return process.env.OLLAMA_MODEL || 'llama3'
  }

  async isAvailable(): Promise<boolean> {
    if (!process.env.OLLAMA_URL) return false
    try {
      const res = await fetchWithTimeout(`${process.env.OLLAMA_URL}/api/tags`, {}, 5_000)
      return res.ok
    } catch {
      return false
    }
  }

  async generate(prompt: string, system?: string, _extraBody?: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }> {
    if (!process.env.OLLAMA_URL) return { ok: false, error: 'Ollama URL not configured' }

    try {
      const response = await fetchWithTimeout(
        `${process.env.OLLAMA_URL}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.getModelName(),
            prompt: system ? `${system}\n\n${prompt}` : prompt,
            stream: false,
            format: 'json',
          }),
        },
      )
      const data = await response.json()
      if (response.ok) {
        const parsed = JSON.parse(data.response || '{}')
        return { ok: true, data: parsed }
      }
      return { ok: false, error: `Ollama error (${response.status}): ${data.error || 'unknown error'}` }
    } catch (err: any) {
      return { ok: false, error: `Ollama fetch failed: ${err.message || err}` }
    }
  }
}

// ─── Provider Service ───────────────────────────────────────────────────

export class ProviderService {
  private providers: AIProvider[] = []

  constructor() {
    this.register(new GeminiProvider())
    this.register(new ZenProvider())
    this.register(new OllamaProvider())
  }

  register(provider: AIProvider): void {
    this.providers.push(provider)
  }

  /** Returns all registered providers with their availability status */
  async getAvailableProviders(): Promise<Array<AIProvider & { available: boolean }>> {
    const results: Array<AIProvider & { available: boolean }> = []
    for (const p of this.providers) {
      try {
        const available = await p.isAvailable()
        results.push({ ...p, available })
      } catch {
        results.push({ ...p, available: false })
      }
    }
    return results
  }

  /** Get a specific provider by name */
  getProvider(name: string): AIProvider | undefined {
    return this.providers.find(p => p.name === name)
  }

  /**
   * Generate with automatic fallback.
   * Tries `preferredProvider` first. If it fails, tries remaining providers
   * in registration order. Passes options like response_format.
   */
  async generateWithFallback(
    prompt: string,
    preferredProvider?: string,
    options?: { system?: string; extraBody?: Record<string, unknown>; onFallback?: (from: string, to: string, error: string) => void },
  ): Promise<{ success: boolean; data?: unknown; error?: string; providerUsed?: string; attempts: Array<{ provider: string; error?: string }> }> {
    const attempts: Array<{ provider: string; error?: string }> = []
    const tried = new Set<string>()

    // Determine provider order: preferred first, then the rest in registration order
    const order: AIProvider[] = []

    if (preferredProvider) {
      const pref = this.getProvider(preferredProvider)
      if (pref) order.push(pref)
    }

    for (const p of this.providers) {
      if (p.name !== preferredProvider) order.push(p)
    }

    for (const provider of order) {
      if (tried.has(provider.name)) continue
      tried.add(provider.name)

      const available = await provider.isAvailable()
      if (!available) {
        attempts.push({ provider: provider.name, error: 'not available (check API key/config)' })
        continue
      }

      const result = await provider.generate(prompt, options?.system, options?.extraBody)
      if (result.ok) {
        return {
          success: true,
          data: result.data,
          providerUsed: provider.name,
          attempts,
        }
      }

      attempts.push({ provider: provider.name, error: result.error })
      if (options?.onFallback && tried.size < order.length) {
        const nextProvider = order.find(p => !tried.has(p.name))
        if (nextProvider) {
          options.onFallback(provider.name, nextProvider.name, result.error || 'unknown error')
        }
      }
    }

    return {
      success: false,
      error: `All AI providers failed. Attempts: ${attempts.map(a => `${a.provider} (${a.error})`).join('; ')}`,
      attempts,
    }
  }
}

// Singleton
let instance: ProviderService | null = null
export function getProviderService(): ProviderService {
  if (!instance) instance = new ProviderService()
  return instance
}
