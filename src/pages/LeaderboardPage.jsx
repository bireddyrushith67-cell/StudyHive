import { Card } from '../components/ui/Card.jsx'
import { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'
import { getLeaderboard } from '../api/usersApi'

export function LeaderboardPage() {
  const { token } = useAuth()
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    if (!token) return
    getLeaderboard(token)
      .then((response) => setLeaders(response.users || []))
      .catch(() => setLeaders([]))
  }, [token])

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-slate-600">Top performers ranked by XP.</p>
      </div>

      <Card title="Top Learners">
        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <div
              key={leader._id}
              className="grid grid-cols-[40px_1fr_auto] items-center rounded-lg bg-slate-50 px-3 py-2"
            >
              <span className="text-sm font-semibold text-slate-500">#{index + 1}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{leader.name}</p>
                <p className="text-xs text-slate-500">{leader.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{leader.xp} XP</p>
                <p className="text-xs text-amber-700">{leader.rank}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
