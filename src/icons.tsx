import type { CSSProperties } from 'react'

export const PhoneIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z" /></svg>
)

export const ArrowIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative' }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

export const CheckIcon = ({ stroke = '#22B8EC', size = 18, style }: { stroke?: string; size?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d="M20 6 9 17l-5-5" /></svg>
)

export const XIcon = ({ stroke = '#B9B3C9', strokeWidth = 2.5, style }: { stroke?: string; strokeWidth?: number; style?: CSSProperties }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden="true" style={style}><path d="M18 6 6 18M6 6l12 12" /></svg>
)

export const TruckIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1690C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>
)

export const BoltIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1690C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 5 14h6l-1 7 8-11h-6z" /></svg>
)

export const RefreshIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1690C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-3-6.2" /><path d="M20 4v5h-5" /></svg>
)

export const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B1A7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', transition: 'transform .3s', transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)' }}><path d="m6 9 6 6 6-6" /></svg>
)

export const Shine = ({ opacity = 0.35 }: { opacity?: number }) => (
  <span data-shine aria-hidden="true" style={{ position: 'absolute', top: '-20%', bottom: '-20%', left: 0, width: '36%', background: `linear-gradient(90deg,transparent,rgba(255,255,255,${opacity}),transparent)`, transform: 'translateX(-130%) skewX(-18deg)', pointerEvents: 'none' }} />
)

export const Wave = ({ d, fill, bleed }: { d: string; fill: string; bleed?: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1440 56"
    preserveAspectRatio="none"
    style={bleed
      ? { display: 'block', width: 'calc(100% + 2*clamp(20px,5vw,48px))', margin: '0 calc(-1*clamp(20px,5vw,48px)) clamp(40px,6vw,72px)', height: 'clamp(28px,4vw,56px)' }
      : { display: 'block', width: '100%', height: 'clamp(28px,4vw,56px)' }}
  >
    <path d={d} fill={fill} />
  </svg>
)

export const Placeholder = ({ children, size = '.8em', dark, pad = 6, lh = 1.6, style }: { children: string; size?: string; dark?: boolean; pad?: number; lh?: number; style?: CSSProperties }) => (
  <span style={{
    display: 'inline-block',
    font: `600 ${size} ui-monospace,SFMono-Regular,Menlo,monospace`,
    color: dark ? '#DCE9F3' : '#5B6472',
    border: dark ? '1px solid rgba(255,255,255,.4)' : '1px solid #C5CFDA',
    borderRadius: 4,
    padding: `0 ${pad}px`,
    lineHeight: lh,
    background: dark ? undefined : '#fff',
    ...style,
  }}>{children}</span>
)
