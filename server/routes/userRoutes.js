import express from 'express'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'
import { rankForXp } from '../utils/rank.js'

const router = express.Router()

router.use(requireAuth)

// Owner sees all users; admin sees only users from their school.
router.get('/', allowRoles(['owner', 'admin', 'school_admin']), async (req, res) => {
  const filter = req.user.role === 'owner' ? {} : { schoolId: req.user.schoolId }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
  res.json({ users })
})

router.patch('/:id/role', allowRoles(['owner', 'admin', 'school_admin']), async (req, res) => {
  const { role } = req.body
  if (!role || typeof role !== 'string') {
    return res.status(400).json({ message: 'role is required.' })
  }

  const targetUser = await User.findById(req.params.id)
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found.' })
  }

  // Admin can only modify roles for users in the same school.
  if (req.user.role === 'admin' || req.user.role === 'school_admin') {
    const sameSchool =
      targetUser.schoolId &&
      req.user.schoolId &&
      targetUser.schoolId.toString() === req.user.schoolId.toString()

    if (!sameSchool) {
      return res
        .status(403)
        .json({ message: 'Admin can only manage users in their school.' })
    }
  }

  targetUser.role = role
  await targetUser.save()

  res.json({
    message: 'Role updated.',
    user: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      schoolId: targetUser.schoolId,
      xp: targetUser.xp,
      rank: targetUser.rank,
    },
  })
})

router.patch('/:id/xp', allowRoles(['owner', 'admin', 'school_admin', 'teacher']), async (req, res) => {
  const { xpDelta = 0 } = req.body
  const targetUser = await User.findById(req.params.id)
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found.' })
  }

  if (req.user.role === 'admin' || req.user.role === 'school_admin') {
    const sameSchool =
      targetUser.schoolId &&
      req.user.schoolId &&
      targetUser.schoolId.toString() === req.user.schoolId.toString()
    if (!sameSchool) {
      return res.status(403).json({ message: 'Admin can only modify users in their school.' })
    }
  }

  const nextXp = Math.max(0, Number(targetUser.xp || 0) + Number(xpDelta || 0))
  targetUser.xp = nextXp
  targetUser.rank = rankForXp(nextXp)
  await targetUser.save()

  res.json({ message: 'XP updated.', user: targetUser })
})

router.patch('/:id/performance', allowRoles(['owner', 'admin', 'school_admin', 'principal', 'dean', 'teacher']), async (req, res) => {
  const { marks, complaints } = req.body
  const targetUser = await User.findById(req.params.id)
  if (!targetUser) return res.status(404).json({ message: 'User not found.' })

  if (req.user.role !== 'owner') {
    const sameSchool =
      targetUser.schoolId &&
      req.user.schoolId &&
      targetUser.schoolId.toString() === req.user.schoolId.toString()
    if (!sameSchool) {
      return res.status(403).json({ message: 'You can only manage users in your school.' })
    }
  }

  if (marks !== undefined) targetUser.marks = Math.max(0, Number(marks))
  if (complaints !== undefined) targetUser.complaints = Math.max(0, Number(complaints))
  await targetUser.save()

  res.json({ message: 'Performance updated.', user: targetUser })
})

router.patch('/profile/me', async (req, res) => {
  const { name, profilePicture } = req.body
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ message: 'User not found.' })

  if (typeof name === 'string' && name.trim()) user.name = name.trim()
  if (typeof profilePicture === 'string') user.profilePicture = profilePicture.trim()
  await user.save()

  res.json({
    message: 'Profile updated.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      xp: user.xp,
      rank: user.rank,
      profilePicture: user.profilePicture,
    },
  })
})

router.get('/students/list', allowRoles(['owner', 'admin', 'teacher']), async (req, res) => {
  const filter = {
    ...(req.user.role === 'owner' ? {} : { schoolId: req.user.schoolId }),
    role: /student/i,
  }
  const students = await User.find(filter).select('name email role xp rank')
  res.json({ students })
})

router.patch('/:id/student-code', allowRoles(['owner', 'admin', 'school_admin']), async (req, res) => {
  const { studentCode } = req.body
  if (!studentCode?.trim()) {
    return res.status(400).json({ message: 'studentCode is required.' })
  }

  const targetUser = await User.findById(req.params.id)
  if (!targetUser) return res.status(404).json({ message: 'User not found.' })

  targetUser.studentCode = studentCode.trim().toUpperCase()
  await targetUser.save()
  res.json({ message: 'Student code assigned.', user: targetUser })
})

router.get('/leaderboard', async (req, res) => {
  const filter = req.user.role === 'owner' ? {} : { schoolId: req.user.schoolId }
  const users = await User.find(filter)
    .select('name role xp rank profilePicture')
    .sort({ xp: -1 })
    .limit(20)
  res.json({ users })
})

export default router
