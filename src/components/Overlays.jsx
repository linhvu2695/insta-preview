import { useState } from 'react'
import { Icon } from '../icons.jsx'

export const TEXT_STYLES = [
  { id: 'classic', name: 'Classic' },
  { id: 'modern', name: 'Modern' },
  { id: 'neon', name: 'Neon' },
  { id: 'typewriter', name: 'Typewriter' },
  { id: 'strong', name: 'Strong' },
]
export const TEXT_COLORS = ['#ffffff', '#000000', '#0095f6', '#70c050', '#fdcb5c', '#fd8d32', '#ed4956', '#d10869', '#a307ba']

export const STICKERS = [
  { kind: 'location', label: 'Location', text: 'Ho Chi Minh City' },
  { kind: 'mention', label: 'Mention', text: 'yourbrand' },
  { kind: 'hashtag', label: 'Hashtag', text: 'newlaunch' },
  { kind: 'link', label: 'Link', text: 'yourbrand.com' },
  { kind: 'poll', label: 'Poll', text: 'Which one?', options: ['Yes', 'No'] },
  { kind: 'question', label: 'Questions', text: 'Ask me a question' },
  { kind: 'countdown', label: 'Countdown', text: 'LAUNCH', target: '' },
  { kind: 'slider', label: 'Emoji slider', text: 'How much do you love it?', emoji: '😍' },
  { kind: 'addyours', label: 'Add Yours', text: 'Show your setup' },
  { kind: 'quiz', label: 'Quiz', text: 'Guess the price', options: ['$49', '$79', '$99'], answer: 1 },
  { kind: 'emoji', label: 'Emoji', text: '🔥' },
  { kind: 'emoji', label: 'Emoji', text: '✨' },
  { kind: 'emoji', label: 'Emoji', text: '🛍️' },
  { kind: 'emoji', label: 'Emoji', text: '💯' },
]

function Countdown({ o }) {
  const target = o.target ? new Date(o.target) : new Date(Date.now() + 3 * 864e5 + 5 * 36e5)
  const ms = Math.max(0, target - Date.now())
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60
  return (
    <div className="st-card st-countdown">
      <div className="st-cd-title">{o.text}</div>
      <div className="st-cd-digits">{[d, h, m].map((v, i) => <span key={i}><b>{String(v).padStart(2, '0')}</b><small>{['days', 'hours', 'mins'][i]}</small></span>)}</div>
    </div>
  )
}

function Poll({ o, interactive }) {
  const [vote, setVote] = useState(null)
  const opts = o.options || ['Yes', 'No']
  const pct = (i) => (vote === null ? null : i === vote ? 64 : Math.round(36 / (opts.length - 1)))
  return (
    <div className="st-card st-poll">
      <div className="st-q">{o.text}</div>
      {opts.map((opt, i) => (
        <button key={i} className={`st-opt ${vote === i ? 'chosen' : ''}`} disabled={!interactive}
          onClick={(e) => { e.stopPropagation(); setVote(i) }}>
          {vote !== null && <span className="st-bar" style={{ width: `${pct(i)}%` }} />}
          <span className="st-opt-label">{opt}</span>
          {vote !== null && <span className="st-pct">{pct(i)}%</span>}
        </button>
      ))}
    </div>
  )
}

function Quiz({ o, interactive }) {
  const [pick, setPick] = useState(null)
  return (
    <div className="st-card st-poll">
      <div className="st-q quiz">{o.text}</div>
      {(o.options || []).map((opt, i) => (
        <button key={i} disabled={!interactive}
          className={`st-opt ${pick !== null && i === o.answer ? 'right' : ''} ${pick === i && i !== o.answer ? 'wrong' : ''}`}
          onClick={(e) => { e.stopPropagation(); setPick(i) }}>
          <span className="st-letter">{String.fromCharCode(65 + i)}</span><span className="st-opt-label">{opt}</span>
        </button>
      ))}
    </div>
  )
}

