import { apiRequest } from './http'

export function getTasks(token) {
  return apiRequest('/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createTask(token, payload) {
  return apiRequest('/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function completeTask(token, taskId) {
  return apiRequest(`/tasks/${taskId}/complete`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getTaskClassOptions(token) {
  return apiRequest('/tasks/classes/options', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
