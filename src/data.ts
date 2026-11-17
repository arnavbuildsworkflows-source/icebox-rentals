export type VariantKey = 'default' | 'weddings' | 'backyard' | 'corporate'
export type PriceCue = 'price' | 'quote-line'

export const VARIANTS: Record<VariantKey, { headline: string; subhead: string }> = {
  default: { headline: 'Never run out of ice.', subhead: 'Ice machine rentals for weddings, parties and events across Surrey and Metro Vancouver. Delivered, set up and picked up.' },
  weddings: { headline: 'Ice for every toast, all night.', subhead: 'Ice machine rentals for weddings across Metro Vancouver. Delivered, set up, picked up.' },
  backyard: { headline: 'Keep the cooler full of ice.', subhead: 'Ice machine rentals for backyard parties and BBQs. Delivered, set up, picked up.' },
  corporate: { headline: 'Ice handled. Event sorted.', subhead: 'Ice machine rentals for corporate events across Metro Vancouver. Delivered, set up, picked up.' },
}

// [SERVICE AREA LIST] — placeholder; replace with the verified eligible-city list.
export const CITIES = ['Surrey', 'White Rock', 'Delta', 'Langley', 'Richmond', 'Burnaby', 'New Westminster', 'Vancouver', 'Coquitlam', 'Port Coquitlam', 'Port Moody', 'North Vancouver', 'West Vancouver', 'Maple Ridge', 'Pitt Meadows']

export const FAQS = [
  { q: 'What water and power do I need?', a: 'A standard household power outlet and water access near the setup spot. Most backyards, halls and tents have both. When we confirm your quote we walk through exactly what to have ready, so delivery day is simple.' },
  { q: 'When do you deliver and pick up?', a: 'We agree a delivery and pickup window with you when we confirm your quote. We aim to set up early enough that the bin is full before your first guests arrive, and we collect the machine once your event wraps.' },
  { q: 'How is the machine cleaned?', a: 'Every machine is cleaned and sanitized between rentals, inside and out, and arrives ready to make ice for food and drinks. Just keep the lid closed between scoops and use the provided scoop.' },
  { q: 'What if the machine stops working during my event?', a: 'Call or text us right away. Most issues are a tripped outlet or a kinked hose and we can talk you through it in minutes. If it is something more, we will work out the fastest fix with you.' },
  { q: 'Is there a deposit? Can I cancel?', a: 'Your quote sets out the deposit and cancellation terms in writing before anything is charged, so you know exactly where you stand. Plans change — talk to us as early as you can and we will do our best to help.' },
  { q: 'Where do you deliver?', a: "We're based in Surrey and deliver to eligible locations across Metro Vancouver. Delivery is based on distance from our base, and the fee is shown clearly in your quote." },
  { q: 'How far ahead should I book?', a: 'The earlier the better, especially for summer weekends. Submitting a quote request does not hold a date — we confirm availability with you directly, and your date is only reserved once your booking is confirmed.' },
]

export const SPECS = [
  { label: 'Daily ice output', ph: '[OUTPUT/DAY]' }, { label: 'Bin storage', ph: '[BIN CAPACITY]' }, { label: 'Power', ph: '[POWER REQ]' },
  { label: 'Water', ph: '[WATER REQ]' }, { label: 'Footprint', ph: '[W × D × H]' }, { label: 'Time to first ice', ph: '[TIME TO ICE]' },
]

export const PACKAGES = [
  { name: 'Single Day', duration: '1-day rental', price: '[PRICE]', includes: ['One ice machine for your event day', 'Delivery, setup and a quick walkthrough', 'Pickup after your event', 'Cleaned and sanitized before arrival'] },
  { name: 'Weekend', duration: 'Fri – Mon rental', price: '[PRICE]', includes: ['One ice machine Friday to Monday', 'Delivery, setup and a quick walkthrough', 'Pickup when the weekend is over', 'Cleaned and sanitized before arrival'] },
]

export const STEPS = [
  { n: 1, title: 'Tell us your date and location.', body: 'Two quick fields, under a minute. No account, no payment details, and nothing is booked yet.' },
  { n: 2, title: 'We confirm the quote and delivery details.', body: 'We check availability and reply with your total price, a delivery window and what to have ready at the venue.' },
  { n: 3, title: 'We deliver, set up and collect the machine.', body: 'We roll it in, get it producing, and come back for it when the party is over. You just scoop.' },
]

export const PHONE = '[PHONE]'
export const EMAIL = '[EMAIL]'

export type Utm = Partial<Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term', string>>

declare global {
  interface Window {
    trackEvent?: (name: string, props?: Record<string, unknown>) => void
    submitLead?: (payload: Record<string, unknown>) => Promise<{ ok: boolean }>
  }
}

export function track(name: string, props?: Record<string, unknown>) {
  window.trackEvent?.(name, props)
}

export function installStubs() {
  // ===== STUB: wire GA4 / Meta / Google Ads here =====
  window.trackEvent = window.trackEvent || function (name, props) { console.log('[trackEvent]', name, props || {}) }
  // ===== STUB: connect to CRM / inbox here (return a Promise) =====
  window.submitLead = window.submitLead || async function (payload) { console.log('[submitLead]', payload); return { ok: true } }
}

export function readUtm(): Utm {
  const p = new URLSearchParams(location.search)
  let utm: Utm = {}
  try { utm = JSON.parse(sessionStorage.getItem('icebox_utm') || '{}') } catch { /* ignore */ }
  ;(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const).forEach(k => { const v = p.get(k); if (v) utm[k] = v })
  try { sessionStorage.setItem('icebox_utm', JSON.stringify(utm)) } catch { /* ignore */ }
  return utm
}

export function resolveVariant(v: string | null | undefined): VariantKey {
  return v && v in VARIANTS ? (v as VariantKey) : 'default'
}
