import { apiRequest } from './http'

export function getVideoRooms(token) {
  return apiRequest('/video-rooms', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createVideoRoom(token, payload) {
  return apiRequest('/video-rooms', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}

export function joinVideoRoom(token, roomId, inviteToken = '') {
  return apiRequest(`/video-rooms/${roomId}/join`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ inviteToken }),
  })
}
