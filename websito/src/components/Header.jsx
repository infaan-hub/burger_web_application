import { Menu, X, Flame } from 'lucide-react'

export default function Header({ isOpen, onToggle }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-4">
        <a href="#" className="flex items-center gap-2 text-amber-400 text-xl font-bold tracking-widest uppercase">
          <Flame size={20} className="fill-amber-400" />
          Burger Supreme
        </a>

        <button
          onClick={onToggle}
          className="relative z-[60] flex items-center justify-center w-10 h-10 text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
