import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { ActionButton } from '../components/ui/ActionButton.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import {
  addStudentToClass,
  createClass,
  getClasses,
  joinClassByStudentCode,
  removeStudentFromClass,
} from '../api/classesApi'
import { getUsers } from '../api/usersApi'

export function ClassesPage() {
  const { token, user } = useAuth()
  const [classes, setClasses] = useState([])
  const [users, setUsers] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    grade: '',
    section: '',
    schoolId: user?.schoolId || '',
    teacherId: '',
    students: [],
  })
  const [quickStudentByClassId, setQuickStudentByClassId] = useState({})
  const [joinCode, setJoinCode] = useState('')

  const teachers = useMemo(
    () => users.filter((u) => u.role?.toLowerCase().includes('teacher')),
    [users],
  )
  const students = useMemo(
    () => users.filter((u) => u.role?.toLowerCase() === 'student'),
    [users],
  )

  const loadData = useCallback(async () => {
    try {
      const [classesResponse, usersResponse] = await Promise.all([
        getClasses(token),
        getUsers(token),
      ])
      setClasses(classesResponse.classes || [])
      setUsers(usersResponse.users || [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load classes')
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token, loadData])

  const handleCreateClass = async () => {
    try {
      await createClass(token, form)
      console.log('Create Class clicked')
      setForm((prev) => ({
        ...prev,
        name: '',
        grade: '',
        section: '',
        teacherId: '',
        students: [],
      }))
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create class')
    }
  }

  const handleAddStudent = async (classId) => {
    const studentId = quickStudentByClassId[classId]
    if (!studentId) return
    try {
      await addStudentToClass(token, classId, studentId)
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to add student')
    }
  }

  const handleRemoveStudent = async (classId, studentId) => {
    try {
      await removeStudentFromClass(token, classId, studentId)
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to remove student')
    }
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return
    try {
      await joinClassByStudentCode(token, joinCode.trim())
      setJoinCode('')
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to join class')
    }
  }

  const toggleStudent = (studentId) => {
    setForm((prev) => {
      const exists = prev.students.includes(studentId)
      return {
        ...prev,
        students: exists
          ? prev.students.filter((id) => id !== studentId)
          : [...prev.students, studentId],
      }
    })
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
        <p className="mt-1 text-sm text-slate-600">Create classes and manage students.</p>
      </div>

      {errorMessage ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      ) : null}

      {(user?.role === 'owner' || user?.role === 'admin') && (
        <Card title="Create Class">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              value={form.name}
              placeholder="Class name"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            {user?.role === 'owner' ? (
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                type="text"
                value={form.schoolId}
                placeholder="School ID"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, schoolId: event.target.value }))
                }
              />
            ) : null}
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.teacherId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, teacherId: event.target.value }))
              }
            >
              <option value="">Assign teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.role})
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              value={form.grade}
              placeholder="Grade (ex: 9)"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, grade: event.target.value }))
              }
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              value={form.section}
              placeholder="Section (ex: A)"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, section: event.target.value }))
              }
            />
          </div>
          <p className="text-sm text-slate-600">Add students</p>
          <div className="flex flex-wrap gap-2">
            {students.map((student) => (
              <button
                key={student._id}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  form.students.includes(student._id)
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
                onClick={() => toggleStudent(student._id)}
              >
                {student.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <ActionButton label="Create Class" onClick={handleCreateClass} />
          </div>
        </Card>
      )}

      {user?.role?.toLowerCase().includes('student') ? (
        <Card title="Join Class by Student Code">
          <div className="flex gap-2">
            <input
              className="field-input"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value)}
              placeholder="Enter student code"
            />
            <ActionButton label="Join" onClick={handleJoinByCode} />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {classes.map((classItem) => (
          <Card key={classItem._id} title={classItem.name}>
            <p className="text-sm text-slate-700">
              Teacher: <strong>{classItem.teacherId?.name || 'Not assigned'}</strong>
            </p>
            <p className="text-sm text-slate-700">Students: {classItem.students?.length || 0}</p>
            <p className="text-xs text-indigo-700">
              {classItem.grade ? `Grade ${classItem.grade}` : ''} {classItem.section ? `Section ${classItem.section}` : ''}
            </p>
            <p className="text-xs text-indigo-700">Class Code: {classItem.classCode}</p>
            <div className="flex flex-wrap gap-2">
              {(classItem.students || []).map((student) => (
                <button
                  key={student._id}
                  type="button"
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                  onClick={() => handleRemoveStudent(classItem._id, student._id)}
                >
                  {student.name} x
                </button>
              ))}
            </div>
            {(user?.role === 'owner' || user?.role === 'admin') && (
              <div className="flex gap-2">
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={quickStudentByClassId[classItem._id] || ''}
                  onChange={(event) =>
                    setQuickStudentByClassId((prev) => ({
                      ...prev,
                      [classItem._id]: event.target.value,
                    }))
                  }
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                <ActionButton
                  label="Add Student"
                  variant="secondary"
                  onClick={() => handleAddStudent(classItem._id)}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
