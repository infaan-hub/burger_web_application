const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function getToken() {
  const stored = localStorage.getItem('auth')
  if (!stored) return null
  try {
    return JSON.parse(stored).tokens.access
  } catch {
    return null
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

let swRegistration = null
let permissionState = 'default'
let listeners = new Set()
let notificationAudio = null

function notifyListeners(state) {
  permissionState = state
  listeners.forEach(fn => fn(state))
}

function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function playNotificationSound() {
  try {
    if (!notificationAudio) {
      notificationAudio = new Audio('/notification.mp3')
      notificationAudio.volume = 0.5
    }
    notificationAudio.currentTime = 0
    notificationAudio.play().catch(() => {})
  } catch {}
}

function initSoundListener() {
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PLAY_NOTIFICATION_SOUND') {
        playNotificationSound()
      }
    })
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const existing = await navigator.serviceWorker.getRegistration('/')
    if (existing) {
      swRegistration = existing
      console.log('[Push] Service Worker already registered')
      initSoundListener()
      return swRegistration
    }
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    console.log('[Push] Service Worker registered')
    initSoundListener()
    return swRegistration
  } catch (e) {
    console.error('[Push] SW registration failed:', e)
    return null
  }
}

async function requestPermission() {
  if (!isPushSupported()) {
    console.log('[Push] Not supported in this browser')
    return 'unsupported'
  }
  if (Notification.permission === 'granted') {
    notifyListeners('granted')
    return 'granted'
  }
  if (Notification.permission === 'denied') {
    notifyListeners('denied')
    return 'denied'
  }
  const result = await Notification.requestPermission()
  console.log(`[Push] Permission ${result}`)
  notifyListeners(result)
  return result
}

async function subscribe() {
  if (!isPushSupported()) return null

  const perm = await requestPermission()
  if (perm !== 'granted') return null

  if (!swRegistration) {
    swRegistration = await registerServiceWorker()
  }
  if (!swRegistration) return null

  let vapidPublicKey = ''
  try {
    const res = await fetch(`${API}/push/vapid-key/`)
    const data = await res.json()
    vapidPublicKey = data.public_key
  } catch {
    console.error('[Push] Failed to fetch VAPID key')
    return null
  }
  if (!vapidPublicKey) return null

  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
    const sub = subscription.toJSON()
    const token = getToken()
    if (token) {
      await fetch(`${API}/push/subscribe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        }),
      })
      console.log('[Push] Subscription sent to server')
    }
    return subscription
  } catch (e) {
    console.error('[Push] Subscribe failed:', e)
    return null
  }
}

async function unsubscribe() {
  if (!swRegistration) {
    swRegistration = await navigator.serviceWorker.getRegistration('/')
  }
  if (!swRegistration) return

  try {
    const subscription = await swRegistration.pushManager.getSubscription()
    if (subscription) {
      const sub = subscription.toJSON()
      const token = getToken()
      if (token) {
        await fetch(`${API}/push/unsubscribe/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
      }
      await subscription.unsubscribe()
      console.log('[Push] Unsubscribed')
    }
  } catch (e) {
    console.error('[Push] Unsubscribe failed:', e)
  }
}

async function getPermissionState() {
  if (!isPushSupported()) return 'unsupported'
  if (Notification.permission === 'granted') {
    notifyListeners('granted')
    return 'granted'
  }
  if (Notification.permission === 'denied') {
    notifyListeners('denied')
    return 'denied'
  }
  notifyListeners('default')
  return 'default'
}

function onPermissionChange(callback) {
  listeners.add(callback)
  getPermissionState()
  return () => listeners.delete(callback)
}

async function initPush() {
  try {
    if (!isPushSupported()) return
    await registerServiceWorker()
    const perm = await getPermissionState()
    if (perm === 'granted') {
      if (!swRegistration) {
        swRegistration = await navigator.serviceWorker.getRegistration('/')
      }
      if (swRegistration) {
        const existing = await swRegistration.pushManager.getSubscription()
        if (!existing) {
          await subscribe()
        }
      }
    }
  } catch (e) {
    console.error('[Push] initPush error:', e)
  }
}

export {
  isPushSupported,
  registerServiceWorker,
  requestPermission,
  subscribe,
  unsubscribe,
  getPermissionState,
  onPermissionChange,
  initPush,
  playNotificationSound,
}
