import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { Icon } from '../icons.jsx'
import { Avatar, Media, Sheet, FILTERS, filterCss } from '../components/common.jsx'
import { OverlayContent, overlayStyle, MusicSticker, STICKERS, TEXT_STYLES, TEXT_COLORS, artFor } from '../components/Overlays.jsx'
import { playTrack, stopMusic, toggleTrack, onMusicChange, currentTrack } from '../music.js'

export const BACKGROUNDS = [
  'linear-gradient(160deg,#833ab4,#fd1d1d,#fcb045)', 'linear-gradient(160deg,#0f2027,#2c5364)',
  'linear-gradient(160deg,#ff9a9e,#fecfef)', 'linear-gradient(160deg,#43cea2,#185a9d)',
  'linear-gradient(160deg,#141e30,#243b55)', 'linear-gradient(160deg,#f7971e,#ffd200)',
]

const uid = () => Math.random().toString(36).slice(2, 9)

export const TEMPLATES = [
  { id: 'drop', name: 'Product Drop', bg: BACKGROUNDS[4], music: 'neon-pulse', overlays: [
    { kind: 'text', text: 'COMING SOON', style: 'modern', color: '#ffffff', x: 45, y: 30, size: 1.3 },
    { kind: 'countdown', text: 'LAUNCH', x: 50, y: 62, size: 1 },
    { kind: 'link', text: 'yourbrand.com', x: 50, y: 80, size: 0.9 }] },
  { id: 'thisorthat', name: 'This or That', bg: BACKGROUNDS[2], overlays: [
    { kind: 'text', text: 'Help us choose', style: 'strong', color: '#d10869', x: 50, y: 18, size: 1 },
    { kind: 'poll', text: 'Which colour should we make next?', options: ['Ocean blue', 'Sunset orange'], x: 50, y: 62, size: 1 }] },
  { id: 'addyours', name: 'Add Yours', bg: BACKGROUNDS[3], overlays: [
    { kind: 'addyours', text: 'Show us how you style it', x: 50, y: 50, size: 1.1 }] },
  { id: 'ama', name: 'Ask Me', bg: BACKGROUNDS[0], overlays: [
    { kind: 'text', text: 'Q&A time', style: 'neon', color: '#fdcb5c', x: 50, y: 22, size: 1.3 },
    { kind: 'question', text: 'Ask us anything about the new collection', x: 50, y: 55, size: 1 }] },
  { id: 'sale', name: 'Flash Sale', bg: BACKGROUNDS[5], music: 'summer-sale', overlays: [
    { kind: 'text', text: '30% OFF', style: 'modern', color: '#000000', x: 50, y: 30, size: 2 },
    { kind: 'text', text: 'this weekend only', style: 'typewriter', color: '#000000', x: 50, y: 47, size: 1 },
    { kind: 'emoji', text: '🛍️', x: 78, y: 18, size: 1.4, rot: 12 },
    { kind: 'link', text: 'Shop the sale', x: 50, y: 75, size: 1 }] },
  { id: 'quiz', name: 'Quiz', bg: BACKGROUNDS[1], overlays: [
    { kind: 'quiz', text: 'Guess the price!', options: ['$49', '$79', '$99'], answer: 1, x: 50, y: 50, size: 1 }] },
  { id: 'launch', name: 'Launch Day', bg: BACKGROUNDS[0], music: 'golden-hour', musicStyle: 'lyrics', overlays: [
    { kind: 'text', text: "It's here.", style: 'classic', color: '#ffffff', x: 50, y: 18, size: 1.5 },
    { kind: 'location', text: 'Ho Chi Minh City', x: 30, y: 80, size: 0.9, rot: -6 },
    { kind: 'mention', text: 'yourbrand', x: 70, y: 86, size: 0.9, rot: 4 }] },
  { id: 'slider', name: 'Rate It', bg: BACKGROUNDS[2], overlays: [
    { kind: 'slider', text: 'How much do you love it?', emoji: '😍', x: 50, y: 70, size: 1 }] },
]

