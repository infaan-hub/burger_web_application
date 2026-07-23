import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Beef, MessageSquare, GlassWater, Pencil, Trash2, X, Check, Upload } from 'lucide-react'
import { getAdminDashboard, getAuth, adminAddFood, adminAddDrink, adminCreateUser, getAdminMenuItems, updateMenuItem, deleteMenuItem, uploadImage } from '../api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const auth = getAuth()
  const [menuItems, setMenuItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  const [food, setFood] = useState({ title: '', description: '', price: '', price_tsh: '', calories: '', image_url: '' })
  const [drink, setDrink] = useState({ title: '', description: '', price: '', price_tsh: '', calories: '', image_url: '' })
  const [userForm, setUserForm] = useState({ username: '', password: '' })
  const [uploadingFood, setUploadingFood] = useState(false)
  const [uploadingDrink, setUploadingDrink] = useState(false)

  const load = () => {
    if (!auth) { navigate('/admin/login'); return }
    getAdminDashboard().then(setData).catch(() => navigate('/admin/login'))
    getAdminMenuItems().then(setMenuItems).catch(() => {})
  }

  useEffect(load, [])

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const handleAddFood = async (e) => {
    e.preventDefault(); setError('')
    try {
      await adminAddFood({ ...food, price: food.price ? parseFloat(food.price) : 0, price_tsh: food.price_tsh ? parseInt(food.price_tsh) : 0, calories: food.calories ? parseInt(food.calories) : 0 })
      showMsg('Food added!'); setFood({ title: '', description: '', price: '', price_tsh: '', calories: '', image_url: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleAddDrink = async (e) => {
    e.preventDefault(); setError('')
    try {
      await adminAddDrink({ ...drink, price: drink.price ? parseFloat(drink.price) : 0, price_tsh: drink.price_tsh ? parseInt(drink.price_tsh) : 0, calories: drink.calories ? parseInt(drink.calories) : 0 })
      showMsg('Drink added!'); setDrink({ title: '', description: '', price: '', price_tsh: '', calories: '', image_url: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleAddUser = async (e) => {
    e.preventDefault(); setError('')
    try {
      await adminCreateUser(userForm)
      showMsg('User created!'); setUserForm({ username: '', password: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const startEdit = (item) => {
    setEditing(item.id)
    setEditForm({ title: item.title, description: item.description, price: item.price, price_tsh: item.price_tsh, calories: item.calories, image_url: item.image_url })
  }

  const saveEdit = async (id) => {
    try {
      await updateMenuItem(id, { ...editForm, price: editForm.price ? parseFloat(editForm.price) : 0, price_tsh: editForm.price_tsh ? parseInt(editForm.price_tsh) : 0, calories: editForm.calories ? parseInt(editForm.calories) : 0 })
      showMsg('Item updated'); setEditing(null); load()
    } catch (e) { setError(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await deleteMenuItem(id)
      showMsg('Item deleted'); load()
    } catch (e) { setError(e.message) }
  }

  const handleUploadFood = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingFood(true)
    try {
      const res = await uploadImage(file)
      if (res.url) setFood({ ...food, image_url: res.url })
    } catch (err) { setError(err.message) }
    finally { setUploadingFood(false) }
  }

  const handleUploadDrink = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingDrink(true)
    try {
      const res = await uploadImage(file)
      if (res.url) setDrink({ ...drink, image_url: res.url })
    } catch (err) { setError(err.message) }
    finally { setUploadingDrink(false) }
  }

  const update = (setter) => (field) => (e) => setter((prev) => ({ ...prev, [field]: e.target.value }))

  const cards = data ? [
    { icon: Users, label: 'Total Users', value: data.stats.total_users, color: 'text-blue-400' },
    { icon: Beef, label: 'Menu Items', value: data.stats.total_menu_items, color: 'text-amber-400' },
    { icon: MessageSquare, label: 'Messages', value: data.stats.total_messages, color: 'text-green-400' },
  ] : []

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm'

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://assets.mixkit.co/videos/48323/48323-720.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
      <div className="relative z-10 pt-24 px-6 md:px-8 max-w-7xl mx-auto pb-16 text-white">
      <h2 className="text-3xl font-bold mb-2">Welcome, {auth?.user?.username}</h2>
      <p className="text-white/40 mb-10">Burger Supreme administration panel</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {msg && <p className="text-green-400 mb-4">{msg}</p>}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <Icon size={32} className={color} />
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-amber-400" /> Add User</h3>
          <form onSubmit={handleAddUser} className="flex flex-col gap-3">
            <input placeholder="Username" value={userForm.username} onChange={update(setUserForm)('username')} className={inputClass} required />
            <input type="password" placeholder="Password" value={userForm.password} onChange={update(setUserForm)('password')} className={inputClass} required />
            <button className="py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">Create</button>
          </form>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Beef size={18} className="text-amber-400" /> Add Food</h3>
          <form onSubmit={handleAddFood} className="flex flex-col gap-3">
            <input placeholder="Title" value={food.title} onChange={update(setFood)('title')} className={inputClass} required />
            <input placeholder="Description" value={food.description} onChange={update(setFood)('description')} className={inputClass} required />
            <div className="flex gap-3">
              <input type="number" step="0.01" placeholder="Price $" value={food.price} onChange={update(setFood)('price')} className={inputClass} required />
              <input type="number" placeholder="Price TSh" value={food.price_tsh} onChange={update(setFood)('price_tsh')} className={inputClass} required />
              <input type="number" placeholder="Calories" value={food.calories} onChange={update(setFood)('calories')} className={inputClass} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-24 rounded-xl bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url('${food.image_url || ''}')`, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                {!food.image_url && <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">No image</div>}
                {food.image_url && (
                  <button type="button" onClick={() => setFood({ ...food, image_url: '' })} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white/70 flex items-center justify-center text-xs hover:bg-black/70 cursor-pointer">&times;</button>
                )}
              </div>
              <label className="shrink-0 flex flex-col items-center justify-center gap-1 px-5 bg-amber-400/10 border border-amber-400/30 rounded-xl cursor-pointer hover:bg-amber-400/20 transition-colors">
                <Upload size={20} className="text-amber-400" />
                <span className="text-xs text-amber-400 font-semibold whitespace-nowrap">{uploadingFood ? '...' : 'JPG'}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleUploadFood} className="hidden" />
              </label>
            </div>
            <button className="py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">Add Food</button>
          </form>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><GlassWater size={18} className="text-amber-400" /> Add Drink</h3>
          <form onSubmit={handleAddDrink} className="flex flex-col gap-3">
            <input placeholder="Title" value={drink.title} onChange={update(setDrink)('title')} className={inputClass} required />
            <input placeholder="Description" value={drink.description} onChange={update(setDrink)('description')} className={inputClass} required />
            <div className="flex gap-3">
              <input type="number" step="0.01" placeholder="Price $" value={drink.price} onChange={update(setDrink)('price')} className={inputClass} required />
              <input type="number" placeholder="Price TSh" value={drink.price_tsh} onChange={update(setDrink)('price_tsh')} className={inputClass} required />
              <input type="number" placeholder="Calories" value={drink.calories} onChange={update(setDrink)('calories')} className={inputClass} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-24 rounded-xl bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url('${drink.image_url || ''}')`, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                {!drink.image_url && <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">No image</div>}
                {drink.image_url && (
                  <button type="button" onClick={() => setDrink({ ...drink, image_url: '' })} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white/70 flex items-center justify-center text-xs hover:bg-black/70 cursor-pointer">&times;</button>
                )}
              </div>
              <label className="shrink-0 flex flex-col items-center justify-center gap-1 px-5 bg-amber-400/10 border border-amber-400/30 rounded-xl cursor-pointer hover:bg-amber-400/20 transition-colors">
                <Upload size={20} className="text-amber-400" />
                <span className="text-xs text-amber-400 font-semibold whitespace-nowrap">{uploadingDrink ? '...' : 'JPG'}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleUploadDrink} className="hidden" />
              </label>
            </div>
            <button className="py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">Add Drink</button>
          </form>
        </div>
      </div>

      {/* All Menu Items */}
      <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">All Menu Items</h2>
      <div className="space-y-3">
        {menuItems.map((item) => {
          const isEditing = editing === item.id
          return (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'}')` }} />
              {isEditing ? (
                <>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2">
                    <input value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className={inputClass} placeholder="Title" />
                    <input value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className={`${inputClass} md:col-span-2`} placeholder="Description" />
                    <input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className={inputClass} placeholder="Price $" />
                    <input type="number" value={editForm.price_tsh} onChange={(e) => setEditForm({...editForm, price_tsh: e.target.value})} className={inputClass} placeholder="Price TSh" />
                    <input type="number" value={editForm.calories} onChange={(e) => setEditForm({...editForm, calories: e.target.value})} className={inputClass} placeholder="Cal" />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => saveEdit(item.id)} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer"><Check size={16} /></button>
                    <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 cursor-pointer"><X size={16} /></button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.category === 'food' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{item.category}</span>
                      <p className="font-semibold truncate">{item.title}</p>
                    </div>
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
        })}
      </div>
      </div>
    </div>
  )
}
