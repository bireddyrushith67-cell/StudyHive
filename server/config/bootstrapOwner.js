import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { rankForXp } from '../utils/rank.js'

export async function ensureSingleOwner() {
  const owners = await User.find({ role: 'owner' })

  if (owners.length === 0) {
    const hashedPassword = await bcrypt.hash(
      'rushithisthebestandmostop',
      Number(process.env.BCRYPT_ROUNDS || 10),
    )

    await User.create({
      name: 'Rushith',
      email: 'rushith@studyhive.com',
      password: hashedPassword,
      role: 'owner',
      schoolId: null,
      xp: 0,
      rank: rankForXp(0),
    })

    console.log('Default owner account created')
    return
  }

  if (owners.length > 1) {
    console.warn(
      'Warning: More than one owner account exists. Keep only one owner for policy compliance.',
    )
  }
}

async function ensureTestUser({ name, email, password, role }) {
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS || 10),
  )

  await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    schoolId: null,
    xp: 50,
    rank: rankForXp(50),
  })
}

// These test users make local login easy during development.
export async function ensureTestAccounts() {
  await ensureTestUser({
    name: 'Study Admin',
    email: 'admin@studyhive.com',
    password: 'admin12345',
    role: 'admin',
  })

  await ensureTestUser({
    name: 'Study Teacher',
    email: 'teacher@studyhive.com',
    password: 'teacher12345',
    role: 'teacher',
  })

  await ensureTestUser({
    name: 'Study Student',
    email: 'student@studyhive.com',
    password: 'student12345',
    role: 'student',
  })
}
