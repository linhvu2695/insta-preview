import { useState } from 'react'
import { useApp, PEOPLE } from '../store.jsx'
import { Icon } from '../icons.jsx'
import { Avatar, Sheet } from '../components/common.jsx'

const QUICK = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂']

export function Comments({ nav, kind, id }) {
  const app = useApp()
  const item = (kind === 'reel' ? app.reels : app.posts).find((p) => p.id === id)
  const [text, setText] = useState('')
  const [likedC, setLikedC] = useState(() => new Set())
  if (!item) return null
  const send = () => { if (text.trim()) { app.addComment(kind, id, text.trim()); setText('') } }
  return (
    <Sheet title="Comments" onClose={nav.pop} tall>
      <div className="comments">
        {item.caption && (
          <div className="comment"><Avatar size={32} /><div className="flex1"><b>{app.account.username}</b> <small className="muted">{item.time || '1d'}</small><p>{item.caption}</p></div></div>
        )}
        {item.comments.map((c) => (
          <div className="comment" key={c.id}>
            <Avatar user={c.user} size={32} />
            <div className="flex1"><b>{c.user}</b> <small className="muted">{c.time}</small><p>{c.text}</p><small className="muted">Reply</small></div>
            <button className={`icon-btn small ${likedC.has(c.id) ? 'liked' : ''}`} onClick={() => setLikedC((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n })}>
              <Icon name="heart" size={14} filled={likedC.has(c.id)} /><small>{c.likes + (likedC.has(c.id) ? 1 : 0) || ''}</small>
            </button>
          </div>
        ))}
      </div>
      <div className="comment-compose">
        <div className="quick-emoji">{QUICK.map((e) => <button key={e} onClick={() => setText((t) => t + e)}>{e}</button>)}</div>
        <div className="row gap8">
          <Avatar size={32} />
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={`Add a comment for ${app.account.username}…`} />
          <button className="link-blue" disabled={!text.trim()} onClick={send}>Post</button>
        </div>
      </div>
    </Sheet>
  )
}

export function Share({ nav, post }) {
  const app = useApp()
  const [sent, setSent] = useState(() => new Set())
  return (
    <Sheet onClose={nav.pop}>
      <div className="search-box"><Icon name="search" size={16} /><input placeholder="Search" /></div>
      <div className="share-grid">
        {PEOPLE.map((p) => (
          <button key={p.username} onClick={() => setSent((s) => new Set(s).add(p.username))}>
            <Avatar user={p.username} size={60} />
            <small>{p.username}</small>
            {sent.has(p.username) && <span className="sent-tag">Sent</span>}
          </button>
        ))}
      </div>
      <div className="share-actions">
        <button onClick={() => { nav.pop(); nav.push('storyEditor', { media: post?.media?.[0] }) }}><span><Icon name="plus" /></span>Add to story</button>
        <button onClick={() => { nav.pop(); nav.toast('Link copied') }}><span><Icon name="link" /></span>Copy link</button>
        <button onClick={() => nav.pop()}><span><Icon name="send" /></span>Share to…</button>
        <button onClick={() => { if (post?.id) app.toggleSave(post.id); nav.pop() }}><span><Icon name="bookmark" /></span>Save</button>
      </div>
    </Sheet>
  )
}

