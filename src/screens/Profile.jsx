import { useState } from 'react'
import { useApp, formatCount } from '../store.jsx'
import { Icon, Verified } from '../icons.jsx'
import { Avatar, Media } from '../components/common.jsx'

export function GridTile({ media, badge, onClick, tall, views }) {
  return (
    <button className={`tile ${tall ? 'tall' : ''}`} onClick={onClick}>
      <Media media={media.type === 'video' && !media.src.includes('#') ? { ...media, src: `${media.src}#t=0.5` } : media} active={false} />
      {media.type === 'video' && !badge && views == null && <span className="tile-badge"><Icon name="reels" size={16} /></span>}
      {badge && <span className="tile-badge"><Icon name={badge} size={16} filled={badge === 'play'} /></span>}
      {views != null && <span className="tile-views"><Icon name="play" size={12} /> {formatCount(views)}</span>}
    </button>
  )
}

export default function Profile({ nav }) {
  const app = useApp()
  const a = app.account
  const [tab, setTab] = useState('grid')
  const [visitor, setVisitor] = useState(true)
  const [following, setFollowing] = useState(false)
  const posts = app.posts.length + (a.postsCountOffset || 0)

  return (
    <div className="screen scroll">
      <div className="topbar">
        <div className="topbar-left"><b className="profile-handle">{a.username}</b>{a.verified && <Verified size={16} />}</div>
        <div className="topbar-right">
          <button className="icon-btn" title="Toggle owner / visitor view" onClick={() => setVisitor(!visitor)}><Icon name={visitor ? 'edit' : 'tag'} /></button>
          <button className="icon-btn" onClick={() => nav.push('create', { mode: 'post' })}><Icon name="plus" /></button>
          <button className="icon-btn"><Icon name="more" /></button>
        </div>
      </div>

      <div className="profile-head">
        <Avatar size={86} ring={app.brandStories.length ? 'unseen' : undefined} onClick={() => app.brandStories.length && nav.push('story', { groupIndex: 0 })} />
        <div className="profile-stats">
          <div><b>{formatCount(posts)}</b><span>posts</span></div>
          <div><b>{formatCount(a.followers + (following ? 1 : 0))}</b><span>followers</span></div>
          <div><b>{formatCount(a.following)}</b><span>following</span></div>
        </div>
      </div>
      <div className="profile-bio">
        <b>{a.name}</b>
        {a.category && <span className="muted">{a.category}</span>}
        {(a.bio || '').split('\n').map((l, i) => <span key={i}>{l}</span>)}
        {a.website && <a className="bio-link" href="#" onClick={(e) => e.preventDefault()}><Icon name="link" size={14} /> {a.website}</a>}
        {visitor && <span className="followed-by"><span className="seen-stack">{app.friendGroups.slice(0, 3).map((f) => <Avatar key={f.user} user={f.user} size={18} />)}</span> Followed by <b>{app.friendGroups[0]?.user}</b> and {formatCount(Math.round(a.followers / 900))} others</span>}
      </div>
      <div className="profile-buttons">
        {visitor ? (
          <>
            <button className={following ? 'btn-grey' : 'btn-blue'} onClick={() => setFollowing(!following)}>{following ? 'Following' : 'Follow'}</button>
            <button className="btn-grey" onClick={() => nav.push('messages', { openChat: true })}>Message</button>
            <button className="btn-grey">Shop</button>
          </>
        ) : (
          <>
            <button className="btn-grey">Edit profile</button>
            <button className="btn-grey">Share profile</button>
            <button className="btn-grey">Insights</button>
          </>
        )}
      </div>

      <div className="highlights">
        {!visitor && <div className="hl" onClick={() => nav.push('create', { mode: 'story' })}><div className="hl-new">+</div><span>New</span></div>}
        {app.highlights.map((h) => (
          <div className="hl" key={h.id} onClick={() => nav.push('story', { stories: h.stories, title: h.title })}>
            <div className="hl-cover"><Media media={h.stories[0].media} active={false} /></div>
            <span>{h.title}</span>
          </div>
        ))}
      </div>

      <div className="profile-tabs">
        <button className={tab === 'grid' ? 'on' : ''} onClick={() => setTab('grid')}><Icon name="grid" /></button>
        <button className={tab === 'reels' ? 'on' : ''} onClick={() => setTab('reels')}><Icon name="reels" /></button>
        <button className={tab === 'tagged' ? 'on' : ''} onClick={() => setTab('tagged')}><Icon name="tag" /></button>
      </div>

      {tab === 'grid' && (
        <div className="grid">
          {app.posts.map((p, i) => (
            <GridTile key={p.id} media={p.media[0]} badge={p.media.length > 1 ? 'carousel' : p.media[0].type === 'video' ? 'reels' : null}
              onClick={() => nav.push('postList', { ids: app.posts.map((x) => x.id), start: i, title: 'Posts' })} />
          ))}
        </div>
      )}
      {tab === 'reels' && (
        <div className="grid reels-grid">
          {app.reels.map((r) => <GridTile key={r.id} media={r.media} views={r.views ?? r.likes * 9} tall onClick={() => nav.push('reels', { startId: r.id })} />)}
        </div>
      )}
      {tab === 'tagged' && <div className="empty"><Icon name="tag" size={48} /><b>Photos and videos of you</b><small>When people tag {a.username}, they'll appear here.</small></div>}
    </div>
  )
}
