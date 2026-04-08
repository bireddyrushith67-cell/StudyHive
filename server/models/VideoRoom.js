import mongoose from 'mongoose'

const videoRoomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: '' },
    description: { type: String, default: '' },
    meetingLink: { type: String, required: true, trim: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    inviteToken: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

export const VideoRoom = mongoose.model('VideoRoom', videoRoomSchema)
