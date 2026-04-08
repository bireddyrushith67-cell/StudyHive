import { apiRequest } from './http'

export function getCompetitions(token) {
  return apiRequest('/competitions', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createCompetition(token, payload) {
  return apiRequest('/competitions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function rewardCompetitionXp(token, competitionId, payload) {
  return apiRequest(`/competitions/${competitionId}/reward`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}
