import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const contactInfo = [
  { icon: MapPin, label: 'Address', value: '123 Burger Lane, Foodville, FC 90210' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: Mail, label: 'Email', value: 'hello@bitecraft.com' },
]

export default function Contact() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://assets.mixkit.co/videos/48323/48323-720.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-dark" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Mail size={24} className="text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Contact Us</h1>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          {contactInfo.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/5 rounded-xl">
              <Icon size={18} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
                <p className="text-white text-sm mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <textarea
            rows={4}
            placeholder="Your Message"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
          />
          <button className="w-full py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
