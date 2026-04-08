import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.userId).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token.' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid authentication token.' })
  }
}
