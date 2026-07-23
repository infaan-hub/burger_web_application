import { X, LogIn, UserPlus, Mail, LogOut, LayoutDashboard, ShoppingBag, List, MessageSquare, ClipboardList, Settings, Beef, ChefHat, Users, House } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAuth, logout } from '../api'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const auth = getAuth()

  const handleClick = (to) => {
    onClose()
    navigate(to)
  }

  const handleLogout = () => {
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
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-dark border-l border-white/5 shadow-2xl transition-transform duration-300 ${
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

        <nav className="flex flex-col px-4 pt-6 gap-2 overflow-y-auto max-h-[calc(100vh-180px)]">
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
      </div>
    </>
  )
}
