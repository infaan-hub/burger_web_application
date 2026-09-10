import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { getNotifications, getUnreadCount, markNotificationsRead, deleteNotification, getAuth } from '../api'

let notifAudio = null
function playNotifSound() {
  try {
    if (!notifAudio) {
      notifAudio = new Audio('/notification.mp3')
      notifAudio.volume = 0.5
    }
    notifAudio.currentTime = 0
    notifAudio.play().catch(() => {})
  } catch {}
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)
  const auth = getAuth()
  const lastCount = useRef(0)

  const loadCounts = useCallback(async () => {
    if (!auth) return
    try {
      const data = await getUnreadCount()
      const c = data.unread_count || 0
      if (c > lastCount.current) {
        playNotifSound()
      }
      lastCount.current = c
      setUnreadCount(c)
    } catch {}
  }, [auth])

  useEffect(() => {
    if (!auth) return
    loadCounts()
    const interval = setInterval(loadCounts, 5000)
    return () => clearInterval(interval)
  }, [auth, loadCounts])

  useEffect(() => {
    if (!open || !auth) return
    setLoading(true)
    getNotifications()
      .then(data => setNotifications(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, auth])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleMarkRead = async (id) => {
    await markNotificationsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    lastCount.current = Math.max(0, lastCount.current - 1)
  }

  const handleMarkAllRead = async () => {
    await markNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    lastCount.current = 0
  }

  const handleDelete = async (id) => {
    const n = notifications.find(x => x.id === id)
    await deleteNotification(id)
    setNotifications(prev => prev.filter(x => x.id !== id))
    if (n && !n.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
      lastCount.current = Math.max(0, lastCount.current - 1)
    }
  }

  const handleClick = (notif) => {
    if (!notif.read) handleMarkRead(notif.id)
    if (notif.link) window.location.href = notif.link
    setOpen(false)
  }

  if (!auth) return null

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-amber-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-2xl bg-[#111] border border-white/10 shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-amber-400 text-xs hover:underline cursor-pointer">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-80">
            {loading && notifications.length === 0 && (
              <p className="text-white/30 text-sm text-center py-6">Loading...</p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="text-white/30 text-sm text-center py-6">No notifications yet</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-amber-400/5' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleClick(n)}>
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                      <p className="text-white/90 text-sm font-medium truncate">{n.title}</p>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-white/30 text-[10px] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-green-400 cursor-pointer" title="Mark read">
                        <Check size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 cursor-pointer" title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
