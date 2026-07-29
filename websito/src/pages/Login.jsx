import { useState } from 'react'
import { ArrowLeft, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { login, saveAuth } from '../api'

import BackgroundVideo from '../components/BackgroundVideo'
export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      saveAuth(data)
      navigate(data.user?.is_staff ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-dark" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <LogIn size={24} className="text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Login</h1>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs uppercase tracking-widest">Username</label>
            <input
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs uppercase tracking-widest">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" onClick={() => navigate('/forgot-password')} className="text-white/40 hover:text-amber-400 text-xs uppercase tracking-widest transition-colors cursor-pointer text-center">
            Forgot Password?
          </button>
        </form>
        <div className="relative flex items-center gap-3 py-4">
          <span className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest">or</span>
          <span className="flex-1 h-px bg-white/10" />
        </div>
        <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white/90 text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}
