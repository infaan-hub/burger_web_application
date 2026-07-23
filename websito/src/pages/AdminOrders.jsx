import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Trash2, CheckCircle } from 'lucide-react'
import { getAllOrders, getAuth, updateOrderStatus, deleteOrder } from '../api'

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled', 'order_complete']

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!getAuth()) { navigate('/admin/login'); return }
    getAllOrders().then(setOrders).catch(() => navigate('/admin/login'))
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const updated = await updateOrderStatus(orderId, { status: newStatus })
      setOrders(orders.map(o => o.id === orderId ? updated : o))
    } catch (err) {
      alert(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('Delete this order permanently?')) return
    try {
      await deleteOrder(orderId)
      setOrders(orders.filter(o => o.id !== orderId))
    } catch (err) {
      alert(err.message || 'Failed to delete order')
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://assets.mixkit.co/videos/48323/48323-720.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
      <div className="relative z-10 pt-24 px-6 md:px-8 max-w-5xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={24} className="text-amber-400" />
        <h1 className="text-3xl font-bold">All Orders</h1>
      </div>
        {orders.length === 0 ? (
          <p className="text-white/30">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-sm">Order #{order.id}</span>
                    <span className="text-white/30 text-xs">by {order.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">Pending</span>
                    )}
                    {order.status === 'confirmed' && (
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">Confirmed</span>
                    )}
                    {order.status === 'preparing' && (
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold">Preparing</span>
                    )}
                    {order.status === 'ready' && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Ready</span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Delivered</span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">Cancelled</span>
                    )}
                    {order.status === 'order_complete' && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold line-through decoration-white">Complete</span>
                    )}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/50 cursor-pointer disabled:opacity-50"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s} className="bg-black">{s === 'order_complete' ? 'Order Complete' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Delete order"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {order.order_items.map((oi) => (
                  <div key={oi.id} className="flex items-center gap-3 py-2 border-t border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${oi.item_image}')` }} />
                    <span className="flex-1 text-white/70">{oi.item_title} x{oi.quantity}</span>
                    <span className="text-amber-400 font-bold">${parseFloat(oi.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="text-white/40 text-xs">
                    <p>{order.delivery_address && `📍 ${order.delivery_address}`}</p>
                    <p>{order.phone && `📞 ${order.phone}`}</p>
                    {order.notes && <p>📝 {order.notes}</p>}
                  </div>
                  <span className="text-lg font-bold text-amber-400">Total: ${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
