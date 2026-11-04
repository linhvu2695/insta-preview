// Scans public/media/{feed,stories,reels,music} and writes public/media/_index.json.
// Runs automatically before `npm run dev` and `npm run build`; run `npm run scan` after adding files while dev is running.
import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../public/media/', import.meta.url))
const IMAGE = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
const VIDEO = ['.mp4', '.webm', '.mov', '.m4v']
const AUDIO = ['.mp3', '.m4a', '.wav', '.ogg', '.aac']

function scan(dir, allowed) {
  const full = join(root, dir)
  if (!existsSync(full)) { mkdirSync(full, { recursive: true }); return [] }
  return readdirSync(full)
    .filter((f) => !f.startsWith('.') && statSync(join(full, f)).isFile())
    .filter((f) => allowed.includes(extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => {
      const ext = extname(f).toLowerCase()
      return { path: `${dir}/${f}`, type: VIDEO.includes(ext) ? 'video' : AUDIO.includes(ext) ? 'audio' : 'image' }
    })
}

const visual = [...IMAGE, ...VIDEO]
const index = {
  generatedAt: new Date().toISOString(),
  feed: scan('feed', visual),
  stories: scan('stories', visual),
  reels: scan('reels', visual),
  music: scan('music', AUDIO),
}
writeFileSync(join(root, '_index.json'), JSON.stringify(index, null, 2))
console.log(`[scan-media] feed=${index.feed.length} stories=${index.stories.length} reels=${index.reels.length} music=${index.music.length}`)
