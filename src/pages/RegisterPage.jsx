import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { registerUser } from '../api/authApi'

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    schoolId: '',
    schoolCode: '',
    studentCode: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await registerUser({
        ...form,
        schoolId: form.schoolId || null,
      })
      setSuccessMessage('Registration successful. You can now login.')
      setTimeout(() => navigate('/login'), 700)
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form className="w-full max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleRegister}>
        <p className="text-lg font-bold text-slate-900">Study Hive</p>
        <h1 className="text-2xl font-bold text-slate-900">Register</h1>
        <p className="text-sm text-slate-600">Create your account to get started.</p>
        <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700">Name</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-name"
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Full name"
        />
        <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">Email</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-email"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="name@example.com"
        />
        <label htmlFor="reg-pass" className="block text-sm font-medium text-slate-700">Password</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-pass"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          placeholder="Create password"
        />
        <label htmlFor="reg-role" className="block text-sm font-medium text-slate-700">Role</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-role"
          type="text"
          value={form.role}
          onChange={handleChange('role')}
          placeholder="student / teacher / mentor ..."
        />
        <label htmlFor="reg-school" className="block text-sm font-medium text-slate-700">School ID (optional)</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-school"
          type="text"
          value={form.schoolId}
          onChange={handleChange('schoolId')}
          placeholder="Mongo ObjectId"
        />
        <label htmlFor="reg-school-code" className="block text-sm font-medium text-slate-700">School Code (optional)</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-school-code"
          type="text"
          value={form.schoolCode}
          onChange={handleChange('schoolCode')}
          placeholder="SCH-XXXXXX"
        />
        <label htmlFor="reg-student-code" className="block text-sm font-medium text-slate-700">Student Code (optional)</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="reg-student-code"
          type="text"
          value={form.studentCode}
          onChange={handleChange('studentCode')}
          placeholder="STD-XXXXXX"
        />
        {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}
        <button type="submit" className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Create Account
        </button>
        <p className="text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-medium text-indigo-600">Login</Link>
        </p>
      </form>
    </div>
  )
}
