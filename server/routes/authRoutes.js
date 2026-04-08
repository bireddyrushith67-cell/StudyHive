import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { rankForXp } from '../utils/rank.js'
import { generateCode } from '../utils/codes.js'
import { School } from '../models/School.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      schoolId = null,
      schoolCode = '',
      studentCode = '',
      profilePicture = '',
    } = req.body

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'name, email and password are required.' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS || 10),
    )

    const normalizedSchoolId = schoolId && mongoose.isValidObjectId(schoolId)
      ? schoolId
      : null

    let resolvedSchoolId = normalizedSchoolId
    if (!resolvedSchoolId && schoolCode?.trim()) {
      const school = await School.findOne({ schoolCode: schoolCode.trim().toUpperCase() })
      resolvedSchoolId = school?._id || null
    }

    const createdUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      schoolId: resolvedSchoolId,
      studentCode: studentCode?.trim()
        ? studentCode.trim().toUpperCase()
        : role.toLowerCase().includes('student')
          ? generateCode('STD')
          : '',
      rank: rankForXp(0),
      profilePicture,
    })

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        schoolId: createdUser.schoolId,
        xp: createdUser.xp,
        marks: createdUser.marks,
        complaints: createdUser.complaints,
        rank: createdUser.rank,
        profilePicture: createdUser.profilePicture,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Failed to register user.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const passwordOk = await bcrypt.compare(password, user.password)
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        xp: user.xp,
        marks: user.marks,
        complaints: user.complaints,
        rank: user.rank,
        profilePicture: user.profilePicture,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Failed to login.' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user })
})

export default router
