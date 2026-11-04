# insta-preview

A mockup app that shows your own photos and videos the way they would appear on a social feed: feed posts, carousels, sponsored ads, stories, reels, the profile grid, Explore and DMs. It's made for demos, so stakeholders can see how product content will look before it is published.

It runs entirely in the browser: a static Vite + React app with no backend, database or API keys. Media is read from `public/media/`, and more can be uploaded in the browser during a demo.

> It uses the familiar layout of a social app but has a neutral name ("Preview") and generic icons. Change the display name in `public/media/content.json` → `appName`.

---

## Quick start (for humans and agents)

Requirements: **Node.js 20+** and npm.

```bash
cd insta-preview
npm install
npm run dev          # http://localhost:5173 (also reachable on your LAN, because of --host)
```

That's all. `npm run dev` first runs `scripts/scan-media.mjs`, which indexes `public/media/`.

### Agent checklist

1. `node -v` should print v20 or later.
2. `npm install`
3. `npm run dev`. Wait for the `Local: http://localhost:5173/` line.
4. Open that URL. You should see a phone frame with the feed and a demo panel on the left (the panel is hidden on narrow screens).
5. After adding or removing media files while dev is running, run `npm run scan` and then click **Reload media** in the demo panel, or refresh the page.

### Production build

```bash
npm run build        # outputs static files to dist/
npm run preview      # serves dist/ at http://localhost:4173
```

`dist/` is plain static files with relative paths (`base: './'`), so it works on any static host or sub-path.

---

## Adding your content

```
public/media/
├── feed/        images/videos → feed posts (and the profile grid)
├── stories/     images/videos → your story (9:16 works best)
├── reels/       videos (or images, shown with a slow zoom) → Reels
├── music/       .mp3/.m4a/.wav → selectable tracks in the music picker
└── content.json captions, likes, carousels, highlights, account info (all optional)
```

Supported files: `jpg jpeg png webp gif avif mp4 webm mov m4v` for visuals, and `mp3 m4a wav ogg aac` for music.
Files are ordered by name (natural sort), so prefix them `01-`, `02-` and so on to control order.

The files named `sample-*` are placeholders. Delete them when you add real media, and remove their entries from `content.json` as well (entries for missing files are ignored either way).

### content.json

Every key is optional. Items are keyed by their path relative to `public/media/`.

```jsonc
{
  "appName": "Preview",                    // wordmark in the top bar
  "account": {
    "username": "yourbrand", "name": "Your Brand",
    "avatar": "feed/logo.png",            // path under public/media, or null for initials
    "verified": true, "category": "Product/service",
    "bio": "Line 1\nLine 2", "website": "yourbrand.com",
    "followers": 128400, "following": 312,
    "postsCountOffset": 120               // added to the real post count on the profile
  },
  "carousels": [["feed/a.jpg", "feed/b.jpg"]],   // group feed files into one swipeable post
  "items": {
    "feed/a.jpg": {
      "caption": "…", "likes": 4821, "location": "Ho Chi Minh City",
      "sponsored": true, "cta": "Shop now",       // shows the ad variant with a CTA bar
      "filter": "vivid"                           // normal|vivid|warm|cool|fade|drama|mono|retro
    },
    "reels/x.mp4": { "caption": "…", "likes": 18200, "audio": "Golden Hour Drive", "views": 250000 },
    "stories/s.jpg": {
      "music": "Golden Hour Drive", "musicStyle": "card",   // card|lyrics|minimal
      "overlays": [
        { "kind": "text", "text": "Launch day!", "x": 50, "y": 22, "size": 1.3, "style": "classic", "color": "#ffffff" },
        { "kind": "poll", "text": "Which colour?", "options": ["Ocean", "Sunset"], "x": 50, "y": 60 }
      ]
    }
  },
  "highlights": [{ "title": "New", "items": ["stories/s.jpg"] }]
}
```

Overlay `kind` values are `text`, `location`, `mention`, `hashtag`, `link`, `poll`, `quiz` (with `options` and `answer` index), `question`, `countdown` (with `target` ISO date), `slider` (with `emoji`), `addyours` and `emoji`. `x` and `y` are percentages of the screen, and `size` is a scale factor.

