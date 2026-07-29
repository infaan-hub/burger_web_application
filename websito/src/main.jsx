import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function forcePlayVideos() {
  document.querySelectorAll('video').forEach(v => {
    if (!v.hasAttribute('preload')) v.preload = 'auto'
    if (!v.hasAttribute('playsinline')) v.setAttribute('playsinline', '')
    v.style.pointerEvents = 'none'
    if (v.paused && v.muted) v.play().catch(() => {})
  })
}

function setupVideoObserver() {
  const target = document.body || document.documentElement
  if (!target) { requestAnimationFrame(setupVideoObserver); return }
  if ('MutationObserver' in window) {
    const observer = new MutationObserver(forcePlayVideos)
    observer.observe(target, { childList: true, subtree: true })
  }
  forcePlayVideos()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupVideoObserver)
} else {
  setupVideoObserver()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
