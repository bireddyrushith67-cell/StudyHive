import crypto from 'crypto'

export function generateInviteToken() {
  return crypto.randomBytes(16).toString('hex')
}
