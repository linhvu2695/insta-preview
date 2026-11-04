import { useMemo, useState } from 'react'
import { useApp, makePost, sampleComments } from '../store.jsx'
import { Icon } from '../icons.jsx'
import { Media, FILTERS } from '../components/common.jsx'
import { MusicPicker } from './StoryEditor.jsx'
import { stopMusic } from '../music.js'

// Uploaded files live only in this browser tab (object URLs); nothing is written to disk.
const uploads = []

export default function Create({ nav, mode: initialMode = 'post' }) {
  const app = useApp()
  const [mode, setMode] = useState(initialMode)
  const [, setTick] = useState(0)
  const [picked, setPicked] = useState([])
  const [multi, setMulti] = useState(false)
  const [step, setStep] = useState('select')
  const [filter, setFilter] = useState('normal')
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [sponsored, setSponsored] = useState(false)
  const [cta, setCta] = useState('Shop now')
  const [trackId, setTrackId] = useState(null)
  const [musicOpen, setMusicOpen] = useState(false)

  const library = useMemo(() => {
    const seen = new Set(); const out = []
    const push = (m) => { if (m && m.src && !seen.has(m.src)) { seen.add(m.src); out.push(m) } }
    uploads.forEach(push)
    app.posts.forEach((p) => p.media.forEach(push))
    app.reels.forEach((r) => push(r.media))
    app.brandStories.forEach((s) => s.media.type !== 'color' && push(s.media))
    return out
  }, [app.posts, app.reels, app.brandStories, uploads.length])

  const current = picked[picked.length - 1] || library[0]
  const selection = picked.length ? picked : current ? [current] : []
  const track = app.findTrack(trackId)

  const onFiles = (e) => {
    const files = [...(e.target.files || [])]
    const added = files.map((f) => ({ src: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image', name: f.name }))
    uploads.unshift(...added)
    setPicked(multi || added.length > 1 ? added : [added[0]])
    if (added.length > 1) setMulti(true)
    setTick((t) => t + 1)
  }

  const toggle = (m) => {
    if (!multi) { setPicked([m]); return }
    setPicked((p) => (p.includes(m) ? p.filter((x) => x !== m) : p.length >= 10 ? p : [...p, m]))
  }

  const next = () => {
    if (!selection.length) return
    if (mode === 'story') { nav.replace('storyEditor', { media: selection[0] }); return }
    setStep('details')
  }

  const share = () => {
    stopMusic()
    if (mode === 'post') {
      const post = makePost(`new-${Date.now()}`, selection, { caption, location: location || undefined, sponsored, cta, likes: 0, time: 'now', filter, music: track ? `${track.title} · ${track.artist}` : undefined })
      app.addPost(post); nav.reset('home'); nav.toast('Your post has been shared')
    } else {
      app.addReel({ id: `reel-new-${Date.now()}`, media: selection[0], caption, likes: 0, audio: track?.id || 'Original audio', comments: sampleComments('new', 2), filter, views: 0 })
      nav.reset('reels'); nav.toast('Your reel has been shared')
    }
  }

  if (step === 'details') {
    return (
      <div className="screen scroll create">
        <div className="topbar sticky">
          <div className="topbar-left"><button className="icon-btn" onClick={() => setStep('select')}><Icon name="back" /></button><div className="topbar-title">New {mode}</div></div>
          <div className="topbar-right"><button className="link-blue b" onClick={share}>Share</button></div>
        </div>
        <div className={`create-preview ${mode === 'reel' ? 'tall' : ''}`}>
          <div className="carousel">{selection.map((m, i) => <div className="slide" key={i}><Media media={m} filter={filter} active={i === 0} muted /></div>)}</div>
          {selection.length > 1 && <div className="slide-count">1/{selection.length}</div>}
        </div>
        <div className="filter-strip light">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
              <span style={{ filter: f.css }}>{selection[0].type === 'image' ? <img src={selection[0].src} alt="" /> : <video src={`${selection[0].src}#t=0.5`} muted />}</span>{f.name}
            </button>
          ))}
        </div>
        <textarea className="caption-input" placeholder="Write a caption…" value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} />
        <div className="form-row"><Icon name="location" size={20} /><input placeholder="Add location" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        <div className="form-row" onClick={() => setMusicOpen(true)}><Icon name="music" size={20} /><span className="flex1">{track ? `${track.title} · ${track.artist}` : 'Add music'}</span><Icon name="chevron" size={16} /></div>
        {mode === 'post' && (
          <>
            <label className="form-row"><Icon name="shop" size={20} /><span className="flex1">Show as sponsored ad</span><input type="checkbox" checked={sponsored} onChange={(e) => setSponsored(e.target.checked)} /></label>
            {sponsored && <div className="form-row"><span className="muted">Button</span><select value={cta} onChange={(e) => setCta(e.target.value)}>{['Shop now', 'Learn more', 'Sign up', 'Book now', 'Download', 'Contact us'].map((c) => <option key={c}>{c}</option>)}</select></div>}
          </>
        )}
        <div className="form-row"><Icon name="tag" size={20} /><span className="flex1">Tag people</span><Icon name="chevron" size={16} /></div>
        {musicOpen && <MusicPicker onClose={() => { stopMusic(); setMusicOpen(false) }} selected={trackId} onPick={(t) => { setTrackId(t.id); stopMusic(); setMusicOpen(false) }} />}
      </div>
    )
  }

  return (
    <div className="screen create dark">
      <div className="topbar">
        <div className="topbar-left"><button className="icon-btn white" onClick={nav.pop}><Icon name="close" /></button><div className="topbar-title">New {mode}</div></div>
        <div className="topbar-right"><button className="link-blue b" disabled={!selection.length} onClick={next}>Next</button></div>
      </div>
      <div className={`create-preview ${mode !== 'post' ? 'tall' : ''}`}>
        {current ? <Media media={current} active muted /> : <div className="empty white">Upload a photo or video to start</div>}
        {mode === 'story' && !current && null}
      </div>
      <div className="create-bar">
        <b>Recents</b>
        <div className="row gap8">
          {mode === 'post' && <button className={`pill ${multi ? 'on' : ''}`} onClick={() => { setMulti(!multi); setPicked(current ? [current] : []) }}><Icon name="carousel" size={16} /> Select multiple</button>}
          <label className="pill"><Icon name="upload" size={16} /> Upload<input type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} /></label>
        </div>
      </div>
      <div className="create-grid">
        {mode === 'story' && (
          <button className="tile text-tile" onClick={() => nav.replace('storyEditor', {})}><Icon name="text" size={28} /><small>Create</small></button>
        )}
        {library.map((m) => (
          <button key={m.src} className={`tile ${picked.includes(m) ? 'picked' : ''}`} onClick={() => toggle(m)}>
            <Media media={m.type === 'video' ? { ...m, src: m.src.includes('#') ? m.src : `${m.src}#t=0.5` } : m} active={false} />
            {m.type === 'video' && <span className="tile-dur"><Icon name="play" size={10} /></span>}
            {multi && <span className={`pick-num ${picked.includes(m) ? 'on' : ''}`}>{picked.includes(m) ? picked.indexOf(m) + 1 : ''}</span>}
          </button>
        ))}
      </div>
      <div className="mode-switch">
        {['post', 'story', 'reel'].map((m) => <button key={m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); setMulti(false); setPicked([]) }}>{m.toUpperCase()}</button>)}
      </div>
    </div>
  )
}