export default function StoryEditor({ nav, media: initialMedia, onDone }) {
  const app = useApp()
  const [media, setMedia] = useState(initialMedia || null)
  const [bg, setBg] = useState(BACKGROUNDS[0])
  const [overlays, setOverlays] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('normal')
  const [trackId, setTrackId] = useState(null)
  const [musicStyle, setMusicStyle] = useState('card')
  const [musicPos, setMusicPos] = useState({ x: 50, y: 86 })
  const [panel, setPanel] = useState(null) // text | stickers | music | templates | filters
  const [textDraft, setTextDraft] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [overTrash, setOverTrash] = useState(false)
  const [, force] = useState(0)
  const stage = useRef(null)
  const track = app.findTrack(trackId)

  useEffect(() => onMusicChange(() => force((n) => n + 1)), [])
  useEffect(() => { if (track) playTrack(track); else stopMusic() }, [trackId])
  useEffect(() => () => stopMusic(), [])

  const update = (id, patch) => setOverlays((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  const add = (o) => { const n = { id: uid(), x: 50, y: 45, size: 1, ...o }; setOverlays((os) => [...os, n]); setSelected(n.id); return n }
  const sel = overlays.find((o) => o.id === selected)

  const applyTemplate = (t) => {
    if (!media) setBg(t.bg)
    setOverlays(t.overlays.map((o) => ({ id: uid(), ...o })))
    if (t.music) { setTrackId(t.music); setMusicStyle(t.musicStyle || 'card') }
    setPanel(null); setSelected(null)
  }

  const startDrag = (e, id) => {
    e.stopPropagation()
    const rect = stage.current.getBoundingClientRect()
    const target = id === 'music' ? musicPos : overlays.find((o) => o.id === id)
    const ox = e.clientX - (rect.left + (target.x / 100) * rect.width)
    const oy = e.clientY - (rect.top + (target.y / 100) * rect.height)
    let moved = false
    if (id !== 'music') setSelected(id)
    const move = (ev) => {
      moved = true; setDragging(id)
      const x = Math.max(0, Math.min(100, ((ev.clientX - ox - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((ev.clientY - oy - rect.top) / rect.height) * 100))
      if (id === 'music') setMusicPos({ x, y }); else update(id, { x, y })
      setOverTrash(ev.clientY > rect.bottom - 90 && Math.abs(ev.clientX - (rect.left + rect.width / 2)) < 50)
    }
    const upFn = (ev) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', upFn)
      const trash = ev.clientY > rect.bottom - 90 && Math.abs(ev.clientX - (rect.left + rect.width / 2)) < 50
      if (moved && trash) { if (id === 'music') setTrackId(null); else { setOverlays((os) => os.filter((o) => o.id !== id)); setSelected(null) } }
      if (!moved && id !== 'music') {
        const o = overlays.find((x) => x.id === id)
        if (o?.kind === 'text') setTextDraft({ ...o })
      }
      if (!moved && id === 'music') setMusicStyle((s) => ({ card: 'lyrics', lyrics: 'minimal', minimal: 'card' }[s]))
      setDragging(null); setOverTrash(false)
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', upFn)
  }

  const share = (audience) => {
    const story = {
      id: `story-new-${uid()}`, media: media || { type: 'color', bg }, overlays, filter,
      music: trackId, musicStyle, musicX: musicPos.x, musicY: musicPos.y, time: 'now', audience,
    }
    stopMusic()
    if (onDone) onDone(story)
    else { app.addStory(story); nav.reset(); nav.toast(audience === 'close' ? 'Shared to Close Friends' : 'Shared to your story') }
  }

  const pickFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    setMedia({ src: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' })
  }

  return (
    <div className="editor">
      <div className="editor-stage" ref={stage} onPointerDown={() => setSelected(null)}>
        {media ? <Media media={media} filter={filter} active muted={!!track} fit="cover" /> : <div className="media" style={{ background: bg, filter: filterCss(filter) }} />}
        {overlays.map((o) => (
          <div key={o.id} className={`overlay editable ${selected === o.id ? 'selected' : ''} ${dragging === o.id ? 'dragging' : ''}`}
            style={overlayStyle(o)} onPointerDown={(e) => startDrag(e, o.id)}>
            <OverlayContent o={o} />
          </div>
        ))}
        {track && (
          <div className={`overlay editable ${dragging === 'music' ? 'dragging' : ''}`} style={overlayStyle({ ...musicPos, size: 1 })} onPointerDown={(e) => startDrag(e, 'music')}>
            <MusicSticker track={track} style={musicStyle} playing={currentTrack()?.id === track.id} />
          </div>
        )}

        <div className="editor-top">
          <button className="icon-btn white" onClick={() => { stopMusic(); nav.pop() }}><Icon name="close" /></button>
          <div className="editor-tools">
            <button onClick={() => setTextDraft({ text: '', style: 'classic', color: '#ffffff' })}><Icon name="text" /><span>Text</span></button>
            <button onClick={() => setPanel('stickers')}><Icon name="sticker" /><span>Stickers</span></button>
            <button onClick={() => setPanel('music')}><Icon name="music" /><span>Music</span></button>
            <button onClick={() => setPanel('templates')}><Icon name="template" /><span>Templates</span></button>
            <button onClick={() => setPanel(panel === 'filters' ? null : 'filters')}><Icon name="filter" /><span>Filters</span></button>
            <label><Icon name="upload" /><span>Media</span><input type="file" accept="image/*,video/*" hidden onChange={pickFile} /></label>
          </div>
        </div>

        {!media && !overlays.length && !panel && (
          <div className="editor-hint">Tap <b>Templates</b> to start from a layout,<br />or <b>Text</b> to type.</div>
        )}

        {!media && (
          <div className="bg-picker" onPointerDown={(e) => e.stopPropagation()}>
            {BACKGROUNDS.map((b) => <button key={b} style={{ background: b }} className={b === bg ? 'on' : ''} onClick={() => setBg(b)} />)}
          </div>
        )}

        {sel && sel.kind !== 'text' && sel.kind !== 'emoji' && !dragging && (
          <div className="sel-editor" onPointerDown={(e) => e.stopPropagation()}>
            <input value={sel.text} onChange={(e) => update(sel.id, { text: e.target.value })} placeholder="Sticker text" />
            {(sel.kind === 'poll' || sel.kind === 'quiz') && sel.options.map((op, k) => (
              <input key={k} value={op} onChange={(e) => update(sel.id, { options: sel.options.map((x, j) => (j === k ? e.target.value : x)) })} />
            ))}
            {sel.kind === 'countdown' && <input type="datetime-local" value={sel.target || ''} onChange={(e) => update(sel.id, { target: e.target.value })} />}
            <div className="row gap8">
              <span className="muted-w">Size</span>
              <input type="range" min="0.5" max="2" step="0.05" value={sel.size} onChange={(e) => update(sel.id, { size: +e.target.value })} />
              <button className="icon-btn white" onClick={() => { setOverlays((os) => os.filter((o) => o.id !== sel.id)); setSelected(null) }}><Icon name="trash" size={20} /></button>
            </div>
          </div>
        )}
        {sel && (sel.kind === 'text' || sel.kind === 'emoji') && !dragging && (
          <div className="sel-editor compact" onPointerDown={(e) => e.stopPropagation()}>
            <span className="muted-w">Size</span>
            <input type="range" min="0.5" max="3" step="0.05" value={sel.size} onChange={(e) => update(sel.id, { size: +e.target.value })} />
            <span className="muted-w">Tilt</span>
            <input type="range" min="-30" max="30" value={sel.rot || 0} onChange={(e) => update(sel.id, { rot: +e.target.value })} />
            <button className="icon-btn white" onClick={() => { setOverlays((os) => os.filter((o) => o.id !== sel.id)); setSelected(null) }}><Icon name="trash" size={20} /></button>
          </div>
        )}

        {dragging && <div className={`trash ${overTrash ? 'over' : ''}`}><Icon name="trash" /></div>}

        {panel === 'filters' && (
          <div className="filter-strip" onPointerDown={(e) => e.stopPropagation()}>
            {FILTERS.map((f) => (
              <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
                <span style={{ filter: f.css, background: media ? undefined : bg }}>{media && media.type === 'image' && <img src={media.src} alt="" />}</span>{f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="editor-bottom">
        <button className="share-pill" onClick={() => share('public')}><Avatar size={24} /> Your story</button>
        <button className="share-pill close" onClick={() => share('close')}><span className="star">★</span> Close Friends</button>
        <button className="share-go" onClick={() => share('public')}><Icon name="chevron" /></button>
      </div>

      {textDraft && (
        <TextComposer draft={textDraft} onCancel={() => setTextDraft(null)} onDone={(d) => {
          if (!d.text.trim()) { if (d.id) setOverlays((os) => os.filter((o) => o.id !== d.id)) }
          else if (d.id) update(d.id, d)
          else add({ kind: 'text', ...d, y: 40 })
          setTextDraft(null)
        }} />
      )}

      {panel === 'stickers' && (
        <Sheet title="Stickers" onClose={() => setPanel(null)} tall>
          <div className="sticker-grid">
            {STICKERS.map((s, k) => (
              <button key={k} onClick={() => { const { label, ...rest } = s; add({ ...rest, options: s.options && [...s.options] }); setPanel(null) }}>
                <div className="sticker-preview"><OverlayContent o={s} /></div>
                {s.kind !== 'emoji' && <small>{s.label}</small>}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {panel === 'music' && (
        <MusicPicker onClose={() => setPanel(null)} selected={trackId} musicStyle={musicStyle} setMusicStyle={setMusicStyle}
          onPick={(t) => { setTrackId(t.id); setPanel(null) }} onRemove={() => { setTrackId(null); setPanel(null) }} />
      )}

      {panel === 'templates' && (
        <Sheet title="Templates" onClose={() => setPanel(null)} tall>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => applyTemplate(t)}>
                <div className="template-thumb" style={{ background: t.bg }}>
                  {t.overlays.map((o, k) => <div key={k} className="overlay" style={overlayStyle({ ...o, size: (o.size || 1) * 0.42 })}><OverlayContent o={o} /></div>)}
                </div>
                <small>{t.name}</small>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}

function TextComposer({ draft, onDone, onCancel }) {
  const [d, setD] = useState(draft)
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="text-composer">
      <div className="row between">
        <button className="link-white" onClick={onCancel}>Cancel</button>
        <div className="style-chips">
          {TEXT_STYLES.map((s) => <button key={s.id} className={d.style === s.id ? 'on' : ''} onClick={() => setD({ ...d, style: s.id })}>{s.name}</button>)}
        </div>
        <button className="link-white b" onClick={() => onDone(d)}>Done</button>
      </div>
      <div className="composer-area">
        <textarea ref={ref} className={`st-text ts-${d.style}`} style={{ color: d.style === 'strong' ? undefined : d.color, '--c': d.color }}
          value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} placeholder="Type something…" rows={3} />
      </div>
      <div className="color-row">
        {TEXT_COLORS.map((c) => <button key={c} style={{ background: c }} className={d.color === c ? 'on' : ''} onClick={() => setD({ ...d, color: c })} />)}
      </div>
    </div>
  )
}

export function MusicPicker({ onClose, onPick, onRemove, selected, musicStyle, setMusicStyle }) {
  const app = useApp()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('For you')
  const [, force] = useState(0)
  useEffect(() => onMusicChange(() => force((n) => n + 1)), [])
  const playing = currentTrack()
  const list = app.tracks.filter((t) => `${t.title} ${t.artist} ${t.mood}`.toLowerCase().includes(q.toLowerCase()))
    .filter((t) => tab === 'For you' || (tab === 'Your music' ? t.src : !t.src))
  return (
    <Sheet title="Music" onClose={onClose} tall>
      <div className="search-box"><Icon name="search" size={16} /><input placeholder="Search music" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="chip-row">{['For you', 'Browse', 'Your music'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {setMusicStyle && selected && (
        <div className="chip-row">
          <span className="muted">Sticker style:</span>
          {['card', 'lyrics', 'minimal'].map((s) => <button key={s} className={musicStyle === s ? 'on' : ''} onClick={() => setMusicStyle(s)}>{s}</button>)}
          <button onClick={onRemove}>Remove</button>
        </div>
      )}
      <div className="track-list">
        {list.map((t) => (
          <div key={t.id} className={`track ${selected === t.id ? 'selected' : ''}`} onClick={() => onPick(t)}>
            <div className="track-art" style={{ background: artFor(t) }} />
            <div className="track-info"><b>{t.title}</b><small>{t.artist} · {t.mood}{t.bpm ? ` · ${t.bpm} BPM` : ''}</small></div>
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggleTrack(t) }}>
              <Icon name={playing?.id === t.id ? 'pause' : 'play'} size={18} />
            </button>
          </div>
        ))}
        {list.length === 0 && <div className="empty">No tracks. Drop .mp3 files into <code>public/media/music/</code>.</div>}
      </div>
    </Sheet>
  )
}
