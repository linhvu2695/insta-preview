import { useState } from 'react'
import { useApp, PEOPLE } from '../store.jsx'
import { Icon, Verified } from '../icons.jsx'
import { Avatar } from '../components/common.jsx'
import Post from '../components/Post.jsx'
import { GridTile } from './Profile.jsx'

export default function Explore({ nav }) {
  const app = useApp()
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)

  // Mix posts and reels; repeat so the grid looks full even with few files.
  const base = [
    ...app.posts.map((p) => ({ kind: 'post', id: p.id, media: p.media[0], multi: p.media.length > 1 })),
    ...app.reels.map((r) => ({ kind: 'reel', id: r.id, media: r.media })),
  ]
  const tiles = base.length ? Array.from({ length: Math.max(15, base.length) }, (_, i) => base[i % base.length]) : []
  const accounts = [{ username: app.account.username, brand: true }, ...PEOPLE].filter((p) => p.username.includes(q.toLowerCase()))

  return (
    <div className="screen scroll">
      <div className="explore-search">
        {focused && <button className="icon-btn" onClick={() => { setFocused(false); setQ('') }}><Icon name="back" /></button>}
        <div className="search-box"><Icon name="search" size={16} /><input placeholder="Search" value={q} onFocus={() => setFocused(true)} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {focused ? (
        <div className="list">
          <div className="list-title">{q ? 'Accounts' : 'Recent'}</div>
          {accounts.map((p) => (
            <div className="list-row" key={p.username} onClick={() => p.brand && nav.setTab('profile')}>
              <Avatar user={p.brand ? undefined : p.username} size={44} />
              <div className="flex1"><div className="row gap4"><b>{p.username}</b>{p.brand && app.account.verified && <Verified />}</div><small className="muted">{p.brand ? `${app.account.name} · ${app.account.category || ''}` : 'Followed by minh.creates'}</small></div>
              <Icon name="close" size={16} />
            </div>
          ))}
        </div>
      ) : (
        <div className="explore-grid">
          {tiles.map((t, i) => (
            <GridTile key={i} media={t.media} tall={t.kind === 'reel' || i % 10 === 2 || i % 10 === 5}
              badge={t.kind === 'reel' ? 'reels' : t.multi ? 'carousel' : null}
              onClick={() => (t.kind === 'reel' ? nav.push('reels', { startId: t.id }) : nav.push('postList', { ids: [t.id, ...app.posts.filter((p) => p.id !== t.id).map((p) => p.id)], start: 0, title: 'Explore' }))} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PostList({ nav, ids, start = 0, title }) {
  const app = useApp()
  const posts = ids.map((id) => app.posts.find((p) => p.id === id)).filter(Boolean)
  return (
    <div className="screen scroll" ref={(el) => { if (el && !el.dataset.done) { el.dataset.done = 1; setTimeout(() => el.querySelectorAll('.post')[start]?.scrollIntoView(), 0) } }}>
      <div className="topbar sticky"><div className="topbar-left"><button className="icon-btn" onClick={nav.pop}><Icon name="back" /></button><div className="topbar-title">{title}</div></div></div>
      {posts.map((p) => <Post key={p.id} post={p} nav={nav} />)}
    </div>
  )
}
