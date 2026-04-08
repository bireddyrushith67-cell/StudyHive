import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleLogin = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form className="w-full max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleLogin}>
        <p className="text-lg font-bold text-slate-900">Study Hive</p>
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="text-sm text-slate-600">Access your dashboard and manage your study space.</p>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
        />
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
        {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
        <button type="submit" className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="text-sm text-slate-600">
          No account? <Link to="/register" className="font-medium text-indigo-600">Register here</Link>
        </p>
      </form>
    </div>
  )
}
