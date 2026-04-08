import mongoose from 'mongoose'

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, default: '' },
    section: { type: String, default: '' },
    classCode: { type: String, required: true, unique: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

export const ClassModel = mongoose.model('Class', classSchema)
