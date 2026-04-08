import mongoose from 'mongoose'

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    schoolCode: { type: String, required: true, unique: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
)

export const School = mongoose.model('School', schoolSchema)
