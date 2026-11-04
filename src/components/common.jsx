import { useEffect, useRef, useState } from 'react'
import { useApp, mediaUrl, PEOPLE } from '../store.jsx'
import { Icon } from '../icons.jsx'

export const FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(1.45) contrast(1.08)' },
  { id: 'warm', name: 'Warm', css: 'sepia(.25) saturate(1.3) hue-rotate(-8deg)' },
  { id: 'cool', name: 'Cool', css: 'saturate(1.1) hue-rotate(12deg) brightness(1.05)' },
  { id: 'fade', name: 'Fade', css: 'contrast(.85) brightness(1.1) saturate(.8)' },
  { id: 'drama', name: 'Drama', css: 'contrast(1.35) brightness(.92)' },
  { id: 'mono', name: 'Mono', css: 'grayscale(1) contrast(1.1)' },
  { id: 'retro', name: 'Retro', css: 'sepia(.55) contrast(1.05) brightness(1.02)' },
]
export const filterCss = (id) => FILTERS.find((f) => f.id === id)?.css || 'none'

export function Avatar({ user, size = 32, ring, onClick }) {
  const { account } = useApp()
  const isBrand = !user || user === account.username
  const person = PEOPLE.find((p) => p.username === user)
  const colors = person?.colors || ['#222', '#555']
  const label = (isBrand ? account.name || account.username : user).replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()
  const inner = isBrand && account.avatar
    ? <img src={mediaUrl(account.avatar)} alt="" />
    : <span style={{ background: isBrand ? 'linear-gradient(135deg,#111,#444)' : `linear-gradient(135deg,${colors[0]},${colors[1]})`, fontSize: size * 0.36 }}>{label}</span>
  return (
    <span className={`avatar ${ring ? `ring ring-${ring}` : ''}`} style={{ width: size, height: size }} onClick={onClick}>
      <span className="avatar-in">{inner}</span>
    </span>
  )
}

export function Media({ media, filter, className = '', active = true, muted = true, loop = true, onEnded, onDuration, kenBurns = false, fit = 'cover' }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current; if (!v) return
    if (active) { v.currentTime = 0; v.play().catch(() => {}) } else v.pause()
  }, [active])
  useEffect(() => { if (ref.current) ref.current.muted = muted }, [muted])
  if (!media) return null
  const style = { filter: filterCss(filter), objectFit: fit }
  if (media.type === 'color') return <div className={`media ${className}`} style={{ background: media.bg }} />
  if (media.type === 'video') {
    return (
      <video ref={ref} className={`media ${className}`} style={style} src={media.src} muted={muted} loop={loop} playsInline
        autoPlay={active} onEnded={onEnded} onLoadedMetadata={(e) => onDuration?.(e.currentTarget.duration)} />
    )
  }
  return <img className={`media ${className} ${kenBurns ? 'kenburns' : ''}`} style={style} src={media.src} alt="" draggable={false} />
}

export function Sheet({ title, onClose, children, tall = false }) {
  const [closing, setClosing] = useState(false)
  const close = () => { setClosing(true); setTimeout(onClose, 180) }
  return (
    <div className={`sheet-backdrop ${closing ? 'closing' : ''}`} onClick={close}>
      <div className={`sheet ${tall ? 'tall' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        {title && <div className="sheet-title">{title}</div>}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function TopBar({ title, left, right, onBack, transparent }) {
  return (
    <div className={`topbar ${transparent ? 'transparent' : ''}`}>
      <div className="topbar-left">
        {onBack && <button className="icon-btn" onClick={onBack}><Icon name="back" /></button>}
        {left}
        {title && <div className="topbar-title">{title}</div>}
      </div>
      <div className="topbar-right">{right}</div>
    </div>
  )
}

export function HeartBurst({ show }) {
  if (!show) return null
  return <div className="heart-burst" key={show}><Icon name="heart" filled size={96} strokeWidth={0} /></div>
}

// Double-tap detector that still lets single taps through after a short delay.
export function useDoubleTap(onDouble, onSingle) {
  const last = useRef(0); const t = useRef(null)
  return () => {
    const now = Date.now()
    if (now - last.current < 280) { clearTimeout(t.current); last.current = 0; onDouble?.() }
    else { last.current = now; if (onSingle) t.current = setTimeout(onSingle, 290) }
  }
}
