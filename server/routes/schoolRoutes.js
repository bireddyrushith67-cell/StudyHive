import express from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'
import { School } from '../models/School.js'
import { User } from '../models/User.js'
import { generateCode } from '../utils/codes.js'

const router = express.Router()
router.use(requireAuth)

router.get('/', allowRoles(['owner', 'admin']), async (req, res) => {
  const filter = req.user.role === 'owner' ? {} : { _id: req.user.schoolId }
  const schools = await School.find(filter).populate('managerId', 'name email role').sort({ name: 1 })
  res.json({ schools })
})

router.post('/', allowRoles(['owner']), async (req, res) => {
  const { name, managerId = null } = req.body
  if (!name?.trim()) {
    return res.status(400).json({ message: 'School name is required.' })
  }

  const school = await School.create({
    name: name.trim(),
    schoolCode: generateCode('SCH'),
    managerId: mongoose.isValidObjectId(managerId) ? managerId : null,
  })

  if (school.managerId) {
    await User.findByIdAndUpdate(school.managerId, {
      schoolId: school._id,
      role: 'school_admin',
    })
  }

  res.status(201).json({ message: 'School created.', school })
})

router.patch('/:id/assign-manager', allowRoles(['owner']), async (req, res) => {
  const { userId } = req.body
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Valid userId is required.' })
  }

  const school = await School.findById(req.params.id)
  if (!school) return res.status(404).json({ message: 'School not found.' })

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ message: 'User not found.' })

  school.managerId = user._id
  await school.save()

  user.schoolId = school._id
  user.role = 'school_admin'
  await user.save()

  res.json({ message: 'School manager assigned.', school })
})

router.post('/join-by-code', requireAuth, async (req, res) => {
  const { schoolCode } = req.body
  if (!schoolCode?.trim()) return res.status(400).json({ message: 'schoolCode is required.' })

  const school = await School.findOne({ schoolCode: schoolCode.trim().toUpperCase() })
  if (!school) return res.status(404).json({ message: 'School not found.' })

  await User.findByIdAndUpdate(req.user._id, { schoolId: school._id })
  res.json({ message: 'Joined school.', school })
})

export default router
