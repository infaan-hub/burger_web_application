import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ShoppingCart } from 'lucide-react'
import { getFoods, getDrinks, getAuth } from '../api'

export default function Dashboard() {
  const navigate = useNavigate()
  const auth = getAuth()
  const [foods, setFoods] = useState([])
  const [drinks, setDrinks] = useState([])

  const goToOrder = (id) => {
    if (auth) navigate(`/order/${id}`)
    else navigate('/login')
  }

  useEffect(() => {
    getFoods().then(setFoods)
    getDrinks().then(setDrinks)
  }, [])

  return (
    <div className="bg-black min-h-screen pt-20">
      {/* FOODS */}
      <section className="relative overflow-hidden py-24 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/46660/46660-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">The Menu</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-4">Our Burgers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {foods.map((item) => (
              <div key={item.id} onClick={() => goToOrder(item.id)} className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer">
                <div className="w-full aspect-square rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${item.image_url}')` }} />
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-white/40 text-sm mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div>
                    <p className="text-amber-400 font-bold text-sm">TSh {Number(item.price_tsh || 0).toLocaleString()}</p>
                    <p className="text-white/30 text-xs">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className="text-white/30 text-xs">{item.calories} cal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRINKS */}
      <section className="relative overflow-hidden border-t border-white/5 py-24 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/47159/47159-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Refreshments</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-4">Our Drinks</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {drinks.map((item) => (
              <div key={item.id} onClick={() => goToOrder(item.id)} className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer">
                <div className="w-full aspect-square rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${item.image_url}')` }} />
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-white/40 text-sm mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div>
                    <p className="text-amber-400 font-bold text-sm">TSh {Number(item.price_tsh || 0).toLocaleString()}</p>
                    <p className="text-white/30 text-xs">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className="text-white/30 text-xs">{item.calories} cal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5 py-32 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/47191/47191-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
          <Flame size={32} className="text-amber-400 fill-amber-400" />
          <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">Ready to<br />indulge?</h2>
          <p className="text-white/50 text-lg max-w-lg leading-relaxed">
            Join us today and taste the burger that's redefining what a meal can be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => navigate(auth ? '/dashboard' : '/login')} className="px-10 py-4 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-amber-300 transition-colors cursor-pointer">
              Order Now
            </button>
            <button onClick={() => navigate('/contact')} className="px-10 py-4 border border-white/20 text-white/90 font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white/5 transition-colors cursor-pointer">
              Find Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
