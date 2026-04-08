import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useState } from 'react'
import { updateMyProfile } from '../api/usersApi'

export function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '')
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    try {
      const response = await updateMyProfile(token, { name, profilePicture })
      updateUser(response.user)
      setMessage('Profile updated')
    } catch (error) {
      setMessage(error.message || 'Failed to update profile')
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-slate-600">Manage your account details and avatar URL.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Account Info">
          <p className="text-sm">Name: {user?.name ?? '-'}</p>
          <p className="text-sm">
            Role:{' '}
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
              {user?.role ?? '-'}
            </span>
          </p>
          <p className="text-sm">XP: {user?.xp ?? 0}</p>
          <p className="text-sm">Rank: {user?.rank ?? '-'}</p>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-28 w-28 rounded-full border border-slate-200 object-cover"
            />
          ) : null}
        </Card>
        <Card title="Edit Profile">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={profilePicture}
            onChange={(event) => setProfilePicture(event.target.value)}
            placeholder="Profile picture URL"
          />
          <div className="flex gap-2">
            <ActionButton label="Save Profile" onClick={handleSave} />
          </div>
          {message ? <p className="text-xs text-slate-600">{message}</p> : null}
        </Card>
      </div>
    </section>
  )
}
