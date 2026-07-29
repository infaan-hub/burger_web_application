import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import BackgroundVideo from '../components/BackgroundVideo'
export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
      <BackgroundVideo src="https://assets.mixkit.co/videos/48323/48323-720.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-dark" />

      <div className="relative z-10 text-center px-6">
        <h1 className="text-9xl font-black text-amber-400 drop-shadow-lg">404</h1>
        <p className="text-white/60 text-lg mt-4 max-w-md mx-auto">
          This page doesn't exist. It might have been eaten.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors cursor-pointer"
        >
          <Home size={18} />
          Home
        </button>
      </div>
    </div>
  )
}