For a reel, `audio` can name a built-in track, in which case that music plays over the video. Any other value is shown only as a label, and the video's own sound plays.

---

## What's in the demo

| Area | Features |
|---|---|
| **Feed** | Stories tray, posts, carousels (swipe and dots), double-tap like with heart animation, save, video posts with mute toggle, sponsored ads with a CTA bar, captions with "more", "You're all caught up" |
| **Stories** | Progress bars, tap left/right, hold to pause, video stories, music sticker that actually plays, interactive poll, quiz, emoji slider and question stickers, reply bar, "Activity · views" on your own stories, friends' stories |
| **Story editor** | Templates (Product Drop, This or That, Add Yours, Ask Me, Flash Sale, Quiz, Launch Day, Rate It), text with 5 styles and colours, stickers (location, mention, hashtag, link, poll, questions, countdown, emoji slider, Add Yours, quiz, emoji), music picker with card, lyrics or minimal sticker, filters, gradient backgrounds, drag to move, drag to the trash to delete, size and tilt sliders, share to Your story or Close Friends |
| **Reels** | Full-screen vertical snap scroll, autoplay, tap to mute, hold to pause, double-tap like, action rail, spinning audio disc, scrolling audio label, follow button |
| **Create** | Post, story or reel. Pick from the library or **upload from your computer**, select multiple for a carousel, filters, caption, location, music, "show as sponsored ad" with a CTA choice |
| **Profile** | Story ring, stats, bio and link, Follow/Message/Shop, a toggle between owner and visitor views (pencil icon), highlights, grid, reels and tagged tabs |
| **Explore** | Mixed grid with tall tiles, search with account results |
| **Comments / Share** | Comment sheet with quick emoji, likes and posting, share sheet with "Add to story" and "Copy link" |
| **Activity / DMs** | Notifications list, inbox with notes, chat thread with a shared post |
| **Demo panel** | Dark mode, reload media, phone frame on/off, jump to any screen |

**Music.** The built-in tracks are synthesized live with Web Audio, so there are no audio files and no licensing issues. To use real tracks, drop audio files into `public/media/music/`. They appear under **Your music**. Browsers only play sound after the first click on the page.

**Uploads** made in the browser exist only in that tab. A page refresh clears them. For content that should persist, put the files in `public/media/`.

---

## Deploying

The app is static, so any of these work:

- **Vercel or Netlify:** build command `npm run build`, output directory `dist`. No env vars.
- **Docker:**
  ```bash
  docker build -t insta-preview .
  docker run -p 8080:80 insta-preview      # http://localhost:8080
  ```
- **Any web server:** `npm run build`, then copy `dist/` to it (nginx, S3, GitHub Pages and so on).
- **Over the LAN for a meeting:** `npm run dev` and open `http://<your-ip>:5173` on a phone.

Media is copied into `dist/media/` at build time, so rebuild after changing media.

---

## Project layout

```
scripts/scan-media.mjs   indexes public/media → public/media/_index.json (git-ignored, auto-run)
src/store.jsx            loads content.json + _index.json, builds posts/stories/reels, app state
src/music.js             Web Audio synth tracks + <audio> player for uploaded music
src/App.jsx              phone frame, navigation stack, tab bar, demo panel
src/components/          Post, Avatar/Media/Sheet helpers, story overlays & stickers
src/screens/             Feed, StoryViewer, StoryEditor (templates, music picker), Reels,
                         Profile, Explore (+ PostList), Create, Sheets (comments, share, activity, DMs)
src/styles.css           all styling; light/dark theme via CSS variables
```

To add a story template, add an entry to `TEMPLATES` in `src/screens/StoryEditor.jsx`. To add a built-in track, add an entry to `BUILTIN_TRACKS` in `src/music.js`.

## Troubleshooting

- **"Could not load media: media/_index.json missing":** run `npm run scan`. This happens when you serve the folder without going through `npm run dev` or `npm run build`.
- **New files don't show:** run `npm run scan`, then click Reload media.
- **No sound:** click anywhere on the page first (browser autoplay policy), and check the story or reel isn't muted.
- **`.mov` doesn't play:** Chrome and Firefox only play H.264 `.mov` files. Convert with `ffmpeg -i in.mov -c:v libx264 -pix_fmt yuv420p -movflags +faststart out.mp4`.
