import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Trash2, Ban, CheckCircle, XCircle, Shield, ShieldOff } from 'lucide-react'
import { getAdminUsers, deleteAdminUser, updateAdminUser, getAuth } from '../api'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAuth()) { navigate('/admin/login'); return }
    load()
  }, [])

  const load = () => getAdminUsers().then(setUsers).catch(() => navigate('/admin/login'))

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete user "${username}"?`)) return
    try {
      await deleteAdminUser(id)
      showMsg(`User "${username}" deleted`)
      load()
    } catch (e) { setError(e.message) }
  }

  const handleToggleActive = async (u) => {
    try {
      await updateAdminUser(u.id, { is_active: !u.is_active })
      showMsg(`User "${u.username}" ${u.is_active ? 'blocked' : 'unblocked'}`)
      load()
    } catch (e) { setError(e.message) }
  }

  const handleToggleStaff = async (u) => {
    try {
      await updateAdminUser(u.id, { is_staff: !u.is_staff })
      showMsg(`User "${u.username}" is ${u.is_staff ? 'no longer' : 'now'} staff`)
      load()
    } catch (e) { setError(e.message) }
  }

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm'

  return (
    <div className="pt-24 px-6 md:px-8 max-w-7xl mx-auto pb-16 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Users size={24} className="text-amber-400" />
        <h2 className="text-3xl font-bold">User Management</h2>
      </div>
      <p className="text-white/40 mb-10">View, block, or delete users</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {msg && <p className="text-green-400 mb-4">{msg}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
              <th className="text-left py-4 px-3">Username</th>
              <th className="text-left py-4 px-3">Email</th>
              <th className="text-center py-4 px-3">Active</th>
              <th className="text-center py-4 px-3">Staff</th>
              <th className="text-right py-4 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{u.display_name || u.username}</span>
                  </div>
                </td>
                <td className="py-4 px-3 text-white/60">{u.email || '—'}</td>
                <td className="py-4 px-3 text-center">
                  {u.is_active ? (
                    <CheckCircle size={16} className="text-green-400 inline" />
                  ) : (
                    <XCircle size={16} className="text-red-400 inline" />
                  )}
                </td>
                <td className="py-4 px-3 text-center">
                  {u.is_staff ? (
                    <Shield size={16} className="text-amber-400 inline" />
                  ) : (
                    <ShieldOff size={16} className="text-white/30 inline" />
                  )}
                </td>
                <td className="py-4 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`p-2 rounded-lg cursor-pointer ${
                        u.is_active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                      title={u.is_active ? 'Block' : 'Unblock'}
                    >
                      <Ban size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStaff(u)}
                      className={`p-2 rounded-lg cursor-pointer ${
                        u.is_staff ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                      title={u.is_staff ? 'Remove staff' : 'Make staff'}
                    >
                      <Shield size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-white/40 text-center py-12">No users found.</p>
      )}
    </div>
  )
}
