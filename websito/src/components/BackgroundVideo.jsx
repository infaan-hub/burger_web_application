import { useRef, useEffect } from 'react'

export default function BackgroundVideo({ src }) {
  const ref = useRef(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    v.muted = true
    v.loop = true
    v.playsInline = true
    v.preload = 'auto'
    v.controls = false
    v.style.pointerEvents = 'none'

    const play = () => { if (v.paused) v.play().catch(() => {}) }

    if (v.readyState >= 2) { play(); return }

    const onReady = () => { play(); v.removeEventListener('loadeddata', onReady) }
    v.addEventListener('loadeddata', onReady)

    const onTouch = () => { if (v.paused) play() }
    document.addEventListener('touchstart', onTouch, { once: true })

    return () => {
      v.removeEventListener('loadeddata', onReady)
      document.removeEventListener('touchstart', onTouch)
    }
  }, [src])

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
