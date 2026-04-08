import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    room: { type: String, default: 'general' },
  },
  { timestamps: true },
)

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
