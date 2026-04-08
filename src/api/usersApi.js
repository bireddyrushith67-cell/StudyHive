import { apiRequest } from './http'

export function getUsers(token) {
  return apiRequest('/users', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function assignRole(token, userId, role) {
  return apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  })
}

export function addXp(token, userId, xpDelta) {
  return apiRequest(`/users/${userId}/xp`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ xpDelta }),
  })
}

export function getLeaderboard(token) {
  return apiRequest('/users/leaderboard', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function updateMyProfile(token, payload) {
  return apiRequest('/users/profile/me', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function assignStudentCode(token, userId, studentCode) {
  return apiRequest(`/users/${userId}/student-code`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentCode }),
  })
}

export function updatePerformance(token, userId, payload) {
  return apiRequest(`/users/${userId}/performance`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}
