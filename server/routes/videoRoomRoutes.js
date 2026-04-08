import express from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'
import { VideoRoom } from '../models/VideoRoom.js'
import { generateInviteToken } from '../utils/tokens.js'

const router = express.Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const role = req.user.role.toLowerCase()
  const isTeacherOrAbove = ['owner', 'admin', 'school_admin', 'principal', 'dean'].includes(role) || role.includes('teacher')
  const schoolFilter = req.user.role === 'owner' ? {} : { schoolId: req.user.schoolId }

  const visibilityFilter = isTeacherOrAbove
    ? { $or: [{ visibility: 'public' }, { participants: req.user._id }, { createdBy: req.user._id }] }
    : { $or: [{ visibility: 'private', participants: req.user._id }, { createdBy: req.user._id }] }

  const rooms = await VideoRoom.find({ ...schoolFilter, ...visibilityFilter })
    .populate('createdBy', 'name role')
    .populate('participants', 'name role')
    .sort({ createdAt: -1 })

  res.json({ rooms })
})

router.post('/', allowRoles(['owner', 'admin', 'school_admin', 'principal', 'dean', 'teacher']), async (req, res) => {
  const {
    title,
    subject = '',
    description = '',
    meetingLink,
    visibility = 'public',
    participantIds = [],
    schoolId = null,
  } = req.body

  if (!title?.trim() || !meetingLink?.trim()) {
    return res.status(400).json({ message: 'title and meetingLink are required.' })
  }

  const participants = participantIds.filter((id) => mongoose.isValidObjectId(id))
  const room = await VideoRoom.create({
    title: title.trim(),
    subject: subject.trim(),
    description,
    meetingLink: meetingLink.trim(),
    visibility,
    inviteToken: visibility === 'private' ? generateInviteToken() : '',
    createdBy: req.user._id,
    schoolId: req.user.role === 'owner' ? schoolId : req.user.schoolId,
    participants,
  })

  res.status(201).json({ message: 'Video room created.', room })
})

router.patch('/:id/join', async (req, res) => {
  const { inviteToken = '' } = req.body
  const room = await VideoRoom.findById(req.params.id)
  if (!room) return res.status(404).json({ message: 'Room not found.' })

  const sameSchool =
    req.user.role === 'owner' ||
    String(room.schoolId || '') === String(req.user.schoolId || '')

  if (!sameSchool) {
    return res.status(403).json({ message: 'You can only join your school rooms.' })
  }

  const role = req.user.role.toLowerCase()
  const isTeacherOrAbove = ['owner', 'admin', 'school_admin', 'principal', 'dean'].includes(role) || role.includes('teacher')
  if (room.visibility === 'public' && !isTeacherOrAbove) {
    return res.status(403).json({ message: 'Public rooms are open only for teacher and above roles.' })
  }
  if (room.visibility === 'private' && room.createdBy.toString() !== req.user._id.toString()) {
    const validToken = inviteToken && inviteToken === room.inviteToken
    if (!validToken) {
      return res.status(403).json({ message: 'Private room needs a valid invite link token.' })
    }
  }

  if (!room.participants.some((id) => id.toString() === req.user._id.toString())) {
    room.participants.push(req.user._id)
    await room.save()
  }

  res.json({ message: 'You are now in this room.', room })
})

export default router
