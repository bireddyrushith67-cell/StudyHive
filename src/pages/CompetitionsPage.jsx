import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import {
  createCompetition,
  getCompetitions,
  rewardCompetitionXp,
} from '../api/competitionsApi'
import { getUsers } from '../api/usersApi'

export function CompetitionsPage() {
  const { token, user } = useAuth()
  const [competitions, setCompetitions] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    type: 'workshop',
    description: '',
    participantIds: [],
  })
  const [reward, setReward] = useState({ competitionId: '', userId: '', xpAwarded: 0 })

  const loadData = useCallback(async () => {
    try {
      const [compResponse, usersResponse] = await Promise.all([
        getCompetitions(token),
        getUsers(token).catch(() => ({ users: [] })),
      ])
      setCompetitions(compResponse.competitions || [])
      setUsers(usersResponse.users || [])
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token, loadData])

  const handleCreate = async () => {
    try {
      await createCompetition(token, form)
      setForm({ title: '', type: 'workshop', description: '', participantIds: [] })
      await loadData()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleReward = async () => {
    try {
      await rewardCompetitionXp(token, reward.competitionId, reward)
      await loadData()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Competitions</h1>
        <p className="text-sm text-slate-600">Create competitions and reward XP.</p>
      </div>
      {error ? <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {(user?.role === 'owner' || user?.role === 'admin' || user?.role?.toLowerCase().includes('teacher')) && (
        <Card title="Create Competition">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Type"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            multiple
            value={form.participantIds}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                participantIds: Array.from(event.target.selectedOptions).map((item) => item.value),
              }))
            }
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <ActionButton label="Create Competition" onClick={handleCreate} />
        </Card>
      )}
      {(user?.role === 'owner' || user?.role === 'admin' || user?.role?.toLowerCase().includes('teacher')) && (
        <Card title="Reward XP">
          <div className="grid gap-2 md:grid-cols-3">
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={reward.competitionId}
              onChange={(event) => setReward((prev) => ({ ...prev, competitionId: event.target.value }))}
            >
              <option value="">Select competition</option>
              {competitions.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={reward.userId}
              onChange={(event) => setReward((prev) => ({ ...prev, userId: event.target.value }))}
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="number"
              value={reward.xpAwarded}
              onChange={(event) => setReward((prev) => ({ ...prev, xpAwarded: Number(event.target.value) }))}
              placeholder="XP to award"
            />
          </div>
          <ActionButton label="Reward XP" variant="secondary" onClick={handleReward} />
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {competitions.map((competition) => (
          <Card key={competition._id} title={competition.title}>
            <p className="text-sm text-slate-600">{competition.type}</p>
            <p className="text-sm text-slate-600">{competition.description || 'No description'}</p>
            <div className="flex flex-wrap gap-2">
              {(competition.participants || []).map((u) => (
                <span key={u._id} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                  {u.name}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
