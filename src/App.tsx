import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CITIES, EMAIL, FAQS, PACKAGES, PHONE, SPECS, STEPS, VARIANTS, installStubs, readUtm, resolveVariant, track, type PriceCue, type Utm } from './data'
import { ArrowIcon, BoltIcon, CheckIcon, ChevronIcon, PhoneIcon, Placeholder, RefreshIcon, Shine, TruckIcon, Wave, XIcon } from './icons'
import { QuoteSheet } from './QuoteSheet'

const BRICOLAGE = "'Bricolage Grotesque',sans-serif"
const PAD_X = 'clamp(20px,5vw,48px)'
const eyebrow = (color: string): CSSProperties => ({ margin: 0, fontSize: '.78rem', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color })
const h2 = (color?: string, balance = true): CSSProperties => ({ margin: 0, fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1, letterSpacing: '-.03em', color, textWrap: balance ? 'balance' : undefined } as CSSProperties)
const ctaBase: CSSProperties = { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fff', border: 0, borderRadius: 10, fontWeight: 800, cursor: 'pointer', background: '#3B1A7A' }
const rowP: CSSProperties = { margin: 0, display: 'flex', gap: 10 }

function useDesktop() {
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px)')
    const on = () => setDesktop(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return desktop
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal],[data-reveal-group]')
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.setAttribute(el.hasAttribute('data-reveal-group') ? 'data-reveal-group' : 'data-reveal', 'in'))
      return
    }
    const rio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      const t = e.target as HTMLElement
      const g = t.hasAttribute('data-reveal-group')
      if (g) Array.from(t.children).forEach((c, i) => { (c as HTMLElement).style.transitionDelay = (i * 90) + 'ms' })
      t.setAttribute(g ? 'data-reveal-group' : 'data-reveal', 'in')
      rio.unobserve(t)
    }), { rootMargin: '0px 0px -8% 0px' })
    els.forEach(el => rio.observe(el))
    return () => rio.disconnect()
  }, [])
}

