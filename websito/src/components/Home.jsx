import { Flame, ChevronDown, Beef, Wheat, Sparkles, Star, ArrowRight, Cherry, Coffee, CupSoda, Drumstick, Croissant, Droplets, Sandwich, Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFoods, getDrinks, getIngredients, getAuth } from '../api'

const iconMap = { Beef, Wheat, Sparkles, Cherry, Coffee, CupSoda, Drumstick, Croissant, Droplets, Sandwich, Cookie, Flame }

function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'all')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem('cookie_consent', 'necessary')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie size={20} className="text-amber-400" />
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Your privacy matters</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. You can choose which cookies you allow.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button onClick={accept} className="px-6 py-2.5 bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap">
                  Accept All
                </button>
                <button onClick={reject} className="px-6 py-2.5 border border-white/20 text-white/80 font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap">
                  Reject Non-Essential
                </button>
                <button onClick={reject} className="px-6 py-2.5 text-white/40 text-xs uppercase tracking-wider hover:text-white/60 transition-colors cursor-pointer whitespace-nowrap">
                  Cookie Settings
                </button>
              </div>
            </div>
            <button onClick={reject} className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors cursor-pointer md:hidden">
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const auth = getAuth()
  const [scrolled, setScrolled] = useState(false)
  const [foods, setFoods] = useState([])
  const [drinks, setDrinks] = useState([])
  const [ingredients, setIngredients] = useState([])

  const goToOrder = (id) => {
    if (auth) navigate(`/order/${id}`)
    else navigate('/login')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    getFoods().then(setFoods).catch(() => {})
    getDrinks().then(setDrinks).catch(() => {})
    getIngredients().then(setIngredients).catch(() => {})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <CookieConsent />
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-dark">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/48323/48323-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-20">
          <div className="flex flex-col items-center lg:items-start gap-6 max-w-2xl">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">
                <Flame size={14} className="fill-amber-400" />
                Signature Burger
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight">
                Burger<br />Supreme
              </h1>
              <p className="text-white/60 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                Double smashed patties, aged cheddar, crispy bacon, house sauce stacked to perfection.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button onClick={() => navigate(auth ? '/dashboard' : '/login')} className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-amber-300 transition-colors cursor-pointer">
                  Order Now
                </button>
                <button onClick={() => navigate('/menu-list')} className="w-full sm:w-auto px-8 py-3.5 border border-white/20 text-white/90 font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white/5 transition-colors cursor-pointer">
                  View Menu
                </button>
              </div>
          </div>
        </div>

        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}
        >
          <span className="text-white/30 text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown size={18} className="text-amber-400/60 animate-bounce" />
        </div>
      </section>

      {/* ─── SECTION 1 — SHOWCASE ─── */}
      <section className="relative overflow-hidden py-32 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/46660/46660-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">The Menu</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-4">Choose your<br />Supreme</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(foods.length > 0 ? foods : []).map((item) => (
              <div key={item.id} onClick={() => goToOrder(item.id)} className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer">
                <div className="w-full aspect-square rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'}')` }} />
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

      {/* ─── DRINKS ─── */}
      <section className="relative overflow-hidden border-t border-white/5 py-32 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/48323/48323-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Refreshing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-4">Choose your<br />Drinks</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(drinks.length > 0 ? drinks : []).map((item) => (
              <div key={item.id} onClick={() => goToOrder(item.id)} className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer">
                <div className="w-full aspect-square rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'}')` }} />
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

      {/* ─── SECTION 2 — INGREDIENTS ─── */}
      <section className="relative overflow-hidden border-t border-white/5 py-32 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/47159/47159-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Quality First</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-4">Only the finest<br />ingredients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
            {(ingredients.length > 0 ? ingredients : []).slice(0, 3).map((item, i) => {
              const Icon = iconMap[item.icon_name] || Sparkles
              return (
                <div key={item.id} className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  >
                    <Icon size={36} className="text-amber-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white">{item.title || item.label}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — STORY ─── */}
      <section className="relative overflow-hidden border-t border-white/5 py-32 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/22921/22921-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="w-full aspect-[4/3] rounded-2xl bg-cover bg-center shadow-2xl"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80')` }}
            />
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Born from a<br />love of fire</h2>
            <p className="text-white/50 leading-relaxed text-base">
              What started as a backyard grill between friends grew into a relentless pursuit of the perfect burger.
              Every patty is smashed to order, every bun baked at dawn — because you deserve more than fast food.
            </p>
            <button className="flex items-center gap-2 text-amber-400 text-sm font-semibold uppercase tracking-widest hover:gap-3 transition-all cursor-pointer w-fit">
              Read More <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — CRAFT ─── */}
      <section className="relative overflow-hidden border-t border-white/5 py-32 px-6 md:px-8">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://assets.mixkit.co/videos/14010/14010-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase">The Process</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-4">Crafted step<br />by step</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
            {[
              { step: '01', title: 'Smashed to order', desc: 'Fresh Angus patties smashed on a 500° flat-top for maximum crust' },
              { step: '02', title: 'Stacked with care', desc: 'Each layer placed by hand — cheese, bacon, lettuce, tomato, sauce' },
              { step: '03', title: 'Served immediate', desc: 'From grill to table in under 4 minutes. Hot, fresh, perfect.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3 p-8 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                <span className="text-amber-400/40 text-5xl font-bold leading-none">{step}</span>
                <h3 className="text-lg font-semibold text-white mt-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5 — CTA ─── */}
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
    </>
  )
}
