const BASE = '/api'

function handleAuthExpired() {
  localStorage.removeItem('admin_token')
  window.dispatchEvent(new CustomEvent('admin-auth-expired'))
  const e = new Error('Сессия истекла, войдите заново')
  e.code = 'auth_expired'
  return e
}

async function req(method, path, body) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401 && token) {
    throw handleAuthExpired()
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Ошибка ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Guests
  register: (data) => req('POST', '/guests/register', data),
  getGuests: () => req('GET', '/guests/'),
  getStats: () => req('GET', '/guests/stats'),
  confirmGuest: (id) => req('PATCH', `/guests/${id}/confirm`),
  deleteGuest: (id) => req('DELETE', `/guests/${id}`),
  setPayment: (id, { paid, amount } = {}) => {
    const body = {}
    if (paid !== undefined) body.paid = paid
    if (amount !== undefined) body.amount = amount
    return req('PATCH', `/guests/${id}/payment`, body)
  },
  setSpouseName: (id, spouse_name) => req('PATCH', `/guests/${id}/spouse-name`, { spouse_name }),
  getPaymentsSummary: () => req('GET', '/guests/payments-summary'),
  getPublicGuests: () => req('GET', '/guests/public'),

  // Auth
  login: (password) => req('POST', '/auth/login', { password }),

  // Vote
  getPoll: () => req('GET', '/vote/'),
  castVote: (optionId) => req('POST', `/vote/${optionId}/vote`),
  createPoll: (data) => req('POST', '/vote/create', data),

  // Info
  getInfo: () => req('GET', '/info/'),
  setInfo: (key, value) => req('POST', '/info/', { key, value }),

  // Payment requisites
  getPaymentInfo: () => req('GET', '/payment/info'),
  updatePaymentInfo: (data) => req('PATCH', '/admin/payment/info', data),
  uploadPaymentQr: async (file) => {
    const token = localStorage.getItem('admin_token')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/payment/qr', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    if (res.status === 401 && token) {
      throw handleAuthExpired()
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Ошибка ${res.status}`)
    }
    return res.json()
  },
}
