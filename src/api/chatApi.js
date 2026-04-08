import { apiRequest } from './http'

export function getGeneralChat(token) {
  return apiRequest('/chat/general', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function sendGeneralChat(token, text) {
  return apiRequest('/chat/general', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  })
}
