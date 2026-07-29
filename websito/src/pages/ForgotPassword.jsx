import { useState } from 'react'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api'

import BackgroundVideo from '../components/BackgroundVideo'
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await forgotPassword(username)
      setToken(data.token)
    } catch (err) {
      setError(err.message || 'User not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-dark" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 cursor-pointer">
          <ArrowLeft size={18} /><span className="text-sm">Back to Login</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <KeyRound size={24} className="text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
        </div>

        {!token ? (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-white/50 text-xs uppercase tracking-widest">Username</label>
              <input type="text" placeholder="your username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors" required />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer mt-2 disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Reset Token'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30">
              <p className="text-amber-400 text-sm font-semibold mb-2">Your reset token:</p>
              <p className="text-white font-mono text-lg break-all select-all">{token}</p>
            </div>
            <p className="text-white/40 text-xs">Copy this token and use it on the reset page. It expires in 1 hour.</p>
            <button onClick={() => navigate(`/reset-password?username=${encodeURIComponent(username)}`)} className="w-full py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">
              Go to Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
