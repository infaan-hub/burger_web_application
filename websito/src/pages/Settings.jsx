import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Save, Key, User, Mail, Image } from 'lucide-react'
import { getProfile, updateProfile, changePassword, getAuth } from '../api'

export default function Settings() {
  const navigate = useNavigate()
  const auth = getAuth()
  const [profile, setProfile] = useState({ display_name: '', email: '', avatar_url: '' })
  const [pw, setPw] = useState({ old_password: '', new_password: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!auth) { navigate('/login'); return }
    getProfile().then(setProfile).catch(() => {})
  }, [])

  const handleProfile = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setSaving(true)
    try {
      const data = await updateProfile(profile)
      setProfile(data)
      setMsg('Profile updated')
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault(); setErr(''); setMsg('')
    if (pw.new_password !== pw.confirm) { setErr('Passwords do not match'); return }
    try {
      const data = await changePassword(pw.old_password, pw.new_password)
      setMsg('Password changed')
      setPw({ old_password: '', new_password: '', confirm: '' })
    } catch (e) { setErr(e.message) }
  }

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm'

  return (
    <div className="pt-24 px-6 md:px-8 max-w-2xl mx-auto pb-16 text-white">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon size={24} className="text-amber-400" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {auth?.user?.avatar_url && (
        <div className="flex justify-center mb-6">
          <img src={auth.user.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-amber-400/50" />
        </div>
      )}

      {err && <p className="text-red-400 mb-4 text-sm">{err}</p>}
      {msg && <p className="text-green-400 mb-4 text-sm">{msg}</p>}

      {/* Profile */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={18} className="text-amber-400" /> Profile</h2>
        <form onSubmit={handleProfile} className="flex flex-col gap-3">
          <input placeholder="Username" value={profile.username || ''} disabled className={`${inputClass} opacity-50`} />
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-white/30" />
            <input type="email" placeholder="Email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <User size={16} className="text-white/30" />
            <input placeholder="Display Name" value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <Image size={16} className="text-white/30" />
            <input placeholder="Avatar URL" value={profile.avatar_url || ''} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} className={inputClass} />
          </div>
          <button disabled={saving} className="py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Key size={18} className="text-amber-400" /> Change Password</h2>
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <input type="password" placeholder="Current Password" value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} className={inputClass} required />
          <input type="password" placeholder="New Password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} className={inputClass} required minLength={6} />
          <input type="password" placeholder="Confirm New Password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={inputClass} required />
          <button className="py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">Change Password</button>
        </form>
      </div>
    </div>
  )
}
