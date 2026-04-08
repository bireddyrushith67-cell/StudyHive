import { apiRequest } from './http'

export function getClasses(token) {
  return apiRequest('/classes', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createClass(token, payload) {
  return apiRequest('/classes/create-class', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function joinClassByStudentCode(token, studentCode) {
  return apiRequest('/classes/join-by-student-code', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentCode }),
  })
}

export function addStudentToClass(token, classId, studentId) {
  return apiRequest(`/classes/${classId}/add-student`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentId }),
  })
}

export function removeStudentFromClass(token, classId, studentId) {
  return apiRequest(`/classes/${classId}/remove-student`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentId }),
  })
}
