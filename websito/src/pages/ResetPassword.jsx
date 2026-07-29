import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { resetPassword } from '../api'

import BackgroundVideo from '../components/BackgroundVideo'
export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState(params.get('username') || '')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await resetPassword(username, token, newPassword)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
        <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-dark" />
        <div className="relative z-10 text-center">
          <KeyRound size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-white/50 mb-6">Your password has been changed successfully.</p>
          <button onClick={() => navigate('/login')} className="px-8 py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">Go to Login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/46660/46660-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-dark" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <button onClick={() => navigate('/forgot-password')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 cursor-pointer">
          <ArrowLeft size={18} /><span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <KeyRound size={24} className="text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} readOnly={!!params.get('username')} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors" required />
          <input type="text" placeholder="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors" required />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors" required minLength={6} />
          <input type="password" placeholder="Confirm New Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors" required />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer mt-2 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
