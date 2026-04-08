import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { completeTask, createTask, getTaskClassOptions, getTasks } from '../api/tasksApi'
import { getUsers } from '../api/usersApi'

export function TasksPage() {
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedUserIds: [],
    assignedClassIds: [],
  })

  const loadTasks = useCallback(async () => {
    try {
      const [tasksResponse, usersResponse, classesResponse] = await Promise.all([
        getTasks(token),
        getUsers(token).catch(() => ({ users: [] })),
        getTaskClassOptions(token).catch(() => ({ classes: [] })),
      ])
      setTasks(tasksResponse.tasks || [])
      setStudents((usersResponse.users || []).filter((u) => u.role?.toLowerCase().includes('student')))
      setClasses(classesResponse.classes || [])
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadTasks()
  }, [token, loadTasks])

  const handleCreateTask = async () => {
    try {
      await createTask(token, form)
      setForm({ title: '', description: '', assignedUserIds: [], assignedClassIds: [] })
      await loadTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(token, taskId)
      await loadTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-slate-600">Create and track assignments.</p>
      </div>
      {error ? <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {(user?.role === 'owner' || user?.role === 'admin' || user?.role?.toLowerCase().includes('teacher')) && (
        <Card title="Create Task">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Task title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              multiple
              value={form.assignedUserIds}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  assignedUserIds: Array.from(event.target.selectedOptions).map((item) => item.value),
                }))
              }
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              multiple
              value={form.assignedClassIds}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  assignedClassIds: Array.from(event.target.selectedOptions).map((item) => item.value),
                }))
              }
            >
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
          <ActionButton label="Create Task" onClick={handleCreateTask} />
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {tasks.map((task) => (
          <Card key={task._id} title={task.title}>
            <p className="text-sm text-slate-600">{task.description || 'No description'}</p>
            <p className="text-xs text-slate-500">Created by: {task.createdBy?.name || '-'}</p>
            {user?.role === 'student' && (
              <ActionButton
                label="Mark Complete"
                variant="secondary"
                onClick={() => handleCompleteTask(task._id)}
              />
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
