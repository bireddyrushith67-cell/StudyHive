import { Card } from '../components/ui/Card.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../api/dashboardApi'

export function DashboardPage() {
  const { user, token } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!token) return
    getDashboardSummary(token)
      .then((response) => setSummary(response.summary))
      .catch(() => setSummary(null))
  }, [token])

  const role = user?.role?.toLowerCase()
  const roleSubtitle =
    role === 'owner'
      ? 'Super admin dashboard with global control.'
      : ['admin', 'school_admin'].includes(role)
        ? 'Admin dashboard with school operations control.'
        : role === 'principal'
          ? 'Principal dashboard for school academics and discipline.'
          : role === 'dean'
            ? 'Dean dashboard for student outcomes and complaints.'
            : role?.includes('teacher')
              ? 'Teacher dashboard for classes and student performance.'
              : 'Student dashboard with tasks, points and progress.'

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">{roleSubtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="User name">
          <p className="text-lg font-semibold">{user?.name ?? 'Not available'}</p>
        </Card>
        <Card title="Role">
          <span className="w-fit rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
            {user?.role ?? 'Not available'}
          </span>
        </Card>
        <Card title="XP">
          <p className="text-lg font-semibold">{summary?.xp ?? user?.xp ?? 0}</p>
        </Card>
        <Card title="Rank">
          <p className="text-lg font-semibold">{summary?.rank ?? user?.rank ?? '-'}</p>
        </Card>
        <Card title="Marks">
          <p className="text-lg font-semibold">{summary?.marks ?? user?.marks ?? 0}</p>
        </Card>
        <Card title="Complaints">
          <p className="text-lg font-semibold">{summary?.complaints ?? user?.complaints ?? 0}</p>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Schools">
          <p className="text-lg font-semibold">{summary?.schoolsCount ?? '-'}</p>
        </Card>
        <Card title="Classes">
          <p className="text-lg font-semibold">{summary?.classesCount ?? '-'}</p>
        </Card>
        <Card title="Users">
          <p className="text-lg font-semibold">{summary?.usersCount ?? '-'}</p>
        </Card>
        <Card title="Avg Student Marks">
          <p className="text-lg font-semibold">{summary?.averageMarks ?? '-'}</p>
        </Card>
        <Card title="Total Complaints">
          <p className="text-lg font-semibold">{summary?.totalComplaints ?? '-'}</p>
        </Card>
      </div>
      <Card title="Role Dashboard">
        <p className="text-sm text-slate-700">
          Active dashboard: <strong>{summary?.rolePanel || role || 'student'}</strong>
        </p>
      </Card>
    </section>
  )
}
