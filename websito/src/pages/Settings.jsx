import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Save, Key, User, Mail, Image, Bell, BellOff } from 'lucide-react'
import { getProfile, updateProfile, changePassword, getAuth } from '../api'
import { isPushSupported, getPermissionState, requestPermission, initPush, subscribe, unsubscribe } from '../services/push'

export default function Settings() {
  const navigate = useNavigate()
  const auth = getAuth()
  const [profile, setProfile] = useState({ display_name: '', email: '', avatar_url: '' })
  const [pw, setPw] = useState({ old_password: '', new_password: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [pushStatus, setPushStatus] = useState('unsupported')
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    if (!auth) { navigate('/login'); return }
    getProfile().then(setProfile).catch(() => {})
    if (isPushSupported()) {
      getPermissionState().then(setPushStatus)
    }
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

  const handleEnablePush = async () => {
    setPushLoading(true)
    try {
      const result = await requestPermission()
      if (result === 'granted') {
        await initPush()
        await subscribe()
        setPushStatus('granted')
        setMsg('Notifications enabled')
      } else {
        setPushStatus(result)
        if (result === 'denied') setErr('Notification permission was denied')
      }
    } catch (e) { setErr(e.message) }
    finally { setPushLoading(false) }
  }

  const handleDisablePush = async () => {
    setPushLoading(true)
    try {
      await unsubscribe()
      setPushStatus('denied')
      setMsg('Notifications disabled')
    } catch (e) { setErr(e.message) }
    finally { setPushLoading(false) }
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

      {/* Notifications */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Bell size={18} className="text-amber-400" /> Notifications</h2>
        {!isPushSupported() ? (
          <p className="text-white/40 text-sm">Push notifications are not supported in this browser.</p>
        ) : pushStatus === 'granted' ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-semibold">Notifications enabled</p>
              <p className="text-white/40 text-xs mt-1">You will receive booking updates and alerts.</p>
            </div>
            <button
              onClick={handleDisablePush}
              disabled={pushLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded-xl hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <BellOff size={14} />
              Disable
            </button>
          </div>
        ) : pushStatus === 'denied' ? (
          <p className="text-white/40 text-sm">Notifications were blocked. Please enable them in your browser settings.</p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Notifications are off</p>
              <p className="text-white/40 text-xs mt-1">Enable to receive real-time booking updates.</p>
            </div>
            <button
              onClick={handleEnablePush}
              disabled={pushLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black text-sm font-bold rounded-xl hover:bg-amber-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Bell size={14} />
              {pushLoading ? 'Enabling...' : 'Enable'}
            </button>
          </div>
        )}
      </div>

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
            {profile.avatar_url?.includes('googleusercontent.com') ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl w-full">
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                <span className="text-white/50 text-sm">Powered by Google</span>
              </div>
            ) : (
              <input placeholder="Avatar URL" value={profile.avatar_url || ''} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} className={inputClass} />
            )}
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
