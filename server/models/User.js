import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    // String role is intentionally flexible for custom roles.
    role: { type: String, required: true, default: 'student' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
    studentCode: { type: String, default: '', index: true },
    xp: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    complaints: { type: Number, default: 0 },
    rank: { type: String, default: 'Bronze 1' },
    profilePicture: { type: String, default: '' },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
