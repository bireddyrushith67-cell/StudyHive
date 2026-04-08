import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { createVideoRoom, getVideoRooms, joinVideoRoom } from '../api/videoRoomsApi'

export function VideoRoomsPage() {
  const { token, user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    meetingLink: '',
    visibility: 'public',
    participantIds: [],
  })
  const [inviteTokenByRoomId, setInviteTokenByRoomId] = useState({})

  const loadRooms = useCallback(async () => {
    try {
      const response = await getVideoRooms(token)
      setRooms(response.rooms || [])
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadRooms()
  }, [token, loadRooms])

  const handleCreateRoom = async () => {
    try {
      await createVideoRoom(token, form)
      setForm({
        title: '',
        subject: '',
        description: '',
        meetingLink: '',
        visibility: 'public',
        participantIds: [],
      })
      await loadRooms()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleJoinRoom = async (roomId, visibility) => {
    try {
      await joinVideoRoom(
        token,
        roomId,
        visibility === 'private' ? inviteTokenByRoomId[roomId] || '' : '',
      )
      await loadRooms()
    } catch (e) {
      setError(e.message)
    }
  }

  const canCreate =
    ['owner', 'admin', 'school_admin', 'principal', 'dean'].includes(
      user?.role?.toLowerCase(),
    ) || user?.role?.toLowerCase().includes('teacher')

  return (
    <section className="space-y-4">
      <div>
        <h1 className="page-title">Video Rooms</h1>
        <p className="page-subtitle">Create and join study calls.</p>
      </div>
      {error ? <p className="status-error">{error}</p> : null}
      {canCreate ? (
        <Card title="Create Video Room">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className="field-input"
              placeholder="Room title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="Subject"
              value={form.subject}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, subject: event.target.value }))
              }
            />
            <input
              className="field-input"
              placeholder="Meeting link"
              value={form.meetingLink}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, meetingLink: event.target.value }))
              }
            />
            <input
              className="field-input"
              placeholder="Description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <select
            className="field-input"
            value={form.visibility}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, visibility: event.target.value }))
            }
          >
            <option value="public">Public (teacher and above)</option>
            <option value="private">Private (invite link)</option>
          </select>
          <ActionButton label="Create Room" onClick={handleCreateRoom} />
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {rooms.map((room) => (
          <Card key={room._id} title={room.title}>
            <p className="text-xs text-indigo-700">Subject: {room.subject || 'General'}</p>
            <p className="text-xs text-slate-500">Visibility: {room.visibility}</p>
            <p className="text-sm text-slate-600">{room.description || 'No description'}</p>
            <p className="text-xs text-slate-500">Created by: {room.createdBy?.name || '-'}</p>
            <p className="text-xs text-emerald-700">
              You are in: {room.participants?.some((p) => p._id === user?.id || p._id === user?._id) ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-slate-500">Participants: {room.participants?.length || 0}</p>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                label="I am in"
                variant="secondary"
                onClick={() => handleJoinRoom(room._id, room.visibility)}
              />
              <ActionButton
                label="Copy Link"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(room.meetingLink)}
              />
              {room.visibility === 'private' && room.inviteToken ? (
                <ActionButton
                  label="Copy Private Invite"
                  variant="secondary"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${room.meetingLink}${room.meetingLink.includes('?') ? '&' : '?'}inviteToken=${room.inviteToken}`,
                    )
                  }
                />
              ) : null}
            </div>
            {room.visibility === 'private' ? (
              <input
                className="field-input"
                placeholder="Paste invite token"
                value={inviteTokenByRoomId[room._id] || ''}
                onChange={(event) =>
                  setInviteTokenByRoomId((prev) => ({
                    ...prev,
                    [room._id]: event.target.value,
                  }))
                }
              />
            ) : null}
            <a
              href={room.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="w-fit rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Join Room
            </a>
          </Card>
        ))}
      </div>
    </section>
  )
}
