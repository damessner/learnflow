const BASE = '/api'

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function buildApiHeaders(method: string, includeJson = true): Record<string, string> {
  const headers: Record<string, string> = {}
  if (includeJson) headers['Content-Type'] = 'application/json'

  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])
  if (!safeMethods.has(method.toUpperCase())) {
    const csrf = getCsrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  return headers
}

const api = {
  async request(method: string, path: string, body: unknown = null) {
    const headers = buildApiHeaders(method)
    const opts: RequestInit = { method, headers, credentials: 'include' as RequestCredentials }
    if (body !== null && body !== undefined) opts.body = JSON.stringify(body)

    const res = await fetch(`${BASE}${path}`, opts)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  },

  get(path: string) {
    return this.request('GET', path)
  },
  post(path: string, body?: unknown) {
    return this.request('POST', path, body)
  },
  put(path: string, body?: unknown) {
    return this.request('PUT', path, body)
  },
  del(path: string) {
    return this.request('DELETE', path)
  },

  async upload(path: string, formData: FormData) {
    const headers = buildApiHeaders('POST', false)

    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include' as RequestCredentials,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },
}

export { api, buildApiHeaders }
