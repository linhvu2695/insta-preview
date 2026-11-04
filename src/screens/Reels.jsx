import { useEffect, useRef, useState } from 'react'
import { useApp, formatCount } from '../store.jsx'
import { Icon, Verified } from '../icons.jsx'
import { Avatar, Media, HeartBurst, useDoubleTap } from '../components/common.jsx'
import { artFor } from '../components/Overlays.jsx'
import { playTrack, stopMusic } from '../music.js'

function Reel({ reel, active, nav, muted, setMuted }) {
  const app = useApp()
  const [burst, setBurst] = useState(0)
  const [following, setFollowing] = useState(false)
  const [paused, setPaused] = useState(false)
  const isLiked = app.liked.has(reel.id)
  const tap = useDoubleTap(() => { app.like(reel.id); setBurst(Date.now()) }, () => setMuted(!muted))
  const track = app.findTrack(reel.audio)

  // A reel can carry a picked track; images play with a slow zoom like a slideshow reel.
  useEffect(() => {
    if (active && track && !muted) playTrack(track)
    else if (active) stopMusic()
  }, [active, muted, track?.id])
  useEffect(() => { setPaused(false) }, [active])

  return (
    <section className="reel">
      <div className="reel-media" onClick={tap} onContextMenu={(e) => e.preventDefault()}
        onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
        <Media media={reel.media} filter={reel.filter} active={active && !paused} muted={muted || !!track} kenBurns={reel.media.type === 'image'} />
        <HeartBurst show={burst} />
        {muted && active && <div className="mute-hint"><Icon name="mute" size={18} /></div>}
      </div>
      <div className="reel-gradient" />
      <div className="reel-rail">
        <button className={isLiked ? 'liked' : ''} onClick={() => app.toggleLike(reel.id)}><Icon name="heart" filled={isLiked} size={28} /><span>{formatCount(reel.likes + (isLiked ? 1 : 0))}</span></button>
        <button onClick={() => nav.push('comments', { kind: 'reel', id: reel.id })}><Icon name="comment" size={28} /><span>{formatCount(reel.comments.length + 140)}</span></button>
        <button onClick={() => nav.toast('Reposted to your followers')}><Icon name="repost" size={26} /><span>{formatCount(Math.round(reel.likes / 40))}</span></button>
        <button onClick={() => nav.push('share', { post: { media: [reel.media] } })}><Icon name="send" size={26} /><span>{formatCount(Math.round(reel.likes / 25))}</span></button>
        <button><Icon name="moreV" size={24} /></button>
        <div className={`reel-disc ${active && !muted ? 'spin' : ''}`} style={{ background: track ? artFor(track) : '#333' }}><Avatar size={20} /></div>
      </div>
      <div className="reel-info">
        <div className="row gap8">
          <Avatar size={32} />
          <b>{app.account.username}</b>{app.account.verified && <Verified />}
          <button className={`follow-btn ${following ? 'on' : ''}`} onClick={() => setFollowing(!following)}>{following ? 'Following' : 'Follow'}</button>
        </div>
        {reel.caption && <p className="reel-caption">{reel.caption}</p>}
        <div className="reel-audio">
          <Icon name="music" size={13} />
          <div className="marquee"><span>{track ? `${track.title} · ${track.artist}` : `${app.account.username} · ${reel.audio}`}</span></div>
        </div>
      </div>
    </section>
  )
}

export default function Reels({ nav, startId }) {
  const app = useApp()
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState(false)
  const scroller = useRef(null)

  useEffect(() => {
    if (!startId) return
    const idx = app.reels.findIndex((r) => r.id === startId)
    if (idx > 0) { scroller.current.scrollTop = idx * scroller.current.clientHeight; setActive(idx) }
  }, [startId])
  useEffect(() => () => stopMusic(), [])

  const onScroll = (e) => {
    const el = e.currentTarget
    const idx = Math.round(el.scrollTop / el.clientHeight)
    if (idx !== active) setActive(idx)
  }

  return (
    <div className="screen reels-screen">
      <div className="reels-top">
        {nav.canGoBack ? <button className="icon-btn white" onClick={nav.pop}><Icon name="back" /></button> : <b className="reels-title">Reels</b>}
        <button className="icon-btn white" onClick={() => nav.push('create', { mode: 'reel' })}><Icon name="camera" /></button>
      </div>
      <div className="reels-scroller" ref={scroller} onScroll={onScroll}>
        {app.reels.length === 0 && <div className="empty white">No reels yet. Drop videos into <code>public/media/reels/</code> or tap the camera to upload.</div>}
        {app.reels.map((r, i) => <Reel key={r.id} reel={r} active={i === active} nav={nav} muted={muted} setMuted={setMuted} />)}
      </div>
    </div>
  )
}
