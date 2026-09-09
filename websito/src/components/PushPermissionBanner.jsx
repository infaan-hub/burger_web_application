import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { isPushSupported, getPermissionState, requestPermission, initPush } from '../services/push'
import { getAuth } from '../api'

export default function PushPermissionBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [status, setStatus] = useState('unsupported')
  const auth = getAuth()

  useEffect(() => {
    if (!auth) return
    const stored = localStorage.getItem('push_banner_dismissed')
    if (stored) {
      setDismissed(true)
      return
    }
    if (!isPushSupported()) {
      setStatus('unsupported')
      return
    }
    getPermissionState().then((s) => {
      setStatus(s)
      if (s === 'default') {
        setShow(true)
      }
    })
  }, [auth])

  const handleEnable = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      await initPush()
    }
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('push_banner_dismissed', '1')
  }

  if (!show || dismissed || !auth) return null

  return (
    <div className="fixed bottom-16 right-4 z-50 max-w-sm">
      <div className="p-4 rounded-2xl bg-[#111] border border-amber-400/20 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Stay Updated</p>
            <p className="text-white/50 text-xs mt-1">Enable notifications to receive booking updates and important alerts.</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                className="px-4 py-1.5 bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 text-white/40 text-xs uppercase tracking-wider hover:text-white/70 transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-white/30 hover:text-white/70 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
