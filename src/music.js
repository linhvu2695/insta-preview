// Tiny music engine. Built-in tracks are synthesized live with Web Audio (no audio files, no licensing issues).
// Audio files dropped in public/media/music/ are played with a plain <audio> element.

export const BUILTIN_TRACKS = [
  { id: 'golden-hour', title: 'Golden Hour Drive', artist: 'Studio Loops', bpm: 96, wave: 'triangle', mood: 'Chill',
    chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.',
    lyrics: ['Windows down, the city glows', 'Chasing light where the river goes', 'Golden hour, take it slow', 'This is how the good days go'] },
  { id: 'neon-pulse', title: 'Neon Pulse', artist: 'Night Shift', bpm: 122, wave: 'sawtooth', mood: 'Energetic',
    chords: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]],
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
    lyrics: ['Lights flash, hearts race', 'Meet me in the neon space', 'Turn it up, pick up the pace', 'Every beat a new embrace'] },
  { id: 'soft-morning', title: 'Soft Morning', artist: 'Paper Planes', bpm: 78, wave: 'sine', mood: 'Calm',
    chords: [[60, 64, 67], [57, 60, 64], [65, 69, 72], [55, 59, 62]],
    kick: 'x.......x.......', snare: '........x.......', hat: '....x.......x...',
    lyrics: ['Coffee steam and quiet light', 'Nothing rushed, everything right', 'Soft morning, hold on tight', 'Let the day unfold its flight'] },
  { id: 'runway', title: 'Runway', artist: 'Mono Club', bpm: 110, wave: 'square', mood: 'Fashion',
    chords: [[52, 55, 59], [52, 55, 59], [48, 52, 55], [50, 53, 57]],
    kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: '.x.x.x.x.x.x.x.x',
    lyrics: ['Step out, own the floor', 'Every look worth waiting for', 'Runway lights, give me more', 'This is what we came here for'] },
  { id: 'summer-sale', title: 'Summer Sale', artist: 'Bright Side', bpm: 128, wave: 'triangle', mood: 'Upbeat',
    chords: [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]],
    kick: 'x...x...x...x...', snare: '....x..x....x...', hat: 'xxxxxxxxxxxxxxxx',
    lyrics: ['Sunshine on repeat', 'Feel the rhythm in your feet', 'Summer days, so sweet', 'Make it yours, make it complete'] },
]

let ctx = null
let timer = null
let audioEl = null
let current = null
const listeners = new Set()

export function onMusicChange(fn) { listeners.add(fn); return () => listeners.delete(fn) }
function emit() { listeners.forEach((fn) => fn(current)) }
export function currentTrack() { return current }

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12)

function tone(t, f, dur, type, gain) {
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.type = type; o.frequency.value = f
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05)
}
function noise(t, dur, gain, hp) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource(); s.buffer = buf
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(ctx.destination); s.start(t)
}
function kick(t) {
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15)
  g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.3)
}

function startSynth(track) {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  const step = 60 / track.bpm / 4
  let n = 0
  let next = ctx.currentTime + 0.05
  timer = setInterval(() => {
    while (next < ctx.currentTime + 0.12) {
      const s = n % 16; const bar = Math.floor(n / 16) % track.chords.length
      const chord = track.chords[bar]
      if (s === 0) chord.forEach((m) => tone(next, freq(m), step * 15, track.wave, 0.035))
      if (s % 4 === 2) tone(next, freq(chord[(s / 2) % chord.length] + 12), step * 1.5, 'sine', 0.03)
      if (s % 8 === 0) tone(next, freq(chord[0] - 12), step * 6, 'sine', 0.09)
      if (track.kick[s] === 'x') kick(next)
      if (track.snare[s] === 'x') noise(next, 0.18, 0.12, 1200)
      if (track.hat[s] === 'x') noise(next, 0.04, 0.04, 7000)
      next += step; n++
    }
  }, 25)
}

export function stopMusic() {
  if (timer) { clearInterval(timer); timer = null }
  if (audioEl) { audioEl.pause(); audioEl = null }
  if (current) { current = null; emit() }
}

export function playTrack(track) {
  if (!track) return stopMusic()
  if (current && current.id === track.id) return
  stopMusic()
  current = track
  try {
    if (track.src) {
      audioEl = new Audio(track.src); audioEl.loop = true; audioEl.volume = 0.7
      audioEl.play().catch(() => {})
    } else startSynth(track)
  } catch { /* audio unavailable */ }
  emit()
}

export function toggleTrack(track) {
  if (current && current.id === track.id) stopMusic(); else playTrack(track)
}