function Slider({ o, interactive }) {
  const [v, setV] = useState(0)
  return (
    <div className="st-card st-slider" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => interactive && e.stopPropagation()}>
      <div className="st-q">{o.text}</div>
      <div className="st-track">
        <div className="st-fill" style={{ width: `${v}%` }} />
        <input type="range" min="0" max="100" value={v} disabled={!interactive} onChange={(e) => setV(+e.target.value)} />
        <span className="st-thumb" style={{ left: `${v}%`, fontSize: 22 + v / 6 }}>{o.emoji || '😍'}</span>
      </div>
    </div>
  )
}

function Question({ o, interactive }) {
  const [sent, setSent] = useState(false)
  return (
    <div className="st-card st-question">
      <div className="st-q-head">{o.text}</div>
      <div className="st-q-input" onClick={(e) => { if (interactive) { e.stopPropagation(); setSent(true) } }}>
        {sent ? 'Sent ✓' : 'Type something…'}
      </div>
    </div>
  )
}

export function OverlayContent({ o, interactive = false }) {
  switch (o.kind) {
    case 'text':
      return <div className={`st-text ts-${o.style || 'classic'}`} style={{ color: o.style === 'strong' ? undefined : o.color, '--c': o.color || '#fff' }}>{o.text}</div>
    case 'location':
      return <div className="st-pill grad-text"><Icon name="location" size={16} />{(o.text || '').toUpperCase()}</div>
    case 'mention':
      return <div className="st-pill grad-text">@{(o.text || '').toUpperCase()}</div>
    case 'hashtag':
      return <div className="st-pill grad-text">#{(o.text || '').toUpperCase()}</div>
    case 'link':
      return <div className="st-pill link"><Icon name="link" size={16} />{(o.text || '').toUpperCase()}</div>
    case 'poll': return <Poll o={o} interactive={interactive} />
    case 'quiz': return <Quiz o={o} interactive={interactive} />
    case 'question': return <Question o={o} interactive={interactive} />
    case 'countdown': return <Countdown o={o} />
    case 'slider': return <Slider o={o} interactive={interactive} />
    case 'addyours':
      return <div className="st-card st-addyours"><div className="st-ay-tag">Add Yours</div><div className="st-q">{o.text}</div><div className="st-ay-btn"><Icon name="camera" size={16} /> Add yours</div></div>
    case 'emoji': return <div className="st-emoji">{o.text}</div>
    default: return null
  }
}

export function overlayStyle(o) {
  return { left: `${o.x}%`, top: `${o.y}%`, transform: `translate(-50%,-50%) scale(${o.size || 1}) rotate(${o.rot || 0}deg)` }
}

export function MusicSticker({ track, style = 'card', playing }) {
  if (!track) return null
  if (style === 'lyrics') return <Lyrics track={track} />
  if (style === 'minimal') return <div className="st-music-min"><Icon name="music" size={14} /> {track.title} · {track.artist}</div>
  return (
    <div className="st-music-card">
      <div className={`st-music-art ${playing ? 'spin' : ''}`} style={{ background: artFor(track) }} />
      <div><b>{track.title}</b><small>{track.artist}</small></div>
      <div className={`eq ${playing ? 'on' : ''}`}><i /><i /><i /></div>
    </div>
  )
}

function Lyrics({ track }) {
  const lines = track.lyrics || [track.title, track.artist]
  return <div className="st-lyrics">{lines.map((l, i) => <div key={i} style={{ animationDelay: `${i * 2}s`, animationDuration: `${lines.length * 2}s` }}>{l}</div>)}</div>
}

export function artFor(track) {
  let h = 0; for (const c of track.title) h = (h * 17 + c.charCodeAt(0)) % 360
  return `linear-gradient(135deg,hsl(${h} 80% 60%),hsl(${(h + 60) % 360} 80% 45%))`
}
