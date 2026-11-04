// Generic outline icons (24x24, stroke = currentColor).
const P = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  homeFill: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" fill="currentColor" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></>,
  reels: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5" /><path d="m10 12 5 3-5 3z" fill="currentColor" /></>,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.2 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.4 0 5.6 3.2 4.4 6.7C19.5 15.4 12 20 12 20z" />,
  comment: <path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z" />,
  send: <><path d="M21.5 3 10 13.5" /><path d="M21.5 3 15 21l-5-7.5L2.5 9z" /></>,
  bookmark: <path d="M6 3h12v18l-6-5-6 5z" />,
  more: <><circle cx="5" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="19" cy="12" r="1.3" fill="currentColor" /></>,
  moreV: <><circle cx="12" cy="5" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="19" r="1.3" fill="currentColor" /></>,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  back: <path d="M15 4 7 12l8 8" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  text: <><path d="M4 7V5h16v2M12 5v14M9 19h6" /></>,
  sticker: <><path d="M14 21H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v6z" /><path d="M14 21v-3a4 4 0 0 1 4-4h3" /><path d="M8.5 13.5s1.3 1.5 3.5 1.5" /></>,
  sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>,
  template: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></>,
  filter: <><circle cx="9" cy="10" r="5.5" /><circle cx="15" cy="10" r="5.5" /><circle cx="12" cy="15" r="5.5" /></>,
  volume: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>,
  mute: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="m17 9 5 6M22 9l-5 6" /></>,
  camera: <><path d="M3 8h4l2-3h6l2 3h4v12H3z" /><circle cx="12" cy="13.5" r="4" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
  grid: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></>,
  tag: <><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="12" cy="10" r="3" /><path d="M7 20c.8-2.8 2.7-4 5-4s4.2 1.2 5 4" /></>,
  carousel: <><rect x="7" y="3" width="14" height="14" rx="2" /><path d="M17 21H5a2 2 0 0 1-2-2V7" /></>,
  play: <path d="m7 4 13 8-13 8z" fill="currentColor" />,
  pause: <><rect x="6" y="4" width="4" height="16" fill="currentColor" /><rect x="14" y="4" width="4" height="16" fill="currentColor" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  location: <><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  at: <><circle cx="12" cy="12" r="4" /><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  shop: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /></>,
  repost: <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
}

export function Icon({ name, size = 24, filled = false, className = '', style, strokeWidth = 1.8 }) {
  return (
    <svg
      className={`icon ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  )
}

export function Verified({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Verified" style={{ flex: 'none' }}>
      <path fill="#0095f6" d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3L2.6 15.8l1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z" />
      <path d="m8 12.2 2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
