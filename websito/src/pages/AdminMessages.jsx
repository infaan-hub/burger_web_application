import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Trash2 } from 'lucide-react'
import { getContactMessages, getAuth, del } from '../api'

export default function AdminMessages() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])

  const load = () => {
    if (!getAuth()) { navigate('/admin/login'); return }
    getContactMessages().then(setMessages).catch(() => navigate('/admin/login'))
  }

  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await del(`/contact/messages/?id=${id}`)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="pt-24 px-6 md:px-8 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare size={24} className="text-amber-400" />
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>
      {messages.length === 0 ? (
        <p className="text-white/30">No messages yet</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{msg.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-xs">{new Date(msg.created_at).toLocaleString()}</span>
                  <button onClick={() => handleDelete(msg.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-white/50 text-sm">{msg.email}</p>
              <p className="text-white/70 mt-2">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
