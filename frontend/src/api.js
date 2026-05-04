const BASE = '/api'

async function req(method, path, body) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
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
  setPayment: (id, category, paid) => req('PATCH', `/guests/${id}/payment`, { category, paid }),
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
}
