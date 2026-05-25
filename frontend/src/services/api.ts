const BASE = '/api'

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

const api = {
  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`

    const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])
    if (!safeMethods.has(method.toUpperCase())) {
      const csrf = getCsrfToken()
      if (csrf) headers['X-CSRF-Token'] = csrf
    }

    const opts = { method, headers, credentials: 'include' }
    if (body) opts.body = JSON.stringify(body)

    const res = await fetch(`${BASE}${path}`, opts)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  },

  get(path) {
    return this.request('GET', path)
  },
  post(path, body) {
    return this.request('POST', path, body)
  },
  put(path, body) {
    return this.request('PUT', path, body)
  },
  del(path) {
    return this.request('DELETE', path)
  },

  async upload(path, formData) {
    const headers = {}
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`
    const csrf = getCsrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf

    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },
}

export { api }
