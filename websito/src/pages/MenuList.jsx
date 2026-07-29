import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMenu, getAuth } from '../api'

import BackgroundVideo from '../components/BackgroundVideo'
export default function MenuList() {
  const navigate = useNavigate()
  const auth = getAuth()
  const [items, setItems] = useState([])

  const goToOrder = (id) => {
    if (auth) navigate(`/order/${id}`)
    else navigate('/login')
  }

  useEffect(() => {
    getMenu().then(setItems)
  }, [])

  const foods = items.filter((i) => i.category === 'food')
  const drinks = items.filter((i) => i.category === 'drink')

  return (
    <div className="relative min-h-screen bg-black text-white pt-24 pb-16 overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Full Menu</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">Burger Supreme</h1>
        </div>

        {/* Foods */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-amber-400 mb-6 border-b border-white/10 pb-3">Food</h2>
          <div className="space-y-4">
            {foods.map((item) => (
              <div key={item.id} onClick={() => goToOrder(item.id)} className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.image_url}')` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-white/40 text-sm truncate">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-400 font-bold text-sm">TSh {Number(item.price_tsh || 0).toLocaleString()}</p>
                  <p className="text-white/30 text-xs">${parseFloat(item.price).toFixed(2)}</p>
                  <p className="text-white/30 text-xs mt-1">{item.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drinks */}
        <div>
          <h2 className="text-2xl font-bold text-amber-400 mb-6 border-b border-white/10 pb-3">Drinks</h2>
          <div className="space-y-4">
            {drinks.map((item) => (
              <div key={item.id} onClick={() => goToOrder(item.id)} className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.image_url}')` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-white/40 text-sm truncate">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-400 font-bold text-sm">TSh {Number(item.price_tsh || 0).toLocaleString()}</p>
                  <p className="text-white/30 text-xs">${parseFloat(item.price).toFixed(2)}</p>
                  <p className="text-white/30 text-xs mt-1">{item.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
