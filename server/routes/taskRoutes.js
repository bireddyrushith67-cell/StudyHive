import express from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'
import { Task } from '../models/Task.js'
import { ClassModel } from '../models/Class.js'

const router = express.Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const role = req.user.role.toLowerCase()
  let filter = {}

  if (role !== 'owner') {
    filter.schoolId = req.user.schoolId
  }

  if (role === 'student') {
    filter['assignments.userId'] = req.user._id
  }

  const tasks = await Task.find(filter)
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 })

  res.json({ tasks })
})

router.post('/', allowRoles(['owner', 'admin', 'teacher']), async (req, res) => {
  const { title, description = '', assignedUserIds = [], assignedClassIds = [] } = req.body
  if (!title?.trim()) {
    return res.status(400).json({ message: 'Task title is required.' })
  }

  const assignments = [
    ...assignedUserIds
      .filter((id) => mongoose.isValidObjectId(id))
      .map((userId) => ({ userId })),
    ...assignedClassIds
      .filter((id) => mongoose.isValidObjectId(id))
      .map((classId) => ({ classId })),
  ]

  const task = await Task.create({
    title: title.trim(),
    description,
    createdBy: req.user._id,
    schoolId: req.user.role === 'owner' ? req.body.schoolId || null : req.user.schoolId,
    assignments,
  })

  res.status(201).json({ message: 'Task created.', task })
})

router.patch('/:id/complete', allowRoles(['student']), async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found.' })

  const already = task.completions.find(
    (item) => item.userId.toString() === req.user._id.toString(),
  )
  if (!already) {
    task.completions.push({ userId: req.user._id, completed: true })
  } else {
    already.completed = true
  }
  await task.save()

  res.json({ message: 'Task marked complete.' })
})

router.get('/classes/options', allowRoles(['owner', 'admin', 'teacher']), async (req, res) => {
  const filter = req.user.role === 'owner' ? {} : { schoolId: req.user.schoolId }
  const classes = await ClassModel.find(filter).select('name')
  res.json({ classes })
})

export default router
