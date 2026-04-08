import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { ChatMessage } from '../models/ChatMessage.js'

const router = express.Router()
router.use(requireAuth)

router.get('/general', async (req, res) => {
  const filter = req.user.role === 'owner'
    ? { room: 'general' }
    : { room: 'general', schoolId: req.user.schoolId }

  const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).limit(200)
  res.json({ messages })
})

router.post('/general', async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) {
    return res.status(400).json({ message: 'Message text is required.' })
  }

  const message = await ChatMessage.create({
    senderId: req.user._id,
    senderName: req.user.name,
    text: text.trim(),
    schoolId: req.user.role === 'owner' ? null : req.user.schoolId,
    room: 'general',
  })

  res.status(201).json({ message: 'Message sent.', chat: message })
})

export default router
