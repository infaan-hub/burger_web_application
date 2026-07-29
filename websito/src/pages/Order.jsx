import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Minus, Plus, MapPin, Navigation, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import { getMenuItem, placeOrder, getProfile, getAuth, getMyOrders, cancelOrder } from '../api'

import BackgroundVideo from '../components/BackgroundVideo'
export default function Order() {
  const { id } = useParams()
  const navigate = useNavigate()
  const auth = getAuth()

  const [item, setItem] = useState(null)
  const [qty, setQty] = useState(1)
  const [profile, setProfile] = useState(null)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [locating, setLocating] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders()
      setOrders(data)
    } catch {}
  }

  useEffect(() => {
    if (!auth) { navigate('/login'); return }
    if (!id) {
      fetchOrders().then(() => setLoading(false))
      return
    }
    Promise.all([
      getMenuItem(id).catch(() => { navigate('/dashboard'); return null }),
      getProfile().catch(() => null),
      getMyOrders().catch(() => []),
    ]).then(([itemData, profileData, ordersData]) => {
      if (itemData) setItem(itemData)
      if (profileData) {
        setProfile(profileData)
        setPhone(profileData.phone || '')
        setAddress(profileData.address || '')
      }
      if (ordersData) setOrders(ordersData)
      setLoading(false)
    })
  }, [id])

  const handleCancel = async (orderId) => {
    setCancelling(orderId)
    try {
      await cancelOrder(orderId)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    } catch (err) {
      setError(err.message || 'Cancel failed')
    } finally {
      setCancelling(null)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocating(false) },
      () => { setError('Could not get location'); setLocating(false) },
      { enableHighAccuracy: true }
    )
  }

  const handleOrder = async () => {
    if (!item) return
    setPlacing(true)
    setError('')
    try {
      await placeOrder({
        items_data: [{ item_id: item.id, quantity: qty }],
        delivery_address: address,
        delivery_lat: lat,
        delivery_lng: lng,
        phone: phone,
        notes: notes,
      })
      await fetchOrders()
      setDone(true)
    } catch (err) {
      setError(err.message || 'Order failed')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-20">
      <div className="text-amber-400 text-lg">Loading...</div>
    </div>
  )

  if (!id) return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
      <div className="relative z-10 pt-24 pb-16 px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag size={24} className="text-amber-400" />
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 mb-6">No orders yet</p>
              <button onClick={() => navigate('/menu-list')} className="px-8 py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-amber-300 transition-colors cursor-pointer">
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-sm">Order #{order.id}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        order.status === 'order_complete' ? 'bg-green-500/20 text-green-400 line-through decoration-white' :
                        order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'preparing' ? 'bg-purple-500/20 text-purple-400' :
                        order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{order.status === 'order_complete' ? 'Order Complete' : order.status}</span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelling === order.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          {cancelling === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                  {order.order_items.map((oi) => (
                    <div key={oi.id} className="flex items-center gap-3 py-2 border-t border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${oi.item_image}')` }} />
                      <span className="flex-1 text-white/70">{oi.item_title} x{oi.quantity}</span>
                      <span className="text-amber-400 font-bold">${parseFloat(oi.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="text-right mt-3 pt-3 border-t border-white/5">
                    <span className="text-lg font-bold text-amber-400">Total: ${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (done) return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
      <div className="relative z-10 py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Thank You!</h1>
          <p className="text-white/60 text-lg max-w-md mx-auto mb-8">Your order has been placed successfully. We'll start preparing it right away!</p>
          <button onClick={() => navigate('/order')} className="px-8 py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-amber-300 transition-colors cursor-pointer">
            My Orders
          </button>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Orders</h2>
          {orders.length === 0 ? (
            <p className="text-white/30 text-center">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-sm">Order #{order.id}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        order.status === 'order_complete' ? 'bg-green-500/20 text-green-400 line-through decoration-white' :
                        order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'preparing' ? 'bg-purple-500/20 text-purple-400' :
                        order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{order.status === 'order_complete' ? 'Order Complete' : order.status}</span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelling === order.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          {cancelling === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                  {order.order_items.map((oi) => (
                    <div key={oi.id} className="flex items-center gap-3 py-2 border-t border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${oi.item_image}')` }} />
                      <span className="flex-1 text-white/70">{oi.item_title} x{oi.quantity}</span>
                      <span className="text-amber-400 font-bold">${parseFloat(oi.price).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="text-right mt-3 pt-3 border-t border-white/5">
                    <span className="text-lg font-bold text-amber-400">Total: ${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const mapUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null
  const tshTotal = item.price_tsh ? parseInt(item.price_tsh) * qty : 0

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />

      <div className="relative z-10 pt-24 pb-16 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left — Item Preview */}
            <div>
              <div className="w-full aspect-square rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url('${item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'}')` }} />
              <h1 className="text-3xl font-bold text-white mt-6">{item.title}</h1>
              <p className="text-white/50 mt-2">{item.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-white/40 text-sm">{item.calories} cal</span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-amber-400">TSh {Number(item.price_tsh || 0).toLocaleString()}</p>
                <p className="text-white/40 text-lg">${parseFloat(item.price).toFixed(2)}</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mt-8">
                <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 cursor-pointer">
                    <Minus size={16} className="text-white" />
                  </button>
                  <span className="text-2xl font-bold text-white w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center hover:bg-amber-300 cursor-pointer">
                    <Plus size={16} className="text-black" />
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Total ({qty}x)</span>
                  <span className="text-amber-400 font-bold">TSh {tshTotal.toLocaleString()} (${(parseFloat(item.price) * qty).toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Right — Order Form */}
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <h2 className="text-lg font-bold text-white mb-4">Contact Info</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Name</label>
                    <input value={profile?.username || ''} readOnly className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Phone</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 xxx xxx xxx" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 text-sm" />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <h2 className="text-lg font-bold text-white mb-4">Delivery Address</h2>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={useCurrentLocation} disabled={locating} className="flex items-center gap-2 px-4 py-3 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400 text-sm font-semibold hover:bg-amber-400/20 transition-colors cursor-pointer disabled:opacity-50">
                      <Navigation size={16} />
                      {locating ? 'Getting location...' : 'Use Current Location'}
                    </button>
                  </div>
                  {lat && lng && (
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <MapPin size={14} />
                      <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                      {mapUrl && (
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline ml-2">View on Map</a>
                      )}
                    </div>
                  )}
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, building, landmark..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 text-sm resize-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <h2 className="text-lg font-bold text-white mb-4">Order Notes</h2>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requests..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 text-sm resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleOrder}
                disabled={placing || !address}
                className="w-full py-4 bg-amber-400 text-black font-bold text-base uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
