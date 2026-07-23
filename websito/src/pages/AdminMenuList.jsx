import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, X, Check, Beef, GlassWater } from 'lucide-react'
import { getAdminMenuItems, updateMenuItem, deleteMenuItem, getAuth } from '../api'

export default function AdminMenuList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!getAuth()) { navigate('/admin/login'); return }
    load()
  }, [])

  const load = () => getAdminMenuItems().then(setItems).catch(() => navigate('/admin/login'))

  const startEdit = (item) => {
    setEditing(item.id)
    setForm({ title: item.title, description: item.description, price: item.price, price_tsh: item.price_tsh, calories: item.calories, image_url: item.image_url })
  }

  const cancelEdit = () => { setEditing(null); setForm({}) }

  const saveEdit = async (id) => {
    try {
      await updateMenuItem(id, { ...form, price: form.price ? parseFloat(form.price) : 0, price_tsh: form.price_tsh ? parseInt(form.price_tsh) : 0, calories: form.calories ? parseInt(form.calories) : 0 })
      setMsg('Item updated')
      setEditing(null)
      load()
    } catch (e) { setMsg(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await deleteMenuItem(id)
      setMsg('Item deleted')
      load()
    } catch (e) { setMsg(e.message) }
  }

  const inputClass = 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400/50'

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://assets.mixkit.co/videos/48323/48323-720.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />

      <div className="relative z-10 pt-24 px-6 md:px-8 pb-16 max-w-6xl mx-auto text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Admin</span>
            <h1 className="text-3xl font-bold mt-1">Menu List</h1>
          </div>
        </div>

        {msg && <p className="text-sm mb-4 text-green-400">{msg}</p>}

        {/* Foods */}
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Beef size={20} /> Food</h2>
        <div className="space-y-3 mb-10">
          {items.filter(i => i.category === 'food').map(item => renderItem(item))}
        </div>

        {/* Drinks */}
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><GlassWater size={20} /> Drinks</h2>
        <div className="space-y-3">
          {items.filter(i => i.category === 'drink').map(item => renderItem(item))}
        </div>
      </div>
    </div>
  )

  function renderItem(item) {
    const isEditing = editing === item.id
    return (
      <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5">
        <div className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'}')` }} />
        {isEditing ? (
          <>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Title" />
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`${inputClass} md:col-span-2`} placeholder="Description" />
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className={inputClass} placeholder="Price $" />
              <input type="number" value={form.price_tsh} onChange={e => setForm({...form, price_tsh: e.target.value})} className={inputClass} placeholder="Price TSh" />
              <input type="number" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} className={inputClass} placeholder="Cal" />
              <div className="md:col-span-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${form.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'}')` }} />
                <span className="text-white/40 text-xs truncate">{form.image_url || 'No image'}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => saveEdit(item.id)} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer"><Check size={16} /></button>
              <button onClick={cancelEdit} className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 cursor-pointer"><X size={16} /></button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p className="text-white/40 text-sm truncate">{item.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-amber-400 font-bold text-sm">TSh {Number(item.price_tsh || 0).toLocaleString()}</p>
              <p className="text-white/30 text-xs">${parseFloat(item.price).toFixed(2)}</p>
              <p className="text-white/30 text-xs mt-1">{item.calories} cal</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(item)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer"><Trash2 size={16} /></button>
            </div>
          </>
        )}
      </div>
    )
  }
}
