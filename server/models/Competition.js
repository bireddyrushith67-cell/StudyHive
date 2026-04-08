import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    xpAwarded: { type: Number, default: 0 },
  },
  { _id: false },
)

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    results: [resultSchema],
  },
  { timestamps: true },
)

export const Competition = mongoose.model('Competition', competitionSchema)
