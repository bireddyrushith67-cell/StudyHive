import { apiRequest } from './http'

export function getSchools(token) {
  return apiRequest('/schools', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createSchool(token, name) {
  return apiRequest('/schools', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  })
}

export function assignSchoolManager(token, schoolId, userId) {
  return apiRequest(`/schools/${schoolId}/assign-manager`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  })
}
