import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { assignSchoolManager, createSchool, getSchools } from '../api/schoolsApi'
import { getUsers } from '../api/usersApi'

export function SchoolsPage() {
  const { token } = useAuth()
  const [schools, setSchools] = useState([])
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [managerBySchoolId, setManagerBySchoolId] = useState({})

  const loadSchools = useCallback(async () => {
    try {
      const [schoolsResponse, usersResponse] = await Promise.all([
        getSchools(token),
        getUsers(token).catch(() => ({ users: [] })),
      ])
      setSchools(schoolsResponse.schools || [])
      setUsers(usersResponse.users || [])
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadSchools()
  }, [token, loadSchools])

  const handleCreateSchool = async () => {
    if (!name.trim()) return
    try {
      await createSchool(token, name)
      setName('')
      await loadSchools()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAssignManager = async (schoolId) => {
    const userId = managerBySchoolId[schoolId]
    if (!userId) return
    try {
      await assignSchoolManager(token, schoolId, userId)
      await loadSchools()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Schools</h1>
        <p className="text-sm text-slate-600">Global school management for owner role.</p>
      </div>
      {error ? <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <Card title="Create School">
        <div className="flex gap-2">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="School name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <ActionButton label="Create School" onClick={handleCreateSchool} />
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {schools.map((school) => (
          <Card key={school._id} title={school.name}>
            <p className="text-xs text-slate-500">ID: {school._id}</p>
            <p className="text-xs text-indigo-700">School Code: {school.schoolCode}</p>
            <p className="text-xs text-slate-500">
              School Admin: {school.managerId?.name || 'Not assigned'}
            </p>
            <div className="flex gap-2">
              <select
                className="field-input"
                value={managerBySchoolId[school._id] || ''}
                onChange={(event) =>
                  setManagerBySchoolId((prev) => ({ ...prev, [school._id]: event.target.value }))
                }
              >
                <option value="">Assign school admin</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <ActionButton
                label="Assign"
                variant="secondary"
                onClick={() => handleAssignManager(school._id)}
              />
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
