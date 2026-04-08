const STORAGE_KEY = 'study-hive-user'

export function getStoredUser() {
  const rawUser = localStorage.getItem(STORAGE_KEY)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)
  } catch (error) {
    console.error('Failed to parse user from localStorage', error)
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getStoredToken() {
  return getStoredUser()?.token ?? null
}
