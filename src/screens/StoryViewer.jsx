import { useEffect, useRef, useState } from 'react'
import { useApp, formatCount } from '../store.jsx'
import { Icon, Verified } from '../icons.jsx'
import { Avatar, Media } from '../components/common.jsx'
import { OverlayContent, overlayStyle, MusicSticker } from '../components/Overlays.jsx'
import { playTrack, stopMusic } from '../music.js'

const IMAGE_MS = 5000

export default function StoryViewer({ nav, groupIndex = 0, stories: fixedStories, title }) {
  const app = useApp()
  const groups = fixedStories
    ? [{ user: app.account.username, stories: fixedStories, title }]
    : [{ user: app.account.username, stories: app.brandStories }, ...app.friendGroups]
  const [g, setG] = useState(groupIndex)
  const [i, setI] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [liked, setLiked] = useState(false)
  const [muted, setMuted] = useState(false)
  const duration = useRef(IMAGE_MS)
  const holdTimer = useRef(null)
  const held = useRef(false)

  const group = groups[g]
  const story = group?.stories[i]
  const isOwn = group?.user === app.account.username
  const track = story && app.findTrack(story.music)

  const next = () => {
    if (i < group.stories.length - 1) { setI(i + 1); return }
    if (!fixedStories && !isOwn) app.markSeen(group.user)
    if (g < groups.length - 1 && groups[g + 1].stories.length) { setG(g + 1); setI(0) } else nav.pop()
  }
  const prev = () => {
    if (i > 0) setI(i - 1)
    else if (g > 0) { setG(g - 1); setI(Math.max(0, groups[g - 1].stories.length - 1)) }
  }

  const progressRef = useRef(0)
  useEffect(() => { progressRef.current = 0; setProgress(0); duration.current = IMAGE_MS; setLiked(false) }, [g, i])
  useEffect(() => { if (!story) nav.pop() }, [story])

  useEffect(() => {
    if (track && !muted) playTrack(track); else stopMusic()
  }, [story?.id, muted])
  useEffect(() => () => stopMusic(), [])

  useEffect(() => {
    if (paused) return
    let raf; let last = performance.now(); let p = progressRef.current
    const tick = (now) => {
      p += (now - last) / duration.current; last = now
      progressRef.current = Math.min(p, 1); setProgress(progressRef.current)
      if (p >= 1) { next(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, g, i])

  if (!story) return null

  const down = () => { held.current = false; holdTimer.current = setTimeout(() => { held.current = true; setPaused(true) }, 180) }
  const up = (e) => {
    clearTimeout(holdTimer.current)
    if (held.current) { setPaused(false); return }
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX - rect.left < rect.width / 3) prev(); else next()
  }

  return (
    <div className="story-viewer">
      <div className="story-stage">
        <Media media={story.media} filter={story.filter} active={!paused} muted={muted || !!track} loop={false} fit="cover"
          onDuration={(d) => { if (d && isFinite(d)) duration.current = d * 1000 }} />
        <div className="story-shade" />
        <div className="story-overlays">
          {story.overlays.map((o) => (
            <div key={o.id} className="overlay" style={overlayStyle(o)}><OverlayContent o={o} interactive /></div>
          ))}
          {track && <div className="overlay" style={overlayStyle({ x: story.musicX ?? 50, y: story.musicY ?? 88, size: 1 })}><MusicSticker track={track} style={story.musicStyle} playing={!muted} /></div>}
        </div>
        <div className="tap-zone" onPointerDown={down} onPointerUp={up} onPointerLeave={() => { clearTimeout(holdTimer.current); if (held.current) setPaused(false) }} />

        <div className="story-top">
          <div className="bars">
            {group.stories.map((_, k) => (
              <div className="bar" key={k}><div style={{ width: `${k < i ? 100 : k === i ? progress * 100 : 0}%` }} /></div>
            ))}
          </div>
          <div className="story-head">
            <Avatar user={group.user} size={32} />
            <b>{group.title || group.user}</b>{isOwn && app.account.verified && <Verified />}
            <small>{story.time}</small>
            {track && <small className="story-track"><Icon name="music" size={11} /> {track.title}</small>}
            <span className="flex1" />
            {(story.media.type === 'video' || track) && <button className="icon-btn white" onClick={() => setMuted(!muted)}><Icon name={muted ? 'mute' : 'volume'} size={20} /></button>}
            <button className="icon-btn white" onClick={() => setPaused(!paused)}><Icon name={paused ? 'play' : 'pause'} size={18} /></button>
            <button className="icon-btn white" onClick={nav.pop}><Icon name="close" /></button>
          </div>
        </div>
      </div>

      <div className="story-bottom">
        {isOwn ? (
          <div className="story-own">
            <div className="row gap8"><div className="seen-stack">{app.friendGroups.slice(0, 3).map((f) => <Avatar key={f.user} user={f.user} size={22} />)}</div><span>Activity · {formatCount(1204 + i * 87)} views</span></div>
            <div className="row gap14"><button className="icon-btn white" onClick={() => nav.push('create', { mode: 'story' })}><Icon name="plus" /></button><button className="icon-btn white"><Icon name="more" /></button></div>
          </div>
        ) : (
          <>
            <input className="reply" placeholder={`Reply to ${group.user}…`} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} />
            <button className={`icon-btn white ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}><Icon name="heart" filled={liked} /></button>
            <button className="icon-btn white"><Icon name="send" /></button>
          </>
        )}
      </div>
    </div>
  )
}
