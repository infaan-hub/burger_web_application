const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function getToken() {
  const stored = localStorage.getItem('auth')
  if (!stored) return null
  try {
    return JSON.parse(stored).tokens.access
  } catch {
    return null
  }
}

function getWsUrl() {
  const apiBase = API_URL.replace(/\/api\/?$/, '')
  const wsBase = apiBase.replace(/^http/, 'ws')
  return wsBase
}

let wsInstance = null
let listeners = {}
let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 50
const BASE_DELAY = 1000
let connectionStatus = 'DISCONNECTED'
let statusListeners = new Set()

function notifyStatusListeners(status) {
  connectionStatus = status
  statusListeners.forEach(fn => fn(status))
}

function addEventListeners(eventType, callback) {
  if (!listeners[eventType]) listeners[eventType] = []
  listeners[eventType].push(callback)
  return () => {
    listeners[eventType] = listeners[eventType].filter(fn => fn !== callback)
  }
}

function dispatchEvent(event) {
  const type = event.type
  const cbs = listeners[type] || []
  cbs.forEach(fn => {
    try { fn(event.data) } catch (e) { console.error('[WebSocket] Listener error:', e) }
  })
  const globalCbs = listeners['*'] || []
  globalCbs.forEach(fn => {
    try { fn(event) } catch (e) { console.error('[WebSocket] Global listener error:', e) }
  })
}

function connect() {
  if (wsInstance && (wsInstance.readyState === WebSocket.CONNECTING || wsInstance.readyState === WebSocket.OPEN)) {
    return
  }

  const token = getToken()
  if (!token) return

  const wsUrl = `${getWsUrl()}/ws/events/?token=${token}`
  notifyStatusListeners('CONNECTING')

  try {
    wsInstance = new WebSocket(wsUrl)
  } catch (e) {
    console.error('[WebSocket] Connection error:', e)
    notifyStatusListeners('ERROR')
    scheduleReconnect()
    return
  }

  wsInstance.onopen = () => {
    console.log('[WebSocket] Connected')
    reconnectAttempts = 0
    notifyStatusListeners('CONNECTED')
    startHeartbeat()
  }

  wsInstance.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'PONG') return
      if (data.type === 'CONNECTION_ESTABLISHED') return
      console.log(`[WebSocket] Event received: ${data.type}`)
      dispatchEvent(data)
    } catch (e) {
      console.error('[WebSocket] Parse error:', e)
    }
  }

  wsInstance.onclose = (event) => {
    console.log(`[WebSocket] Disconnected (code: ${event.code})`)
    wsInstance = null
    stopHeartbeat()
    if (event.code !== 1000) {
      notifyStatusListeners('DISCONNECTED')
      scheduleReconnect()
    } else {
      notifyStatusListeners('DISCONNECTED')
    }
  }

  wsInstance.onerror = (error) => {
    console.error('[WebSocket] Error:', error)
    notifyStatusListeners('ERROR')
  }
}

let heartbeatInterval = null

function startHeartbeat() {
  stopHeartbeat()
  heartbeatInterval = setInterval(() => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify({ type: 'PING' }))
    }
  }, 30000)
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('[WebSocket] Max reconnect attempts reached')
    notifyStatusListeners('ERROR')
    return
  }

  const token = getToken()
  if (!token) return

  const delay = Math.min(BASE_DELAY * Math.pow(1.5, reconnectAttempts), 30000)
  reconnectAttempts++
  console.log(`[WebSocket] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttempts})`)
  notifyStatusListeners('RECONNECTING')

  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    connect()
  }, delay)
}

function disconnect() {
  stopHeartbeat()
  clearTimeout(reconnectTimer)
  reconnectTimer = null
  reconnectAttempts = 0
  if (wsInstance) {
    wsInstance.close(1000)
    wsInstance = null
  }
  listeners = {}
  notifyStatusListeners('DISCONNECTED')
}

function onConnectionStatusChange(callback) {
  statusListeners.add(callback)
  callback(connectionStatus)
  return () => statusListeners.delete(callback)
}

function getConnectionStatus() {
  return connectionStatus
}

export {
  connect,
  disconnect,
  addEventListeners,
  onConnectionStatusChange,
  getConnectionStatus,
}
