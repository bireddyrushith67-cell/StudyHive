import { apiRequest } from './http'

export function getDashboardSummary(token) {
  return apiRequest('/dashboard/summary', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
