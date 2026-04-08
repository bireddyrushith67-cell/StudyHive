import express from 'express'
import mongoose from 'mongoose'
import { ClassModel } from '../models/Class.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { allowRoles } from '../middleware/roles.js'
import { generateCode } from '../utils/codes.js'

const router = express.Router()

router.use(requireAuth)

// Owner sees all classes. Admin sees classes from their school.
router.get('/', allowRoles(['owner', 'admin', 'teacher', 'student']), async (req, res) => {
  let filter = {}

  if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'student') {
    filter = { schoolId: req.user.schoolId }
  }
  if (req.user.role === 'teacher') filter.teacherId = req.user._id
  if (req.user.role === 'student') filter.students = req.user._id

  const classes = await ClassModel.find(filter)
    .populate('teacherId', 'name email role')
    .populate('students', 'name email role')
    .sort({ createdAt: -1 })

  res.json({ classes })
})

router.post('/create-class', allowRoles(['owner', 'admin', 'school_admin']), async (req, res) => {
  const { name, grade = '', section = '', schoolId, teacherId, students = [] } = req.body

  if (!name || !teacherId) {
    return res.status(400).json({ message: 'name and teacherId are required.' })
  }

  const teacher = await User.findById(teacherId)
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found.' })
  }

  const resolvedSchoolId =
    req.user.role === 'owner'
      ? schoolId || teacher.schoolId
      : req.user.schoolId

  if (!resolvedSchoolId || !mongoose.isValidObjectId(resolvedSchoolId)) {
    return res.status(400).json({ message: 'A valid schoolId is required.' })
  }

  if (req.user.role === 'admin') {
    const teacherInSchool =
      teacher.schoolId &&
      teacher.schoolId.toString() === req.user.schoolId?.toString()

    if (!teacherInSchool) {
      return res
        .status(403)
        .json({ message: 'Admin can only assign teachers in their school.' })
    }
  }

  const filteredStudents = students.filter((id) => mongoose.isValidObjectId(id))
  const studentUsers = await User.find({ _id: { $in: filteredStudents } })

  if (req.user.role === 'admin') {
    const allStudentsInSchool = studentUsers.every(
      (student) =>
        student.schoolId &&
        student.schoolId.toString() === req.user.schoolId?.toString(),
    )

    if (!allStudentsInSchool) {
      return res
        .status(403)
        .json({ message: 'Admin can only add students from their school.' })
    }
  }

  const createdClass = await ClassModel.create({
    name,
    grade,
    section,
    classCode: generateCode('CLS'),
    schoolId: resolvedSchoolId,
    teacherId,
    students: studentUsers.map((student) => student._id),
  })

  if (studentUsers.length) {
    await User.updateMany(
      { _id: { $in: studentUsers.map((item) => item._id) } },
      { classId: createdClass._id },
    )
  }

  const populated = await ClassModel.findById(createdClass._id)
    .populate('teacherId', 'name email role')
    .populate('students', 'name email role')

  res.status(201).json({ message: 'Class created.', classItem: populated })
})

router.patch('/:id/add-student', allowRoles(['owner', 'admin', 'school_admin']), async (req, res) => {
  const { studentId } = req.body
  if (!mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ message: 'Valid studentId is required.' })
  }

  const classItem = await ClassModel.findById(req.params.id)
  if (!classItem) return res.status(404).json({ message: 'Class not found.' })

  if (req.user.role === 'admin' && classItem.schoolId.toString() !== req.user.schoolId?.toString()) {
    return res.status(403).json({ message: 'Admin can only manage classes in their school.' })
  }

  if (!classItem.students.some((id) => id.toString() === studentId)) {
    classItem.students.push(studentId)
    await classItem.save()
    await User.findByIdAndUpdate(studentId, { classId: classItem._id })
  }

  res.json({ message: 'Student added to class.' })
})

router.patch('/:id/remove-student', allowRoles(['owner', 'admin', 'school_admin']), async (req, res) => {
  const { studentId } = req.body
  const classItem = await ClassModel.findById(req.params.id)
  if (!classItem) return res.status(404).json({ message: 'Class not found.' })

  if (req.user.role === 'admin' && classItem.schoolId.toString() !== req.user.schoolId?.toString()) {
    return res.status(403).json({ message: 'Admin can only manage classes in their school.' })
  }

  classItem.students = classItem.students.filter((id) => id.toString() !== String(studentId))
  await classItem.save()
  await User.findByIdAndUpdate(studentId, { classId: null })
  res.json({ message: 'Student removed from class.' })
})

router.post('/join-by-student-code', requireAuth, async (req, res) => {
  const { studentCode } = req.body
  if (!studentCode?.trim()) {
    return res.status(400).json({ message: 'studentCode is required.' })
  }

  const targetStudent = await User.findOne({ studentCode: studentCode.trim().toUpperCase() })
  if (!targetStudent?.classId) {
    return res.status(404).json({ message: 'No class mapped for this student code.' })
  }

  const classItem = await ClassModel.findById(targetStudent.classId)
  if (!classItem) return res.status(404).json({ message: 'Class not found.' })

  if (!classItem.students.some((id) => id.toString() === req.user._id.toString())) {
    classItem.students.push(req.user._id)
    await classItem.save()
  }

  await User.findByIdAndUpdate(req.user._id, {
    schoolId: classItem.schoolId,
    classId: classItem._id,
  })

  res.json({ message: 'Joined class by student code.', classItem })
})

export default router
