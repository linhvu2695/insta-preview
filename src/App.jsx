import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from './store.jsx'
import { Icon } from './icons.jsx'
import { Avatar } from './components/common.jsx'
import Feed from './screens/Feed.jsx'
import Explore, { PostList } from './screens/Explore.jsx'
import Reels from './screens/Reels.jsx'
import Profile from './screens/Profile.jsx'
import StoryViewer from './screens/StoryViewer.jsx'
import StoryEditor from './screens/StoryEditor.jsx'
import Create from './screens/Create.jsx'
import { Comments, Share, Activity, Messages } from './screens/Sheets.jsx'

const TABS = { home: Feed, explore: Explore, reels: Reels, profile: Profile }
const OVERLAYS = { story: StoryViewer, storyEditor: StoryEditor, create: Create, comments: Comments, share: Share, activity: Activity, messages: Messages, postList: PostList, reels: Reels }
const SHEETS = new Set(['comments', 'share'])
const IMMERSIVE = new Set(['story', 'storyEditor', 'create', 'messages'])
const DARK = new Set(['story', 'storyEditor', 'create', 'reels'])

function StatusBar({ dark }) {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 30000); return () => clearInterval(t) }, [])
  return (
    <div className={`statusbar ${dark ? 'dark' : ''}`}>
      <b>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}</b>
      <span className="sb-icons">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0zM1 4.4a9.9 9.9 0 0 1 14 0l-1.4 1.4a7.9 7.9 0 0 0-11.2 0z" fill="currentColor" /></svg>
        <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="17" height="8" rx="1.8" fill="currentColor" /><rect x="23.5" y="4" width="1.8" height="4" rx=".9" fill="currentColor" opacity=".4" /></svg>
      </span>
    </div>
  )
}

export default function App() {
  const app = useApp()
  const [tab, setTabState] = useState('home')
  const [stack, setStack] = useState([])
  const [toastMsg, setToastMsg] = useState(null)
  const [frame, setFrame] = useState(true)

  const toast = useCallback((m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2200) }, [])
  const nav = useMemo(() => ({
    push: (type, props = {}) => setStack((s) => [...s, { type, props, key: Date.now() + Math.random() }]),
    pop: () => setStack((s) => s.slice(0, -1)),
    replace: (type, props = {}) => setStack((s) => [...s.slice(0, -1), { type, props, key: Date.now() + Math.random() }]),
    reset: (t) => { setStack([]); if (t) setTabState(t) },
    setTab: (t) => { setStack([]); setTabState(t) },
    toast,
  }), [toast])

  const top = stack[stack.length - 1]
  const hideBar = top && IMMERSIVE.has(top.type)
  const dark = top ? DARK.has(top.type) && !SHEETS.has(top.type) : tab === 'reels'
  const TabScreen = TABS[tab]

  return (
    <div className={`stage ${frame ? 'framed' : 'bare'}`}>
      <aside className="demo-panel">
        <div className="demo-title">{app.appName} <span>demo preview</span></div>
        <p>Your media, shown as feed posts, stories and reels. Tap <b>+</b> to upload more or build a story with templates, stickers and music.</p>
        <div className="demo-actions">
          <button onClick={() => app.setTheme(app.theme === 'dark' ? 'light' : 'dark')}><Icon name={app.theme === 'dark' ? 'sun' : 'moon'} size={16} /> {app.theme === 'dark' ? 'Light' : 'Dark'} mode</button>
          <button onClick={() => { app.reload(); nav.reset('home'); toast('Media reloaded') }}><Icon name="repost" size={16} /> Reload media</button>
          <button onClick={() => setFrame(!frame)}><Icon name="grid" size={16} /> {frame ? 'Hide' : 'Show'} phone frame</button>
        </div>
        <div className="demo-jump">
          <span>Jump to</span>
          {[['Feed', () => nav.setTab('home')], ['Story', () => { nav.reset(); nav.push('story', { groupIndex: 0 }) }], ['Story editor', () => { nav.reset(); nav.push('storyEditor', {}) }], ['Reels', () => nav.setTab('reels')], ['Explore', () => nav.setTab('explore')], ['Profile', () => nav.setTab('profile')], ['Messages', () => { nav.reset(); nav.push('messages') }], ['Create post', () => { nav.reset(); nav.push('create', { mode: 'post' }) }]].map(([l, f]) => <button key={l} onClick={f}>{l}</button>)}
        </div>
      </aside>

      <div className="phone">
        <div className="phone-screen">
          <StatusBar dark={dark} />
          <div className="viewport">
            <div className="layer"><TabScreen nav={{ ...nav, canGoBack: false }} key={tab} /></div>
            {stack.map((s, i) => {
              const C = OVERLAYS[s.type]
              const covered = stack.slice(i + 1).some((x) => !SHEETS.has(x.type))
              return (
                <div key={s.key} className={`layer overlay-layer ${SHEETS.has(s.type) ? 'sheet-layer' : ''}`} style={{ visibility: covered ? 'hidden' : 'visible' }}>
                  <C nav={{ ...nav, canGoBack: true }} {...s.props} />
                </div>
              )
            })}
          </div>
          {!hideBar && (
            <nav className={`tabbar ${dark ? 'dark' : ''}`}>
              <button onClick={() => nav.setTab('home')}><Icon name={tab === 'home' && !stack.length ? 'homeFill' : 'home'} size={26} /></button>
              <button onClick={() => nav.setTab('explore')}><Icon name="search" size={26} strokeWidth={tab === 'explore' ? 2.6 : 1.8} /></button>
              <button onClick={() => nav.push('create', { mode: 'post' })}><Icon name="plus" size={26} /></button>
              <button onClick={() => nav.setTab('reels')}><Icon name="reels" size={26} strokeWidth={tab === 'reels' ? 2.6 : 1.8} /></button>
              <button className={tab === 'profile' ? 'on' : ''} onClick={() => nav.setTab('profile')}><Avatar size={26} /></button>
            </nav>
          )}
          {toastMsg && <div className="toast">{toastMsg}</div>}
        </div>
      </div>
    </div>
  )
}
