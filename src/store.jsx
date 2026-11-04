import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { BUILTIN_TRACKS } from './music.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const BASE = import.meta.env.BASE_URL
export const mediaUrl = (p) => (p.startsWith('blob:') || p.startsWith('http') || p.startsWith('data:') ? p : `${BASE}media/${p}`)

export const PEOPLE = [
  { username: 'minh.creates', colors: ['#f093fb', '#f5576c'] },
  { username: 'thao.daily', colors: ['#4facfe', '#00f2fe'] },
  { username: 'designbyan', colors: ['#43e97b', '#38f9d7'] },
  { username: 'quang_photo', colors: ['#fa709a', '#fee140'] },
  { username: 'lena.studio', colors: ['#a18cd1', '#fbc2eb'] },
  { username: 'hoang.travels', colors: ['#ff9a9e', '#fad0c4'] },
  { username: 'the.kai.edit', colors: ['#30cfd0', '#330867'] },
  { username: 'mai.morning', colors: ['#f6d365', '#fda085'] },
]

const COMMENT_POOL = [
  'Obsessed with this 😍', 'Where can I get one?', 'The colours are perfect', 'Need this in my life',
  'Just ordered mine!', 'This is so clean 🔥', 'Take my money', 'Love the details', 'Wow 👏👏', 'Drop the link please!',
]
const TIMES = ['2h', '5h', '1d', '2d', '3d', '5d', '1w', '2w']

function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) }
export function sampleComments(seed, n = 4) {
  const h = hash(seed)
  return Array.from({ length: n }, (_, i) => ({
    id: `${seed}-c${i}`,
    user: PEOPLE[(h + i * 3) % PEOPLE.length].username,
    text: COMMENT_POOL[(h + i * 7) % COMMENT_POOL.length],
    likes: (h >> i) % 40,
    time: TIMES[(h + i) % TIMES.length],
  }))
}

const FRIEND_STORIES = [
  { bg: 'linear-gradient(160deg,#f093fb,#f5576c)', text: 'Weekend mode ☀️' },
  { bg: 'linear-gradient(160deg,#4facfe,#00f2fe)', text: 'New desk setup' },
  { bg: 'linear-gradient(160deg,#43e97b,#38f9d7)', text: 'Morning run done ✅' },
  { bg: 'linear-gradient(160deg,#fa709a,#fee140)', text: 'Golden hour 📸' },
  { bg: 'linear-gradient(160deg,#a18cd1,#fbc2eb)', text: 'Studio day' },
]

function build(content, index) {
  const items = content.items || {}
  const meta = (p) => items[p] || {}
  const grouped = new Set()
  const posts = []
  const carousels = (content.carousels || []).map((g) => g.filter((p) => index.feed.some((f) => f.path === p)))
  const typeOf = (p) => index.feed.find((f) => f.path === p)?.type || 'image'

  // Keep folder order; a carousel appears where its first file would be.
  for (const f of index.feed) {
    if (grouped.has(f.path)) continue
    const group = carousels.find((g) => g.includes(f.path))
    const paths = group && group.length ? group : [f.path]
    paths.forEach((p) => grouped.add(p))
    posts.push(makePost(paths[0], paths.map((p) => ({ src: mediaUrl(p), type: typeOf(p), path: p })), meta(paths[0]), posts.length))
  }

  const reels = index.reels.map((r, i) => ({
    id: `reel-${r.path}`, media: { src: mediaUrl(r.path), type: r.type, path: r.path },
    caption: meta(r.path).caption || '', likes: meta(r.path).likes ?? 1200 + i * 317,
    audio: meta(r.path).audio || 'Original audio', comments: sampleComments(r.path, 6), views: meta(r.path).views,
  }))

  const brandStories = index.stories.map((s) => makeStory(s.path, s.type, meta(s.path)))
  const friendGroups = PEOPLE.slice(0, 5).map((p, i) => ({
    user: p.username, colors: p.colors, seen: i > 2,
    stories: [{ id: `friend-${i}`, media: { bg: FRIEND_STORIES[i].bg, type: 'color' }, overlays: [{ id: 'o', kind: 'text', text: FRIEND_STORIES[i].text, x: 50, y: 45, size: 1.2, style: 'classic', color: '#fff' }], time: TIMES[i] }],
  }))

  const highlights = (content.highlights || []).map((h, i) => ({
    id: `hl-${i}`, title: h.title, cover: h.cover,
    stories: (h.items || []).map((p) => {
      const found = index.stories.find((s) => s.path === p) || index.feed.find((s) => s.path === p)
      return found ? makeStory(found.path, found.type, meta(found.path)) : null
    }).filter(Boolean),
  })).filter((h) => h.stories.length)

  const musicFiles = index.music.map((m) => ({
    id: `file-${m.path}`, title: m.path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    artist: 'Your music', src: mediaUrl(m.path), mood: 'Uploaded',
  }))

  return { posts, reels, brandStories, friendGroups, highlights, musicFiles }
}

