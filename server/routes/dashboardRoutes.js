import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { ClassModel } from '../models/Class.js'
import { School } from '../models/School.js'
import { Task } from '../models/Task.js'

const router = express.Router()
router.use(requireAuth)

router.get('/summary', async (req, res) => {
  const role = req.user.role.toLowerCase()

  const schoolFilter = role === 'owner' ? {} : { schoolId: req.user.schoolId }

  const [usersCount, classesCount, schoolsCount, tasksCount, studentStats] = await Promise.all([
    User.countDocuments(schoolFilter),
    ClassModel.countDocuments(schoolFilter),
    role === 'owner' ? School.countDocuments({}) : Promise.resolve(1),
    Task.countDocuments(schoolFilter),
    User.find({ ...schoolFilter, role: /student/i }).select('marks complaints xp').limit(200),
  ])

  const totalStudents = studentStats.length || 1
  const averageMarks = Math.round(
    studentStats.reduce((sum, item) => sum + Number(item.marks || 0), 0) / totalStudents,
  )
  const totalComplaints = studentStats.reduce(
    (sum, item) => sum + Number(item.complaints || 0),
    0,
  )

  res.json({
    summary: {
      usersCount,
      classesCount,
      schoolsCount,
      tasksCount,
      xp: req.user.xp ?? 0,
      rank: req.user.rank ?? 'Bronze 1',
      marks: req.user.marks ?? 0,
      complaints: req.user.complaints ?? 0,
      averageMarks,
      totalComplaints,
      rolePanel:
        role === 'owner'
          ? 'super_admin'
          : ['admin', 'school_admin'].includes(role)
            ? 'admin'
            : role === 'principal'
              ? 'principal'
              : role === 'dean'
                ? 'dean'
                : role.includes('teacher')
                  ? 'teacher'
                  : 'student',
    },
  })
})

export default router