export function Activity({ nav }) {
  const app = useApp()
  const thumbs = [...app.posts.map((p) => p.media[0]), ...app.reels.map((r) => r.media)]
  const rows = [
    { u: 0, t: 'liked your post.', when: '2m', thumb: 0 },
    { u: 1, t: 'started following you.', when: '15m', follow: true },
    { u: 2, t: 'commented: "Where can I get one? 😍"', when: '1h', thumb: 1 },
    { u: 3, t: 'and 1,284 others liked your reel.', when: '3h', thumb: thumbs.length - 1 },
    { u: 4, t: 'mentioned you in a story.', when: '5h', thumb: 2 },
    { u: 5, t: 'shared your post.', when: '1d', thumb: 0 },
    { u: 6, t: 'started following you.', when: '2d', follow: true },
    { u: 7, t: 'liked your comment: "Thank you!"', when: '3d', thumb: 1 },
  ]
  return (
    <div className="screen scroll">
      <div className="topbar sticky"><div className="topbar-left"><button className="icon-btn" onClick={nav.pop}><Icon name="back" /></button><div className="topbar-title">Notifications</div></div></div>
      <div className="list">
        {[['Today', rows.slice(0, 4)], ['This week', rows.slice(4)]].map(([label, rs]) => (
          <div key={label}>
            <div className="list-title">{label}</div>
            {rs.map((r, i) => {
              const th = thumbs[r.thumb % Math.max(1, thumbs.length)]
              return (
                <div className="list-row" key={i}>
                  <Avatar user={PEOPLE[r.u].username} size={44} />
                  <p className="flex1"><b>{PEOPLE[r.u].username}</b> {r.t} <span className="muted">{r.when}</span></p>
                  {r.follow ? <button className="btn-blue small">Follow back</button>
                    : th && (th.type === 'video' ? <video className="notif-thumb" src={`${th.src}#t=0.5`} muted /> : <img className="notif-thumb" src={th.src} alt="" />)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Messages({ nav, openChat }) {
  const app = useApp()
  const [chat, setChat] = useState(openChat ? PEOPLE[0].username : null)
  const [msgs, setMsgs] = useState([
    { me: false, text: 'Hi! Is the new collection available in other colours?' },
    { me: true, text: 'Yes! Ocean blue and sunset orange are coming next week 🙌' },
    { me: false, text: 'Amazing, can’t wait' },
  ])
  const [text, setText] = useState('')
  const firstPost = app.posts[0]

  if (chat) {
    return (
      <div className="screen chat">
        <div className="topbar sticky"><div className="topbar-left"><button className="icon-btn" onClick={() => (openChat ? nav.pop() : setChat(null))}><Icon name="back" /></button><Avatar user={chat} size={30} /><div className="topbar-title">{chat}</div></div><div className="topbar-right"><Icon name="camera" /></div></div>
        <div className="chat-body scroll">
          {firstPost && (
            <div className="bubble-row me">
              <div className="shared-post">
                <div className="row gap8 sp-head"><Avatar size={22} /><b>{app.account.username}</b></div>
                {firstPost.media[0].type === 'video' ? <video src={firstPost.media[0].src} muted /> : <img src={firstPost.media[0].src} alt="" />}
                <p><b>{app.account.username}</b> {firstPost.caption.slice(0, 60)}</p>
              </div>
            </div>
          )}
          {msgs.map((m, i) => <div key={i} className={`bubble-row ${m.me ? 'me' : ''}`}>{!m.me && <Avatar user={chat} size={24} />}<div className="bubble">{m.text}</div></div>)}
        </div>
        <div className="chat-compose">
          <div className="cam-dot"><Icon name="camera" size={18} /></div>
          <input placeholder="Message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { setMsgs([...msgs, { me: true, text }]); setText('') } }} />
          <Icon name="music" size={20} /><Icon name="sticker" size={20} />
        </div>
      </div>
    )
  }
  return (
    <div className="screen scroll">
      <div className="topbar sticky"><div className="topbar-left"><button className="icon-btn" onClick={nav.pop}><Icon name="back" /></button><div className="topbar-title">{app.account.username}</div></div><div className="topbar-right"><Icon name="edit" /></div></div>
      <div className="explore-search"><div className="search-box"><Icon name="search" size={16} /><input placeholder="Search" /></div></div>
      <div className="notes-row">
        <div className="note"><div className="note-bubble">Launch week 🚀</div><Avatar size={60} /><small>Your note</small></div>
        {PEOPLE.slice(0, 4).map((p, i) => <div className="note" key={p.username}>{i % 2 === 0 && <div className="note-bubble">{['☕️ coffee?', 'new drop!!'][i / 2]}</div>}<Avatar user={p.username} size={60} /><small>{p.username}</small></div>)}
      </div>
      <div className="list">
        <div className="list-title row between"><span>Messages</span><span className="link-blue">Requests (4)</span></div>
        {PEOPLE.map((p, i) => (
          <div className="list-row" key={p.username} onClick={() => setChat(p.username)}>
            <Avatar user={p.username} size={52} ring={i < 2 ? 'unseen' : undefined} />
            <div className="flex1"><b className={i < 3 ? '' : 'normal'}>{p.username}</b><small className={i < 3 ? 'unread' : 'muted'}>{['Amazing, can’t wait · 2m', 'Sent a reel · 1h', 'Where can I buy? · 3h', 'Liked a message · 1d', 'Seen · 2d', 'Thanks! · 3d', 'Sent a post · 1w', 'Seen · 2w'][i]}</small></div>
            {i < 3 && <span className="unread-dot" />}<Icon name="camera" size={22} />
          </div>
        ))}
      </div>
    </div>
  )
}