export function makePost(id, media, m = {}, i = 0) {
  return {
    id: `post-${id}`, media, caption: m.caption || '', likes: m.likes ?? 800 + i * 211,
    location: m.location, sponsored: !!m.sponsored, cta: m.cta || 'Learn more',
    comments: sampleComments(id, 5), time: m.time || TIMES[i % TIMES.length],
    filter: m.filter, music: m.music,
  }
}
export function makeStory(path, type, m = {}) {
  return {
    id: `story-${path}-${Math.random().toString(36).slice(2, 7)}`,
    media: { src: mediaUrl(path), type, path }, overlays: (m.overlays || []).map((o, i) => ({ id: `o${i}`, ...o })),
    music: m.music, musicStyle: m.musicStyle || 'card', filter: m.filter, time: m.time || '3h',
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(() => new Set())
  const [saved, setSaved] = useState(() => new Set())
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('ip-theme') || 'light' } catch { return 'light' } })

  const load = useCallback(async () => {
    try {
      const bust = `?t=${Date.now()}`
      const [content, index] = await Promise.all([
        fetch(`${BASE}media/content.json${bust}`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
        fetch(`${BASE}media/_index.json${bust}`).then((r) => { if (!r.ok) throw new Error('media/_index.json missing — run `npm run scan`'); return r.json() }),
      ])
      const account = { username: 'yourbrand', name: 'Your Brand', followers: 1000, following: 100, ...(content.account || {}) }
      setState({ appName: content.appName || 'Preview', account, ...build(content, index) })
      setError(null)
    } catch (e) { setError(e.message) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('ip-theme', theme) } catch { /* ignore */ }
  }, [theme])

  const api = useMemo(() => {
    if (!state) return null
    const tracks = [...BUILTIN_TRACKS, ...state.musicFiles]
    const findTrack = (key) => key && tracks.find((t) => t.id === key || t.title.toLowerCase() === String(key).toLowerCase())
    const update = (patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
    const toggle = (setter) => (id) => setter((old) => { const n = new Set(old); n.has(id) ? n.delete(id) : n.add(id); return n })
    return {
      ...state, tracks, findTrack, theme, setTheme, reload: load,
      liked, saved, toggleLike: toggle(setLiked), toggleSave: toggle(setSaved),
      like: (id) => setLiked((old) => new Set(old).add(id)),
      addPost: (post) => update((s) => ({ posts: [post, ...s.posts] })),
      addReel: (reel) => update((s) => ({ reels: [reel, ...s.reels] })),
      addStory: (story) => update((s) => ({ brandStories: [...s.brandStories, story] })),
      addComment: (kind, id, text) => update((s) => {
        const key = kind === 'reel' ? 'reels' : 'posts'
        return { [key]: s[key].map((p) => (p.id === id ? { ...p, comments: [...p.comments, { id: `c${Date.now()}`, user: s.account.username, text, likes: 0, time: 'now' }] } : p)) }
      }),
      markSeen: (user) => update((s) => ({ friendGroups: s.friendGroups.map((g) => (g.user === user ? { ...g, seen: true } : g)) })),
    }
  }, [state, liked, saved, theme, load])

  if (error) return <div className="boot">Could not load media: {error}</div>
  if (!api) return <div className="boot">Loading…</div>
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function formatCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '')}M`
  if (n >= 1e4) return `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '')}K`
  return n.toLocaleString('en-US')
}
