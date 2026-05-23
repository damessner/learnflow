const BASE = '/api'

const api = {
  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`

    const opts = { method, headers }
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

    const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },
}

export { api }
