import { useState, useEffect, useCallback } from 'react'
import { X, LogIn, UserPlus, Mail, LogOut, LayoutDashboard, ShoppingBag, List, MessageSquare, ClipboardList, Settings, Beef, ChefHat, Users, House, Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAuth, logout, getNotifications, getUnreadCount, markNotificationsRead, deleteNotification } from '../api'
import { disconnect } from '../services/websocket'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const auth = getAuth()
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const loadCounts = useCallback(async () => {
    if (!auth) return
    try {
      const data = await getUnreadCount()
      setUnreadCount(data.unread_count || 0)
    } catch {}
  }, [auth])

  const loadNotifications = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {}
    setLoading(false)
  }, [auth])

  useEffect(() => {
    if (!auth) return
    loadCounts()
    const interval = setInterval(loadCounts, 8000)
    return () => clearInterval(interval)
  }, [auth, loadCounts])

  useEffect(() => {
    if (showNotifs && auth) loadNotifications()
  }, [showNotifs, auth, loadNotifications])

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(notifications.map(n => n.id)))
    }
  }

  const handleMarkSelectedRead = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    if (ids.length === notifications.length) {
      await markNotificationsRead()
    } else {
      for (const id of ids) await markNotificationsRead(id)
    }
    setNotifications(prev => prev.map(n => selected.has(n.id) ? { ...n, read: true } : n))
    setUnreadCount(prev => {
      const readCount = notifications.filter(n => selected.has(n.id) && !n.read).length
      return Math.max(0, prev - readCount)
    })
    setSelected(new Set())
  }

  const handleDeleteSelected = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    for (const id of ids) await deleteNotification(id)
    setNotifications(prev => prev.filter(n => !selected.has(n.id)))
    setUnreadCount(prev => {
      const readCount = notifications.filter(n => selected.has(n.id) && !n.read).length
      return Math.max(0, prev - readCount)
    })
    setSelected(new Set())
  }

  const handleClick = (to) => {
    onClose()
    navigate(to)
  }

  const handleLogout = () => {
    disconnect()
    logout()
    onClose()
    navigate('/')
  }

  const isAdmin = auth?.user?.is_staff

  const homeLink = { label: 'Home', icon: House, to: '/' }
  const links = !auth
    ? [
        homeLink,
        { label: 'Login', icon: LogIn, to: '/login' },
        { label: 'Register', icon: UserPlus, to: '/register' },
        { label: 'Menu List', icon: List, to: '/menu-list' },
        { label: 'Contact', icon: Mail, to: '/contact' },
      ]
    : isAdmin
    ? [
        homeLink,
        { label: 'Dashboard', icon: ChefHat, to: '/admin/dashboard' },
        { label: 'Messages', icon: MessageSquare, to: '/admin/messages' },
        { label: 'Orders', icon: ClipboardList, to: '/admin/orders' },
        { label: 'Menu List', icon: Beef, to: '/admin/menu-list' },
        { label: 'Users', icon: Users, to: '/admin/users' },
        { label: 'Settings', icon: Settings, to: '/admin/settings' },
        { label: 'Logout', icon: LogOut, action: handleLogout },
      ]
    : [
        homeLink,
        { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
        { label: 'Order', icon: ShoppingBag, to: '/order' },
        { label: 'Menu List', icon: List, to: '/menu-list' },
        { label: 'Contact', icon: Mail, to: '/contact' },
        { label: 'Settings', icon: Settings, to: '/settings' },
        { label: 'Logout', icon: LogOut, action: handleLogout },
      ]

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-dark border-l border-white/5 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <span className="text-white/50 text-xs uppercase tracking-widest">Menu</span>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {auth && (
          <div className="px-6 pt-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-3">
              {auth.user?.avatar_url ? (
                <img src={auth.user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {auth.user.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">Logged in as</p>
                <p className="text-white font-medium text-sm">{auth.user.display_name || auth.user.username}</p>
              </div>
            </div>
          </div>
        )}

        {!showNotifs ? (
          <nav className="flex flex-col px-4 pt-6 gap-2 overflow-y-auto max-h-[calc(100vh-180px)]">
            {auth && (
              <button
                onClick={() => { setShowNotifs(true); loadNotifications() }}
                className="flex items-center gap-4 w-full px-4 py-3.5 text-sm text-white/80 uppercase tracking-widest rounded-xl hover:bg-white/5 hover:text-amber-400 transition-all duration-200 cursor-pointer"
              >
                <div className="relative shrink-0">
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-amber-400 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                Notifications
              </button>
            )}
            {links.map(({ label, icon: Icon, to, action }) => (
              <button
                key={label}
                onClick={() => (action ? action() : handleClick(to))}
                className="flex items-center gap-4 w-full px-4 py-3.5 text-sm text-white/80 uppercase tracking-widest rounded-xl hover:bg-white/5 hover:text-amber-400 transition-all duration-200 cursor-pointer"
              >
                <Icon size={16} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="flex flex-col h-[calc(100vh-60px)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <button onClick={() => setShowNotifs(false)} className="text-white/50 hover:text-white text-xs uppercase tracking-widest cursor-pointer">
                ← Back
              </button>
              <span className="text-white/50 text-xs uppercase tracking-widest">Notifications</span>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                <button
                  onClick={toggleSelectAll}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selected.size === notifications.length && notifications.length > 0
                      ? 'bg-amber-400/20 text-amber-400'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    selected.size === notifications.length && notifications.length > 0
                      ? 'bg-amber-400 border-amber-400'
                      : 'border-white/30'
                  }`}>
                    {selected.size === notifications.length && notifications.length > 0 && <Check size={10} className="text-black" />}
                  </div>
                  Select all
                </button>
                {selected.size > 0 && (
                  <>
                    <button onClick={handleMarkSelectedRead} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-green-400 hover:bg-green-400/10 transition-colors cursor-pointer">
                      <CheckCheck size={12} /> Read
                    </button>
                    <button onClick={handleDeleteSelected} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer">
                      <Trash2 size={12} /> Delete
                    </button>
                    <span className="text-white/30 text-[10px] ml-auto">{selected.size} selected</span>
                  </>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loading && notifications.length === 0 && (
                <p className="text-white/30 text-sm text-center py-6">Loading...</p>
              )}
              {!loading && notifications.length === 0 && (
                <p className="text-white/30 text-sm text-center py-6">No notifications</p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-amber-400/5' : ''}`}
                >
                  <button
                    onClick={() => toggleSelect(n.id)}
                    className="shrink-0 mt-0.5 cursor-pointer"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                      selected.has(n.id)
                        ? 'bg-amber-400 border-amber-400'
                        : 'border-white/30 hover:border-white/50'
                    }`}>
                      {selected.has(n.id) && <Check size={10} className="text-black" />}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                      <p className="text-white/90 text-sm font-medium truncate">{n.title}</p>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-white/30 text-[10px] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={async () => {
                          await markNotificationsRead(n.id)
                          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
                          setUnreadCount(prev => Math.max(0, prev - 1))
                        }}
                        className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-green-400 cursor-pointer"
                        title="Mark read"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await deleteNotification(n.id)
                        setNotifications(prev => prev.filter(x => x.id !== n.id))
                        if (!n.read) setUnreadCount(prev => Math.max(0, prev - 1))
                        setSelected(prev => { const s = new Set(prev); s.delete(n.id); return s })
                      }}
                      className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
