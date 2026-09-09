import { useState, useEffect } from 'react'
import { onConnectionStatusChange } from '../services/websocket'

export default function ConnectionIndicator() {
  const [status, setStatus] = useState('DISCONNECTED')

  useEffect(() => {
    return onConnectionStatusChange(setStatus)
  }, [])

  if (status !== 'CONNECTED') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-white/60">Live</span>
    </div>
  )
}
