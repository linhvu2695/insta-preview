import { useRef, useState } from 'react'
import { useApp, formatCount } from '../store.jsx'
import { Icon, Verified } from '../icons.jsx'
import { Avatar, Media, HeartBurst, useDoubleTap } from './common.jsx'

export default function Post({ post, nav }) {
  const app = useApp()
  const { account } = app
  const [slide, setSlide] = useState(0)
  const [burst, setBurst] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [muted, setMuted] = useState(true)
  const scroller = useRef(null)
  const isLiked = app.liked.has(post.id)
  const isSaved = app.saved.has(post.id)
  const likes = post.likes + (isLiked ? 1 : 0)
  const tap = useDoubleTap(() => { app.like(post.id); setBurst(Date.now()) }, () => setMuted((m) => !m))
  const hasVideo = post.media.some((m) => m.type === 'video')

  const onScroll = (e) => {
    const el = e.currentTarget
    setSlide(Math.round(el.scrollLeft / el.clientWidth))
  }
  const caption = post.caption || ''
  const short = caption.length > 90 && !expanded

  return (
    <article className="post">
      <header className="post-head">
        <Avatar size={32} ring={app.brandStories.length ? 'unseen' : undefined}
          onClick={() => app.brandStories.length && nav.push('story', { groupIndex: 0 })} />
        <div className="post-user">
          <div className="row gap4"><b onClick={() => nav.setTab('profile')}>{account.username}</b>{account.verified && <Verified />}</div>
          {post.sponsored ? <small>Sponsored</small> : post.location ? <small>{post.location}</small> : post.music ? <small><Icon name="music" size={11} /> {post.music}</small> : null}
        </div>
        <button className="icon-btn"><Icon name="more" /></button>
      </header>

      <div className="post-media" onClick={tap}>
        <div className="carousel" ref={scroller} onScroll={onScroll}>
          {post.media.map((m, i) => (
            <div className="slide" key={i}><Media media={m} filter={post.filter} active={i === slide} muted={muted} /></div>
          ))}
        </div>
        {post.media.length > 1 && <div className="slide-count">{slide + 1}/{post.media.length}</div>}
        {hasVideo && <button className="mute-badge" onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}><Icon name={muted ? 'mute' : 'volume'} size={14} /></button>}
        <HeartBurst show={burst} />
      </div>

      {post.sponsored && (
        <a className="cta-bar" onClick={(e) => e.preventDefault()} href="#">
          <span>{post.cta}</span><Icon name="chevron" size={16} />
        </a>
      )}

      <div className="post-actions">
        <div className="row gap14">
          <button className={`icon-btn ${isLiked ? 'liked' : ''}`} onClick={() => app.toggleLike(post.id)}><Icon name="heart" filled={isLiked} /></button>
          <button className="icon-btn" onClick={() => nav.push('comments', { kind: 'post', id: post.id })}><Icon name="comment" /></button>
          <button className="icon-btn" onClick={() => nav.push('share', { post })}><Icon name="send" /></button>
        </div>
        {post.media.length > 1 && (
          <div className="dots">{post.media.map((_, i) => <i key={i} className={i === slide ? 'on' : ''} />)}</div>
        )}
        <button className="icon-btn" onClick={() => app.toggleSave(post.id)}><Icon name="bookmark" filled={isSaved} /></button>
      </div>

      <div className="post-meta">
        <b>{formatCount(likes)} likes</b>
        {caption && (
          <p className="caption">
            <b>{account.username}</b>{' '}
            {short ? <>{caption.slice(0, 90)}… <span className="muted" onClick={() => setExpanded(true)}>more</span></> : caption}
          </p>
        )}
        {post.comments.length > 0 && (
          <button className="muted link-btn" onClick={() => nav.push('comments', { kind: 'post', id: post.id })}>
            View all {post.comments.length + 20} comments
          </button>
        )}
        <small className="muted time">{post.time === 'now' ? 'Just now' : `${post.time} ago`}</small>
      </div>
    </article>
  )
}
