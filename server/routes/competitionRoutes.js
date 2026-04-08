import express from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'
import { Competition } from '../models/Competition.js'
import { User } from '../models/User.js'
import { rankForXp } from '../utils/rank.js'

const router = express.Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const role = req.user.role.toLowerCase()
  const filter = role === 'owner' ? {} : { schoolId: req.user.schoolId }

  const competitions = await Competition.find(filter)
    .populate('participants', 'name role xp rank')
    .sort({ createdAt: -1 })

  res.json({ competitions })
})

router.post('/', allowRoles(['owner', 'admin', 'teacher']), async (req, res) => {
  const { title, type, description = '', participantIds = [], schoolId = null } = req.body
  if (!title?.trim() || !type?.trim()) {
    return res.status(400).json({ message: 'title and type are required.' })
  }

  const participants = participantIds.filter((id) => mongoose.isValidObjectId(id))
  const competition = await Competition.create({
    title: title.trim(),
    type: type.trim(),
    description,
    schoolId: req.user.role === 'owner' ? schoolId : req.user.schoolId,
    participants,
  })

  res.status(201).json({ message: 'Competition created.', competition })
})

router.patch('/:id/reward', allowRoles(['owner', 'admin', 'teacher']), async (req, res) => {
  const { userId, xpAwarded = 0, score = 0 } = req.body
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Valid userId is required.' })
  }

  const competition = await Competition.findById(req.params.id)
  if (!competition) return res.status(404).json({ message: 'Competition not found.' })

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found.' })

  const nextXp = Number(user.xp || 0) + Number(xpAwarded || 0)
  user.xp = nextXp
  user.rank = rankForXp(nextXp)
  await user.save()

  competition.results.push({ userId, xpAwarded: Number(xpAwarded), score: Number(score) })
  await competition.save()

  res.json({ message: 'XP rewarded and results updated.' })
})

export default router
