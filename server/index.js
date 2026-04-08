import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { connectDatabase } from './config/db.js'
import { ensureSingleOwner, ensureTestAccounts } from './config/bootstrapOwner.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import classRoutes from './routes/classRoutes.js'
import schoolRoutes from './routes/schoolRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import competitionRoutes from './routes/competitionRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import videoRoomRoutes from './routes/videoRoomRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5000)

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/competitions', competitionRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/video-rooms', videoRoomRoutes)
app.use('/api/chat', chatRoutes)

async function startServer() {
  try {
    await connectDatabase()
    await ensureSingleOwner()
    await ensureTestAccounts()

    app.listen(port, () => {
      console.log(`Study Hive backend running on port ${port}`)
    })
  } catch (error) {
    console.error('Server start failed:', error.message)
    process.exit(1)
  }
}

startServer()
