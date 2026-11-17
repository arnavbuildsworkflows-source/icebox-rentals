import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { CITIES, PACKAGES, track, type Utm, type VariantKey } from './data'
import { CheckIcon, XIcon } from './icons'

type Form = { date: string; area: string; name: string; phone: string; email: string; eventType: string; guests: string; requests: string; consent: boolean }
const EMPTY: Form = { date: '', area: '', name: '', phone: '', email: '', eventType: '', guests: '', requests: '', consent: false }
type Errors = Partial<Record<keyof Form, string>>

const fieldStyle = (err?: string): CSSProperties => ({ width: '100%', minHeight: 52, padding: '12px 14px', borderRadius: 8, background: '#fff', color: '#1B1535', fontSize: '1rem', border: `2px solid ${err ? '#C7303B' : '#CBD5E1'}` })
const labelStyle: CSSProperties = { fontWeight: 700 }
const errStyle: CSSProperties = { margin: 0, minHeight: '1.2em', fontSize: '.9rem', fontWeight: 600, color: '#C7303B' }
const groupStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const Req = () => <span style={{ color: '#C7303B' }}>*</span>
const Opt = () => <span style={{ fontWeight: 400, color: '#5B6472' }}>(optional)</span>

function inArea(v: string) {
  const s = v.trim().toLowerCase()
  if (CITIES.some(c => s.includes(c.toLowerCase()))) return true
  const pc = s.replace(/\s/g, '')
  return /^v[3-7][a-z]\d?[a-z]?\d?$/.test(pc) // Metro Vancouver FSAs roughly V3–V7 — placeholder rule
}

function todayISO() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const FOCUS_MAP: Record<string, string> = { date: 'q-date', area: 'q-area', name: 'q-name', phone: 'q-phone', email: 'q-email', consent: 'q-requests' }

