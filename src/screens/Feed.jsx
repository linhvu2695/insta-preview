import { useApp } from '../store.jsx'
import { Icon } from '../icons.jsx'
import { Avatar } from '../components/common.jsx'
import Post from '../components/Post.jsx'

export function StoriesTray({ nav }) {
  const app = useApp()
  const own = app.brandStories.length > 0
  return (
    <div className="stories-tray">
      <div className="tray-item" onClick={() => (own ? nav.push('story', { groupIndex: 0 }) : nav.push('create', { mode: 'story' }))}>
        <div className="tray-own">
          <Avatar size={66} ring={own ? 'unseen' : undefined} />
          <span className="tray-plus" onClick={(e) => { e.stopPropagation(); nav.push('create', { mode: 'story' }) }}>+</span>
        </div>
        <span>Your story</span>
      </div>
      {app.friendGroups.map((g, i) => (
        <div className="tray-item" key={g.user} onClick={() => nav.push('story', { groupIndex: i + 1 })}>
          <Avatar user={g.user} size={66} ring={g.seen ? 'seen' : 'unseen'} />
          <span>{g.user}</span>
        </div>
      ))}
    </div>
  )
}

export default function Feed({ nav }) {
  const app = useApp()
  return (
    <div className="screen scroll">
      <div className="topbar home-bar">
        <div className="wordmark">{app.appName}</div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={() => nav.push('activity')}><Icon name="heart" /><span className="badge-dot" /></button>
          <button className="icon-btn" onClick={() => nav.push('messages')}><Icon name="send" /><span className="badge-num">3</span></button>
        </div>
      </div>
      <StoriesTray nav={nav} />
      {app.posts.length === 0 && <div className="empty">No posts yet. Drop images into <code>public/media/feed/</code> or tap + to upload.</div>}
      {app.posts.map((p) => <Post key={p.id} post={p} nav={nav} />)}
      <div className="caught-up"><div className="check-ring"><Icon name="check" size={28} /></div><b>You're all caught up</b><small>You've seen all new posts.</small></div>
    </div>
  )
}
