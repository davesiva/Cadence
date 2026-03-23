const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  getPatients: () => request('/patients'),
  getPatient: (id) => request(`/patients/${id}`),

  getEntries: (patientId, days) =>
    request(`/entries/${patientId}${days ? `?days=${days}` : ''}`),
  submitEntry: (patientId, entry) =>
    request(`/entries/${patientId}`, {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
  getJournalHint: (patientId) =>
    request(`/entries/${patientId}/hint`),

  getMedications: (patientId) => request(`/medications/${patientId}`),

  getAlerts: (patientId) => request(`/alerts/${patientId}`),
  resolveAlert: (alertId) =>
    request(`/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ resolved: true }),
    }),
}
