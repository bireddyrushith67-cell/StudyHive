import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import {
  addXp,
  assignRole,
  assignStudentCode,
  getUsers,
  updatePerformance,
} from '../api/usersApi'

export function UsersPage() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState([])
  const [rolesByUserId, setRolesByUserId] = useState({})
  const [xpByUserId, setXpByUserId] = useState({})
  const [studentCodeByUserId, setStudentCodeByUserId] = useState({})
  const [marksByUserId, setMarksByUserId] = useState({})
  const [complaintsByUserId, setComplaintsByUserId] = useState({})
  const [errorMessage, setErrorMessage] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      const response = await getUsers(token)
      setUsers(response.users || [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load users')
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadUsers()
  }, [token, loadUsers])

  const handleAssignRole = async (targetUser) => {
    const nextRole = rolesByUserId[targetUser._id]?.trim()
    if (!nextRole) return

    try {
      await assignRole(token, targetUser._id, nextRole)
      console.log('Assign Role clicked')
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update role')
    }
  }

  const handleAddXp = async (targetUser) => {
    const xpDelta = Number(xpByUserId[targetUser._id] || 0)
    if (!xpDelta) return
    try {
      await addXp(token, targetUser._id, xpDelta)
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update XP')
    }
  }

  const handleAssignStudentCode = async (targetUser) => {
    const studentCode = studentCodeByUserId[targetUser._id]?.trim()
    if (!studentCode) return
    try {
      await assignStudentCode(token, targetUser._id, studentCode)
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to set student code')
    }
  }

  const handleUpdatePerformance = async (targetUser) => {
    try {
      await updatePerformance(token, targetUser._id, {
        marks: Number(marksByUserId[targetUser._id] ?? targetUser.marks ?? 0),
        complaints: Number(
          complaintsByUserId[targetUser._id] ?? targetUser.complaints ?? 0,
        ),
      })
      await loadUsers()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update performance')
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage users, assign flexible roles, and update XP.
        </p>
      </div>
      {errorMessage ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {users.map((item) => (
          <Card key={item._id} title={item.name}>
            <p className="text-sm text-slate-600">{item.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                {item.role}
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                {item.rank}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {item.xp} XP
              </span>
              <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
                Marks: {item.marks ?? 0}
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                Complaints: {item.complaints ?? 0}
              </span>
              {item.studentCode ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {item.studentCode}
                </span>
              ) : null}
            </div>
            {(user?.role === 'owner' || user?.role === 'admin') && (
              <div className="flex flex-wrap gap-2">
                <input
                  className="min-w-[180px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  type="text"
                  value={rolesByUserId[item._id] ?? item.role}
                  onChange={(event) =>
                    setRolesByUserId((prev) => ({
                      ...prev,
                      [item._id]: event.target.value,
                    }))
                  }
                  placeholder="Assign custom role"
                />
                <ActionButton
                  label="Assign Role"
                  onClick={() => handleAssignRole(item)}
                />
                <input
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  type="number"
                  value={xpByUserId[item._id] ?? ''}
                  onChange={(event) =>
                    setXpByUserId((prev) => ({ ...prev, [item._id]: event.target.value }))
                  }
                  placeholder="XP"
                />
                <ActionButton label="Add XP" onClick={() => handleAddXp(item)} variant="secondary" />
                <input
                  className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  type="text"
                  value={studentCodeByUserId[item._id] ?? item.studentCode ?? ''}
                  onChange={(event) =>
                    setStudentCodeByUserId((prev) => ({
                      ...prev,
                      [item._id]: event.target.value,
                    }))
                  }
                  placeholder="STD-XXXXXX"
                />
                <ActionButton
                  label="Set Student Code"
                  variant="secondary"
                  onClick={() => handleAssignStudentCode(item)}
                />
                <input
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  type="number"
                  value={marksByUserId[item._id] ?? item.marks ?? 0}
                  onChange={(event) =>
                    setMarksByUserId((prev) => ({ ...prev, [item._id]: event.target.value }))
                  }
                  placeholder="Marks"
                />
                <input
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  type="number"
                  value={complaintsByUserId[item._id] ?? item.complaints ?? 0}
                  onChange={(event) =>
                    setComplaintsByUserId((prev) => ({
                      ...prev,
                      [item._id]: event.target.value,
                    }))
                  }
                  placeholder="Complaints"
                />
                <ActionButton
                  label="Update Performance"
                  variant="secondary"
                  onClick={() => handleUpdatePerformance(item)}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