export function QuoteSheet({ open, desktop, pkgIdx, variant, utm, onClose }: { open: boolean; desktop: boolean; pkgIdx: number; variant: VariantKey; utm: Utm; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [outOfArea, setOutOfArea] = useState(false)
  const [override, setOverride] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [started, setStarted] = useState(false)
  const [leadId, setLeadId] = useState('')
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    document.getElementById(step === 1 ? 'q-date' : 'q-name')?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => {
    if (step === 3) { setStep(1); setForm(EMPTY); setErrors({}); setOutOfArea(false); setOverride(false) }
    onClose()
  }

  if (!open) return null

  const onField = (e: { target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }) => {
    const t = e.target
    const name = t.name as keyof Form
    const val = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : t.value
    setForm(f => ({ ...f, [name]: val }))
    setErrors(er => ({ ...er, [name]: '' }))
    if (name === 'area') { setOutOfArea(false); setOverride(false) }
  }

  const firstError = (e: Errors) => {
    const k = Object.keys(e)[0]
    if (k) document.getElementById(FOCUS_MAP[k])?.focus()
  }

  const onStart = () => {
    if (!started) { setStarted(true); track('form_start', { landing_variant: variant }) }
  }

  const onStep1 = (ev: FormEvent) => {
    ev.preventDefault()
    const e: Errors = {}
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (!form.date) e.date = 'Please choose your event date.'
    else if (new Date(form.date + 'T00:00') < today) e.date = 'Please choose a date from today onward.'
    if (!form.area.trim()) e.area = 'Please enter your event city or postal code.'
    const oo = !!form.area.trim() && !inArea(form.area) && !override
    if (oo) e.area = 'We may not deliver there yet — see the note below.'
    if (Object.keys(e).length) { setErrors(e); setOutOfArea(oo); track('form_error', { step: 1, fields: Object.keys(e) }); firstError(e); return }
    track('step1_complete', { landing_variant: variant, out_of_area: override })
    setErrors({}); setOutOfArea(false); setStep(2)
    requestAnimationFrame(() => { document.getElementById('q-name')?.focus({ preventScroll: true }); if (sheetRef.current) sheetRef.current.scrollTop = 0 })
  }

  const onStep2 = async (ev: FormEvent) => {
    ev.preventDefault()
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Please enter your name.'
    const digits = form.phone.replace(/\D/g, '')
    if (!digits) e.phone = 'Please enter your mobile number.'
    else if (digits.length < 10) e.phone = 'Please enter a 10-digit mobile number.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "That email doesn't look right."
    if (!form.consent) e.consent = 'Please confirm we can contact you about this quote.'
    if (Object.keys(e).length) { setErrors(e); track('form_error', { step: 2, fields: Object.keys(e) }); firstError(e); return }
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)
    const payload = {
      lead_id: id, event_date: form.date, event_location: form.area.trim(), out_of_area_override: override, package_interest: PACKAGES[pkgIdx].name,
      name: form.name.trim(), phone: digits, email: form.email.trim() || null, event_type: form.eventType || null,
      guest_count: form.guests ? Number(form.guests) : null, special_requests: form.requests.trim() || null, consent: true,
      utm_source: utm.utm_source || null, utm_medium: utm.utm_medium || null, utm_campaign: utm.utm_campaign || null,
      utm_content: utm.utm_content || null, utm_term: utm.utm_term || null,
      landing_variant: variant, page_url: location.href, submitted_at: new Date().toISOString(),
    }
    setSubmitting(true)
    try { await window.submitLead?.(payload) } catch (err) { console.error(err) }
    track('form_submit', { lead_id: id, landing_variant: variant, event_type: payload.event_type, utm_source: payload.utm_source, utm_campaign: payload.utm_campaign })
    setSubmitting(false); setLeadId(id); setStep(3)
    requestAnimationFrame(() => { if (sheetRef.current) sheetRef.current.scrollTop = 0 })
  }

  const notDone = step < 3
  const title = step === 1 ? 'Your event basics' : step === 2 ? 'Where should we send the quote?' : 'Thanks — request received'
  const summary = (form.date ? new Date(form.date + 'T00:00').toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '') + ' · ' + form.area

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) close() }}
      onKeyDown={e => { if (e.key === 'Escape') close() }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(27,21,53,.6)', display: 'flex', justifyContent: 'center', alignItems: desktop ? 'center' : 'flex-end', padding: desktop ? 24 : 0 }}
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="quote-h" ref={sheetRef}
        style={{ width: '100%', maxWidth: 560, maxHeight: '92dvh', overflow: 'auto', overscrollBehavior: 'contain', background: '#fff', borderRadius: desktop ? 14 : '16px 16px 0 0', boxShadow: '0 -20px 60px rgba(0,0,0,.35)', animation: 'sheetUp .28s ease', padding: '20px clamp(18px,4vw,32px) calc(24px + env(safe-area-inset-bottom))' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            {notDone && <p style={{ margin: '0 0 4px', fontSize: '.78rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#1690C4' }}>Step {step} of 2</p>}
            <h2 id="quote-h" style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.05, letterSpacing: '-.025em', color: '#3B1A7A' }}>{title}</h2>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="btn-close" style={{ flex: 'none', width: 44, height: 44, borderRadius: 8, border: 0, background: '#EEF3F8', color: '#1B1535', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon stroke="currentColor" />
          </button>
        </div>
        {notDone && (
          <div aria-hidden="true" style={{ height: 4, background: '#E6ECF2', marginBottom: 20, overflow: 'hidden', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#22B8EC', width: step === 1 ? '50%' : '100%', transition: 'width .3s' }} />
          </div>
        )}

        {step === 1 && (
          <form noValidate onSubmit={onStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={groupStyle}>
              <label htmlFor="q-date" style={labelStyle}>Event date <Req /></label>
              <input id="q-date" name="date" type="date" required min={todayISO()} value={form.date} onChange={onField} onFocus={onStart} aria-invalid={!!errors.date} aria-describedby="err-date" className="field" style={fieldStyle(errors.date)} />
              <p id="err-date" aria-live="polite" style={errStyle}>{errors.date}</p>
            </div>
            <div style={groupStyle}>
              <label htmlFor="q-area" style={labelStyle}>Event city or postal code <Req /></label>
              <input id="q-area" name="area" type="text" required autoComplete="postal-code" placeholder="e.g. Surrey or V3S 1A1" value={form.area} onChange={onField} onFocus={onStart} aria-invalid={!!errors.area} aria-describedby="err-area" className="field" style={fieldStyle(errors.area)} />
              <p id="err-area" aria-live="polite" style={errStyle}>{errors.area}</p>
              {outOfArea && (
                <div style={{ background: '#EAF7FD', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, color: '#1B1535', fontSize: '.95rem' }}>
                  <p style={{ margin: 0 }}>That location may be outside our current service area. We're based in Surrey and serve eligible locations across Metro Vancouver — but it never hurts to ask.</p>
                  <button type="button" onClick={() => { setOverride(true); setOutOfArea(false); setErrors(er => ({ ...er, area: '' })) }} style={{ alignSelf: 'flex-start', minHeight: 44, padding: '0 16px', borderRadius: 8, border: '2px solid #3B1A7A', background: '#fff', color: '#3B1A7A', fontWeight: 700, cursor: 'pointer' }}>Ask anyway — we'll confirm</button>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 56, padding: '0 24px', background: '#3B1A7A', color: '#fff', border: 0, borderRadius: 10, fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', marginTop: 4 }}>Continue to Quote</button>
            <p style={{ margin: 0, fontSize: '.85rem', color: '#5B6472', textAlign: 'center' }}>Requesting a quote doesn't reserve a date. We'll confirm availability with you.</p>
          </form>
        )}

        {step === 2 && (
          <form noValidate onSubmit={onStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, padding: '10px 14px', borderRadius: 8, background: '#F3F7FB', fontSize: '.9rem', color: '#4A4567', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <span>{summary}</span>
              <button type="button" onClick={() => { setStep(1); setErrors({}) }} style={{ minHeight: 40, padding: '0 10px', border: 0, background: 'none', color: '#3B1A7A', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>Edit</button>
            </p>
            <div style={groupStyle}>
              <label htmlFor="q-name" style={labelStyle}>Your name <Req /></label>
              <input id="q-name" name="name" type="text" required autoComplete="name" value={form.name} onChange={onField} aria-invalid={!!errors.name} aria-describedby="err-name" className="field" style={fieldStyle(errors.name)} />
              <p id="err-name" aria-live="polite" style={errStyle}>{errors.name}</p>
            </div>
            <div style={groupStyle}>
              <label htmlFor="q-phone" style={labelStyle}>Mobile number <Req /></label>
              <input id="q-phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="604 555 0123" value={form.phone} onChange={onField} aria-invalid={!!errors.phone} aria-describedby="err-phone" className="field" style={fieldStyle(errors.phone)} />
              <p id="err-phone" aria-live="polite" style={errStyle}>{errors.phone}</p>
            </div>
            <div style={groupStyle}>
              <label htmlFor="q-email" style={labelStyle}>Email <Opt /></label>
              <input id="q-email" name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={onField} aria-invalid={!!errors.email} aria-describedby="err-email" className="field" style={fieldStyle(errors.email)} />
              <p id="err-email" aria-live="polite" style={errStyle}>{errors.email}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 16 }}>
              <div style={groupStyle}>
                <label htmlFor="q-type" style={labelStyle}>Event type <Opt /></label>
                <select id="q-type" name="eventType" value={form.eventType} onChange={onField} className="field" style={fieldStyle()}>
                  <option value="">Select…</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="bbq">BBQ / backyard party</option>
                  <option value="corporate">Corporate event</option>
                  <option value="vendor">Vendor / market</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={groupStyle}>
                <label htmlFor="q-guests" style={labelStyle}>Guest count <Opt /></label>
                <input id="q-guests" name="guests" type="number" inputMode="numeric" min={1} value={form.guests} onChange={onField} className="field" style={fieldStyle()} />
              </div>
            </div>
            <div style={groupStyle}>
              <label htmlFor="q-requests" style={labelStyle}>Special requests <Opt /></label>
              <textarea id="q-requests" name="requests" rows={3} value={form.requests} onChange={onField} placeholder="Venue details, timing, second machine, anything else" className="field" style={{ ...fieldStyle(), minHeight: 84, resize: 'vertical' }} />
            </div>
            <div style={groupStyle}>
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', minHeight: 44, fontSize: '.95rem', color: '#1B1535' }}>
                <input name="consent" type="checkbox" checked={form.consent} onChange={onField} aria-invalid={!!errors.consent} aria-describedby="err-consent" style={{ width: 22, height: 22, margin: '2px 0 0', flex: 'none', accentColor: '#3B1A7A' }} />
                <span>I agree to be contacted about this quote by phone, text or email. See our <a href="#privacy">privacy policy</a>.</span>
              </label>
              <p id="err-consent" aria-live="polite" style={errStyle}>{errors.consent}</p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 56, padding: '0 24px', background: '#3B1A7A', color: '#fff', border: 0, borderRadius: 10, fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer' }}>{submitting ? 'Sending…' : 'Request My Quote'}</button>
            <p style={{ margin: 0, fontSize: '.85rem', color: '#5B6472', textAlign: 'center' }}>What happens next: we check your date and location, then get back to you by phone, text or email with availability and your total price.</p>
          </form>
        )}

        {step === 3 && (
          <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '12px 0 8px' }}>
            <span style={{ width: 56, height: 56, borderRadius: 12, background: '#EAF7FD', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><CheckIcon stroke="#3B1A7A" size={28} /></span>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#1B1535', maxWidth: '38ch' }}>Request received. We'll contact you to confirm availability, price and setup details.</p>
            <p style={{ margin: 0, fontSize: '.9rem', color: '#5B6472' }}>Reference: <span style={{ fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>{leadId.slice(0, 8).toUpperCase()}</span></p>
            <button type="button" onClick={close} style={{ minHeight: 48, padding: '0 24px', borderRadius: 8, border: '2px solid #3B1A7A', background: '#fff', color: '#3B1A7A', fontWeight: 700, cursor: 'pointer', marginTop: 6 }}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