export default function App() {
  const desktop = useDesktop()
  const [open, setOpen] = useState(false)
  const [heroCtaVisible, setHeroCtaVisible] = useState(true)
  const [openFaq, setOpenFaq] = useState(-1)
  const [pkgIdx, setPkgIdx] = useState(0)
  const heroCta = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<Element | null>(null)
  const utmRef = useRef<Utm>({})

  const params = useMemo(() => new URLSearchParams(location.search), [])
  const variant = resolveVariant(params.get('variant'))
  const priceCue: PriceCue = params.get('priceCue') === 'quote-line' ? 'quote-line' : 'price'
  const v = VARIANTS[variant]
  const m = /ice/i.exec(v.headline)
  const hPre = m ? v.headline.slice(0, m.index) : v.headline
  const hIce = m ? m[0] : ''
  const hPost = m ? v.headline.slice(m.index + 3) : ''

  useReveal()

  useEffect(() => {
    installStubs()
    utmRef.current = readUtm()
    track('page_view', { landing_variant: variant, ...utmRef.current })
    if (!('IntersectionObserver' in window) || !heroCta.current) return
    const io = new IntersectionObserver(([e]) => setHeroCtaVisible(e.isIntersecting || e.boundingClientRect.top > 0), { threshold: 0 })
    io.observe(heroCta.current)
    return () => io.disconnect()
  }, [variant])

  const openQuote = (loc: string) => () => {
    track('primary_cta_click', { location: loc, landing_variant: variant })
    lastFocus.current = document.activeElement
    setOpen(true)
  }
  const closeQuote = () => {
    setOpen(false)
    requestAnimationFrame(() => (lastFocus.current as HTMLElement | null)?.focus?.())
  }
  const trackCall = () => track('call_click', {})
  const trackText = () => track('text_click', {})

  const pkg = PACKAGES[pkgIdx]
  const showBar = !desktop && !heroCtaVisible && !open

  return (
    <div id="top" style={{ minHeight: '100vh', overflowX: 'clip' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59,26,122,.08)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 56, padding: '0 clamp(16px,4vw,32px)' }}>
          <a href="#top" aria-label="Icebox Rentals home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
            <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#22B8EC,#3B1A7A)', display: 'inline-block', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.35)' }} />
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontFamily: BRICOLAGE, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-.02em' }}>
              <span><span style={{ color: '#1690C4' }}>ICE</span><span style={{ color: '#3B1A7A' }}>BOX</span></span>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '.6em', letterSpacing: '.18em', fontWeight: 800, color: '#3B1A7A' }}>RENTALS</span>
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href={`tel:${PHONE}`} onClick={trackCall} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 6px', color: '#3B1A7A', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none' }}>
              <PhoneIcon />
              <span>Call / Text <Placeholder>{PHONE}</Placeholder></span>
            </a>
            {desktop && (
              <button type="button" onClick={openQuote('header')} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 42, padding: '0 18px', background: '#3B1A7A', color: '#fff', border: 0, borderRadius: 8, fontWeight: 800, fontSize: '.95rem', cursor: 'pointer' }}>Get My Rental Quote</button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section aria-labelledby="hero-h" style={{ position: 'relative', background: 'linear-gradient(180deg,#FFFFFF 0%,#F3F9FD 40%,#DDF0FA 100%)', padding: `clamp(20px,3vw,56px) ${PAD_X} 0`, overflow: 'visible' }}>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 15%,rgba(255,255,255,.9),transparent 35%),repeating-linear-gradient(135deg,rgba(255,255,255,.35) 0 2px,transparent 2px 14px)', opacity: .6, pointerEvents: 'none', overflow: 'hidden' }} />
          <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '8px clamp(24px,4vw,64px)', alignItems: 'end', animation: 'heroIn .6s ease both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 'clamp(8px,2vw,72px)', alignSelf: 'center' }}>
              <h1 id="hero-h" style={{ margin: 0, fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 'clamp(3rem,6.5vw,5.75rem)', lineHeight: .95, letterSpacing: '-.035em', color: '#3B1A7A', textWrap: 'balance' } as CSSProperties}>
                {hPre}<span style={{ background: 'linear-gradient(100deg,#22B8EC 0%,#3B1A7A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{hIce}</span>{hPost}
              </h1>
              <p style={{ margin: 0, fontSize: 'clamp(1.05rem,1.6vw,1.25rem)', fontWeight: 500, color: '#4A4567', textWrap: 'pretty', maxWidth: '40ch' } as CSSProperties}>{v.subhead}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {priceCue === 'price'
                  ? <p style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(1.2rem,2vw,1.5rem)', color: '#3B1A7A', letterSpacing: '-.01em' }}>Rentals from $<Placeholder size=".72em" pad={8} lh={1.7} style={{ verticalAlign: 'middle' }}>[VERIFIED PRICE]</Placeholder></p>
                  : <p style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(1.2rem,2vw,1.5rem)', color: '#3B1A7A', letterSpacing: '-.01em' }}>Get a quote for your event date and location.</p>}
                <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 600, color: '#5B6472' }}>No-obligation quote</p>
              </div>
              <button ref={heroCta} data-cta type="button" onClick={openQuote('hero')} className="btn-hero" style={{ ...ctaBase, width: '100%', maxWidth: 440, minHeight: 58, padding: '0 24px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.1rem', boxShadow: '0 14px 30px rgba(59,26,122,.3)' }}>
                <Shine /><span style={{ position: 'relative' }}>Get My Rental Quote</span><ArrowIcon />
              </button>
              <ul aria-label="Included services" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: '.78rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B1A7A' }}>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><TruckIcon />Delivery</li>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><BoltIcon />Setup</li>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><RefreshIcon />Pickup</li>
              </ul>
            </div>
            <div style={{ position: 'relative', justifySelf: 'center', margin: '8px auto -36px', width: desktop ? '100%' : '66%', maxWidth: 620, transform: `translateX(${desktop ? 'min(6vw, 90px)' : '0px'})` }}>
              <div aria-hidden="true" style={{ position: 'absolute', left: '-20%', right: '-20%', top: '-6%', bottom: '6%', background: 'radial-gradient(ellipse at 50% 55%,rgba(34,184,236,.32) 0%,rgba(34,184,236,.12) 42%,rgba(34,184,236,0) 70%)', pointerEvents: 'none' }} />
              <div aria-hidden="true" style={{ position: 'absolute', left: '8%', right: '8%', bottom: '-2%', height: '9%', background: 'radial-gradient(ellipse at 50% 50%,rgba(27,21,53,.42),rgba(27,21,53,0) 70%)', filter: 'blur(4px)', pointerEvents: 'none' }} />
              <img src="/assets/machine-cutout.png" width={621} height={882} alt="Icebox Rentals purple ice machine with the Icebox Rentals logo on the front" loading="eager" fetchpriority="high" decoding="async" style={{ position: 'relative', display: 'block', width: '100%', height: 'auto', aspectRatio: '621/882' }} />
              <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: '100%', width: '100%', aspectRatio: '621/180', overflow: 'hidden', opacity: .18, WebkitMaskImage: 'linear-gradient(to bottom,rgba(0,0,0,1),rgba(0,0,0,0) 90%)', maskImage: 'linear-gradient(to bottom,rgba(0,0,0,1),rgba(0,0,0,0) 90%)', pointerEvents: 'none' }}>
                <img src="/assets/machine-cutout.png" width={621} height={882} alt="" loading="eager" decoding="async" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 'auto', transform: 'scaleY(-1) translateY(2px)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Why rent */}
        <section aria-labelledby="why-h" style={{ background: '#fff', padding: `0 ${PAD_X} clamp(48px,7vw,96px)` }}>
          <svg aria-hidden="true" viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ display: 'block', width: `calc(100% + 2*${PAD_X})`, margin: `0 calc(-1*${PAD_X}) clamp(48px,6vw,80px)`, height: 'clamp(28px,4vw,56px)' }}><path d="M0,0 L1440,0 L1440,22 C1300,56 1180,10 1040,30 C900,50 820,8 700,26 C580,44 470,4 340,28 C210,52 110,10 0,30 Z" fill="#DDF0FA" /></svg>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 'clamp(28px,4vw,56px)', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-reveal>
              <p style={eyebrow('#1690C4')}>Why rent</p>
              <h2 id="why-h" style={h2('#3B1A7A', false)}>Skip the ice runs.</h2>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#4A4567', maxWidth: '40ch' }}>Focus on your event, not another trip to the store.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 24 }} data-reveal-group>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '.85rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8A8599', paddingBottom: 10, borderBottom: '2px solid #E6ECF2' }}>Buying bags</h3>
                {['Hauling heavy bags to the venue', 'Finding freezer space to store it', 'Melting before the first drink is poured', 'Repeat trips when you run low'].map(t => (
                  <p key={t} style={{ ...rowP, color: '#4A4567' }}><XIcon style={{ flex: 'none', marginTop: 3 }} />{t}</p>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '.85rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#3B1A7A', paddingBottom: 10, borderBottom: '2px solid #22B8EC' }}>Renting Icebox</h3>
                {['Machine delivered to your venue', 'Ice produced on site, through the event', 'Setup handled when we arrive', "Pickup handled when you're done"].map(t => (
                  <p key={t} style={{ ...rowP, fontWeight: 600 }}><CheckIcon style={{ flex: 'none', marginTop: 3 }} />{t}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Product */}
        <section aria-labelledby="product-h" style={{ background: '#F3F9FD', padding: '0 0 clamp(48px,7vw,96px)' }}>
          <Wave d="M0,0 L1440,0 L1440,24 C1290,54 1150,6 1000,28 C860,48 760,10 620,30 C480,50 360,4 220,26 C120,42 60,20 0,34 Z" fill="#ffffff" />
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: `clamp(32px,5vw,64px) ${PAD_X} 0`, display: 'flex', flexDirection: 'column', gap: 'clamp(24px,4vw,40px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '12px 32px' }} data-reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
                <p style={eyebrow('#1690C4')}>The machine</p>
                <h2 id="product-h" style={h2('#3B1A7A')}>The ice keeps coming. The party keeps going.</h2>
              </div>
              <p style={{ margin: 0, color: '#4A4567', maxWidth: '36ch' }}>One compact machine on wheels. Plug it in, connect the water, and it quietly makes ice through your whole event — no bags, no freezer, no runs to the store.</p>
            </div>
          </div>
          <div style={{ position: 'relative', margin: 'clamp(20px,3vw,40px) 0 0' }} data-reveal>
            <img src="/assets/ice-open.jpg" width={1000} height={1241} alt="Open lid of the Icebox ice machine showing the bin full of fresh ice" loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: 'clamp(460px,72vh,780px)', objectFit: 'cover', objectPosition: '50% 42%' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(27,21,53,0) 55%,rgba(27,21,53,.45) 100%)', pointerEvents: 'none' }} />
            <ul aria-label="Machine highlights" style={{ listStyle: 'none', margin: 0, padding: 0, position: 'absolute', inset: 0 }}>
              {([
                ['Fresh ice, made on site', { left: 'clamp(16px,5vw,8%)', top: '12%' }],
                ['Insulated bin keeps it scoop-ready', { right: 'clamp(16px,5vw,8%)', top: '46%' }],
                ['Keeps producing all event long', { left: 'clamp(16px,5vw,8%)', bottom: '14%' }],
              ] as [string, CSSProperties][]).map(([t, pos]) => (
                <li key={t} style={{ position: 'absolute', ...pos, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.94)', color: '#1B1535', padding: '9px 14px 9px 10px', borderRadius: 8, fontSize: '.9rem', fontWeight: 700, boxShadow: '0 8px 24px rgba(27,21,53,.18)' }}>
                  <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: '#22B8EC', boxShadow: '0 0 0 4px rgba(34,184,236,.25)', flex: 'none' }} />{t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: `clamp(28px,4vw,48px) ${PAD_X} 0`, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <dl data-reveal-group style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '0 24px', borderTop: '1px solid rgba(59,26,122,.15)' }}>
              {SPECS.map(sp => (
                <div key={sp.label} style={{ padding: '14px 0', borderBottom: '1px solid rgba(59,26,122,.15)' }}>
                  <dt style={{ margin: '0 0 4px', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1690C4' }}>{sp.label}</dt>
                  <dd style={{ margin: 0 }}><Placeholder size=".85rem" lh={1.7}>{sp.ph}</Placeholder></dd>
                </div>
              ))}
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px 32px', fontSize: '.95rem', color: '#4A4567' }} data-reveal>
              <p style={{ margin: 0, maxWidth: '52ch' }}><strong style={{ color: '#1B1535' }}>Daily output isn't instant on-hand inventory.</strong> The machine produces steadily through the day, so we set it up early and the bin fills before guests arrive.</p>
              <p style={{ margin: 0, maxWidth: '40ch' }}><strong style={{ color: '#1B1535' }}>Hosting a large event?</strong> Tell us the schedule and headcount and we'll recommend the right setup — including a second machine if it makes sense.</p>
            </div>
          </div>
        </section>

        {/* Events band */}
        <figure style={{ margin: 0, position: 'relative', background: '#1B1535' }}>
          <img src="/assets/party.jpg" width={1600} height={893} alt="Styled garden-party scene at dusk with string lights and the purple Icebox ice machine in the foreground" loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: 'clamp(320px,50vw,640px)', objectFit: 'cover', objectPosition: '62% 50%' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(27,21,53,.78) 0%,rgba(27,21,53,.35) 55%,rgba(27,21,53,.1) 100%)' }} />
          <figcaption style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: `clamp(20px,4vw,48px) ${PAD_X}`, color: '#fff' }}>
            <div style={{ maxWidth: 1240, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }} data-reveal>
              <p style={eyebrow('#7FD6F5')}>Built for</p>
              <p style={{ margin: 0, fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,3.2rem)', lineHeight: 1, letterSpacing: '-.03em', maxWidth: '14ch', textWrap: 'balance' } as CSSProperties}>Weddings, birthdays, BBQs, corporate events and vendors.</p>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#DCE9F3', maxWidth: '38ch' }}>From a backyard birthday to a 200-guest reception — wherever the drinks are, the ice is already there.</p>
              <p style={{ margin: '8px 0 0', fontSize: '.78rem', color: '#B9D7E8' }}>Styled scene for illustration</p>
            </div>
          </figcaption>
        </figure>

        {/* Pricing */}
        <section aria-labelledby="price-h" style={{ background: '#fff', padding: `clamp(48px,7vw,96px) ${PAD_X} 0` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'start', paddingBottom: 'clamp(48px,7vw,96px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} data-reveal>
              <p style={eyebrow('#1690C4')}>Rentals</p>
              <h2 id="price-h" style={h2('#3B1A7A')}>Straightforward rentals. No surprises.</h2>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#4A4567', maxWidth: '44ch' }}>Two simple packages, one flat rental price each. Your quote lists the total before you commit to anything.</p>
              <div style={{ borderTop: '1px solid #E6ECF2', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ margin: '0 0 4px', fontSize: '.78rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B1A7A' }}>Always included</p>
                <p style={{ margin: 0, color: '#4A4567' }}>Delivery within our service area · Setup and a quick walkthrough · Pickup after your event · A cleaned and sanitized machine · Help by phone or text during your rental</p>
              </div>
              <p style={{ margin: 0, fontSize: '.95rem', color: '#4A4567' }}>Running a festival, market stall or multi-day event? We'll build a custom quote around your date, location and duration.</p>
              <img src="/assets/side-lid.jpg" width={896} height={1195} alt="Side view of the purple machine with Ice Ice Baby lettering, and the lid with the cube-couple sticker" loading="lazy" decoding="async" style={{ display: 'block', width: 'min(100%,240px)', height: 'auto', aspectRatio: '3/4', objectFit: 'cover', objectPosition: '50% 0', borderRadius: 10, marginTop: 8 }} />
            </div>
            <div style={{ background: '#fff', border: '1px solid #E6ECF2', borderRadius: 14, padding: 'clamp(20px,3vw,32px)', boxShadow: '0 24px 60px rgba(59,26,122,.12)', display: 'flex', flexDirection: 'column', gap: 18 }} data-reveal>
              <div role="group" aria-label="Choose a package" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: '#EEF3F8', borderRadius: 10 }}>
                {PACKAGES.map((p, i) => {
                  const a = pkgIdx === i
                  return (
                    <button key={p.name} type="button" onClick={() => setPkgIdx(i)} aria-pressed={a} style={{ minHeight: 44, border: 0, borderRadius: 7, cursor: 'pointer', fontWeight: 800, fontSize: '.95rem', transition: 'background .15s,color .15s', background: a ? '#3B1A7A' : 'transparent', color: a ? '#fff' : '#1B1535', boxShadow: a ? '0 2px 6px rgba(59,26,122,.3)' : 'none' }}>{p.name}</button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontSize: '.85rem', fontWeight: 700, color: '#5B6472' }}>{pkg.duration}</p>
                  <p style={{ margin: 0, fontFamily: BRICOLAGE, fontWeight: 800, fontSize: '2.2rem', lineHeight: 1, letterSpacing: '-.03em', color: '#3B1A7A' }}>$<Placeholder size=".45em" pad={8} lh={1.9} style={{ verticalAlign: 'middle', letterSpacing: 0 }}>{pkg.price}</Placeholder></p>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pkg.includes.map(inc => (
                    <li key={inc} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><CheckIcon style={{ flex: 'none', marginTop: 3 }} /><span>{inc}</span></li>
                  ))}
                </ul>
                <dl style={{ margin: 0, borderTop: '1px solid #E6ECF2', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 12px', fontSize: '.9rem', color: '#4A4567' }}>
                  {([['Delivery fee', 'Based on your location', true], ['Taxes', 'Added to your quote', true], ['Deposit', 'Confirmed in your quote', true], ['Second machine', 'Available on request', false]] as [string, string, boolean][]).map(([k, val, b]) => {
                    const cell: CSSProperties = { margin: 0, padding: '8px 0', borderBottom: b ? '1px solid #E6ECF2' : undefined }
                    return [<dt key={k} style={cell}>{k}</dt>, <dd key={k + 'v'} style={{ ...cell, textAlign: 'right' }}>{val}</dd>]
                  })}
                </dl>
                <p style={{ margin: 0, fontSize: '.85rem', color: '#5B6472' }}>Your final quote confirms all applicable fees — no surprises on the day.</p>
              </div>
              <button data-cta type="button" onClick={openQuote('pricing')} className="btn-primary" style={{ ...ctaBase, width: '100%', minHeight: 56, padding: '0 24px', fontSize: '1.05rem' }}>
                <Shine /><span style={{ position: 'relative' }}>Get My Rental Quote</span><ArrowIcon />
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-h" style={{ position: 'relative', background: 'linear-gradient(180deg,#3B1A7A 0%,#2B135C 100%)', color: '#fff', padding: `0 ${PAD_X} clamp(56px,7vw,96px)` }}>
          <Wave bleed d="M0,0 L1440,0 L1440,20 C1320,52 1200,8 1060,28 C920,48 830,6 700,24 C570,42 470,2 330,26 C190,50 100,12 0,32 Z" fill="#ffffff" />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 85% 100%,rgba(34,184,236,.22),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(28px,4vw,48px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }} data-reveal>
              <p style={eyebrow('#7FD6F5')}>How it works</p>
              <h2 id="how-h" style={h2(undefined, false)}>Three steps. Ice handled.</h2>
            </div>
            <ol data-reveal-group style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '0 32px' }}>
              {STEPS.map(st => (
                <li key={st.n} style={{ borderTop: '2px solid rgba(255,255,255,.22)', padding: '18px 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span aria-hidden="true" style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontSize: '1.6rem', lineHeight: 1, color: '#22B8EC', letterSpacing: '-.02em' }}>0{st.n}</span>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.25 }}>{st.title}</h3>
                  <p style={{ margin: 0, color: '#DCE9F3' }}>{st.body}</p>
                </li>
              ))}
            </ol>
            <p data-reveal style={{ margin: 0, maxWidth: 720, fontSize: '.95rem', color: '#DCE9F3' }}>At the venue you'll need a standard power outlet and water access near the setup spot. We walk through the specifics with you before delivery so there are no surprises on the day.</p>
          </div>
        </section>

        {/* Trust & FAQ */}
        <section aria-labelledby="faq-h" style={{ background: '#fff', padding: `0 ${PAD_X} clamp(48px,7vw,96px)` }}>
          <Wave bleed d="M0,0 L1440,0 L1440,26 C1310,56 1170,10 1030,30 C890,50 790,8 660,26 C530,44 430,4 300,28 C170,52 80,14 0,30 Z" fill="#2B135C" />
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} data-reveal>
              <p style={eyebrow('#1690C4')}>Before you book</p>
              <h2 id="faq-h" style={h2('#3B1A7A')}>Know what to expect before your event.</h2>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#4A4567' }}>We're a local Surrey business and we deliver across Metro Vancouver. Delivery is priced by distance and shown in your quote.</p>
              <p style={{ margin: 0, fontSize: '.78rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5B6472' }}>Service area</p>
              <ul aria-label="Service area" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
                {CITIES.map(c => <li key={c} style={{ display: 'inline-block', fontSize: '.9rem', fontWeight: 600, color: '#3B1A7A', background: '#EAF7FD', borderRadius: 4, padding: '2px 10px', lineHeight: 1.6 }}>{c}</li>)}
              </ul>
            </div>
            <div style={{ borderTop: '1px solid #E6ECF2' }} data-reveal>
              {FAQS.map((f, i) => {
                const o = openFaq === i
                return (
                  <div key={f.q} style={{ borderBottom: '1px solid #E6ECF2' }}>
                    <h3 style={{ margin: 0 }}>
                      <button type="button" onClick={() => setOpenFaq(o ? -1 : i)} aria-expanded={o} aria-controls={`faq-p-${i}`} id={`faq-b-${i}`} className="faq-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left', minHeight: 56, padding: '14px 0', background: 'none', border: 0, cursor: 'pointer', color: '#1B1535', fontWeight: 700, fontSize: '1.02rem' }}>
                        <span>{f.q}</span>
                        <ChevronIcon rotated={o} />
                      </button>
                    </h3>
                    <div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} aria-hidden={!o} style={{ display: 'grid', gridTemplateRows: o ? '1fr' : '0fr', transition: 'grid-template-rows .3s cubic-bezier(.2,.7,.2,1)' }}>
                      <div style={{ overflow: 'hidden', minHeight: 0 }}>
                        <div style={{ padding: '0 0 18px', color: '#4A4567', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p style={{ margin: 0 }}>{f.a}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section aria-labelledby="close-h" style={{ position: 'relative', background: 'linear-gradient(180deg,#3B1A7A 0%,#2B135C 100%)', color: '#fff', padding: `0 ${PAD_X} clamp(64px,8vw,112px)`, overflow: 'hidden' }}>
          <Wave bleed d="M0,0 L1440,0 L1440,22 C1300,54 1160,8 1020,28 C880,48 780,10 650,26 C520,42 420,2 290,28 C160,52 80,12 0,30 Z" fill="#ffffff" />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 50% at 50% 100%,rgba(34,184,236,.28),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }} data-reveal>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src="/assets/mascot.jpg" width={800} height={1067} alt="The Icebox cube-couple mascot: two smiling ice cubes in sunglasses and red sneakers" loading="lazy" decoding="async" style={{ width: 92, height: 92, borderRadius: 12, objectFit: 'cover', objectPosition: '50% 46%', border: '2px solid #22B8EC' }} />
              <span aria-hidden="true" style={{ position: 'absolute', left: 84, bottom: -4, fontFamily: "'Kaushan Script',cursive", fontSize: '1.5rem', color: '#F08A92', whiteSpace: 'nowrap', transform: 'rotate(-8deg)', lineHeight: 1 }}>Ice Ice Baby</span>
            </div>
            <h2 id="close-h" style={{ margin: '8px 0 0', fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 'clamp(2.4rem,5.5vw,4rem)', lineHeight: .98, letterSpacing: '-.035em', textWrap: 'balance' } as CSSProperties}>Get ice sorted for your event.</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#DCE9F3', maxWidth: '44ch', textWrap: 'pretty' } as CSSProperties}>Send us your date and location. We'll confirm availability, the best rental option and your total price — and the ice is one less thing to think about.</p>
            <button data-cta type="button" onClick={openQuote('closing')} className="btn-cyan" style={{ ...ctaBase, display: 'inline-flex', minHeight: 58, padding: '0 32px', width: 'min(100%,380px)', background: '#22B8EC', color: '#1B1535', fontSize: '1.1rem', boxShadow: '0 14px 30px rgba(0,0,0,.3)' }}>
              <Shine opacity={.5} /><span style={{ position: 'relative' }}>Get My Rental Quote</span><ArrowIcon />
            </button>
            <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px', fontWeight: 700 }}>
              <a href={`tel:${PHONE}`} onClick={trackCall} style={{ color: '#fff', display: 'inline-flex', alignItems: 'center', minHeight: 44, textUnderlineOffset: 4 }}>Call <Placeholder dark style={{ marginLeft: 6 }}>{PHONE}</Placeholder></a>
              <a href={`sms:${PHONE}`} onClick={trackText} style={{ color: '#fff', display: 'inline-flex', alignItems: 'center', minHeight: 44, textUnderlineOffset: 4 }}>Text <Placeholder dark style={{ marginLeft: 6 }}>{PHONE}</Placeholder></a>
            </p>
            <p style={{ margin: 0, fontSize: '.85rem', color: '#DCE9F3' }}>We only use your details to prepare your quote. <a href="#privacy" style={{ color: '#fff' }}>Privacy policy</a></p>
          </div>
        </section>
      </main>

      <footer id="privacy" style={{ background: '#1B1535', color: '#DCE9F3', padding: `28px ${PAD_X} calc(28px + 84px)`, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 24px', fontSize: '.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontFamily: BRICOLAGE, fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1, letterSpacing: '-.02em' }}>
            <span><span style={{ color: '#22B8EC' }}>ICE</span>BOX</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '.6em', letterSpacing: '.18em' }}>RENTALS</span>
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center' }}>
            <span>Surrey, BC · <Placeholder dark size=".85em">{PHONE}</Placeholder> · <Placeholder dark size=".85em">{EMAIL}</Placeholder></span>
            <a href="#privacy" style={{ color: '#fff', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Privacy policy <Placeholder dark size=".85em" style={{ marginLeft: 6 }}>[LINK]</Placeholder></a>
          </div>
        </div>
      </footer>

      {showBar && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(10px)', borderTop: '1px solid #E6ECF2', boxShadow: '0 -8px 30px rgba(27,21,53,.12)', padding: '10px 16px calc(10px + env(safe-area-inset-bottom))', display: 'flex', gap: 10, alignItems: 'center', animation: 'sheetUp .25s ease' }}>
          <button data-cta type="button" onClick={openQuote('sticky_bar')} className="btn-bar" style={{ ...ctaBase, display: 'inline-flex', flex: 1, gap: 8, minHeight: 52, padding: '0 20px', fontSize: '1.05rem', transition: 'transform .1s' }}>
            <Shine /><span style={{ position: 'relative' }}>Get My Rental Quote</span>
          </button>
          <a href={`tel:${PHONE}`} onClick={trackCall} aria-label="Call or text us" style={{ flex: 'none', width: 52, height: 52, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3B1A7A', color: '#3B1A7A' }}>
            <PhoneIcon size={20} />
          </a>
        </div>
      )}

      <QuoteSheet open={open} desktop={desktop} pkgIdx={pkgIdx} variant={variant} utm={utmRef.current} onClose={closeQuote} />
    </div>
  )
}
