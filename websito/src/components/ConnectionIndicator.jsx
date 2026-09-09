import { useState, useEffect } from 'react'
import { onConnectionStatusChange } from '../services/websocket'

export default function ConnectionIndicator() {
  const [status, setStatus] = useState('DISCONNECTED')

  useEffect(() => {
    return onConnectionStatusChange(setStatus)
  }, [])

  const statusConfig = {
    CONNECTED: { color: 'bg-green-400', text: 'Live', show: true },
    CONNECTING: { color: 'bg-yellow-400', text: 'Connecting...', show: true },
    RECONNECTING: { color: 'bg-yellow-400', text: 'Reconnecting...', show: true },
    DISCONNECTED: { color: 'bg-red-400', text: 'Offline', show: false },
    ERROR: { color: 'bg-red-400', text: 'Error', show: false },
  }

  const cfg = statusConfig[status] || statusConfig.DISCONNECTED

  if (!cfg.show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs">
      <span className={`w-2 h-2 rounded-full ${cfg.color} ${status === 'CONNECTED' ? 'animate-pulse' : ''}`} />
      <span className="text-white/60">{cfg.text}</span>
    </div>
  )
}
