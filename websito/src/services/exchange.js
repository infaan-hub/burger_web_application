const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

let cachedRate = null
let fetchedAt = 0
const CACHE_TTL = 86400000

export async function getExchangeRate(force = false) {
  const now = Date.now()
  if (!force && cachedRate && (now - fetchedAt) < CACHE_TTL) {
    return cachedRate
  }
  try {
    const res = await fetch(`${API}/exchange-rate/`)
    const data = await res.json()
    if (data.usd_to_tsh) {
      cachedRate = data.usd_to_tsh
      fetchedAt = now
      return cachedRate
    }
  } catch {}
  if (cachedRate) return cachedRate
  cachedRate = 2500
  fetchedAt = now
  return cachedRate
}

export function usdToTsh(usd, rate) {
  const r = rate || cachedRate || 2500
  return Math.round(usd * r)
}

export function formatTsh(usd, rate) {
  return `TSh ${usdToTsh(usd, rate).toLocaleString()}`
}
