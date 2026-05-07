// Server-authoritative pricing — frontend shows estimates but backend computes truth.
// Adjust these numbers freely; frontend reads /api/pricing/catalog to stay in sync.

const SERVICES = {
  'web-development':   { label: 'Web Development', basic: 12000, pro: 30000, premium: 75000 },
  'design':            { label: 'Design / UI-UX',  basic: 8000,  pro: 20000, premium: 50000 },
  'content':           { label: 'Content Creation',basic: 5000,  pro: 12000, premium: 30000 },
  'marketing':         { label: 'Marketing / SEO', basic: 6000,  pro: 15000, premium: 40000 },
  'brand-identity':    { label: 'Brand Identity',  basic: 7000,  pro: 18000, premium: 45000 },
  'video-production':  { label: 'Video Production',basic: 8000,  pro: 22000, premium: 60000 },
}

const TIER_MULT = { basic: 1, pro: 1, premium: 1 }  // per-service tier already encodes cost

const PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    startingFrom: 5000,
    subtitle: 'Launch the essentials',
    tagline: 'Perfect for solo founders & MVPs',
    inclusions: [
      'Single landing page',
      'Mobile-responsive',
      'Contact form integration',
      'Basic SEO setup',
      '2 revision rounds',
    ],
    color: '#9ca3af',
  },
  {
    id: 'pro',
    name: 'Pro',
    startingFrom: 18000,
    subtitle: 'Scale with confidence',
    tagline: 'Most popular — for growing brands',
    inclusions: [
      'Multi-page website (up to 6)',
      'Custom GSAP animations',
      'CMS integration',
      'Full SEO + analytics',
      'Unlimited revisions',
      'Performance audit',
    ],
    highlighted: true,
    color: '#ff2e4d',
  },
  {
    id: 'premium',
    name: 'Premium',
    startingFrom: 45000,
    subtitle: 'Dominate your category',
    tagline: 'Full-stack digital transformation',
    inclusions: [
      'Full-stack web application',
      'Custom backend + database',
      'Authentication & dashboard',
      'Mobile-first design system',
      'Priority support (6 months)',
      'A/B testing framework',
    ],
    color: '#e5e7eb',
  },
]

function priceFor(serviceId, tier) {
  const s = SERVICES[serviceId]
  if (!s) return 0
  const t = ['basic', 'pro', 'premium'].includes(tier) ? tier : 'pro'
  return s[t] * (TIER_MULT[t] || 1)
}

function estimate({ services = [], tier = 'pro' }) {
  if (!Array.isArray(services) || services.length === 0) return { min: 0, max: 0, breakdown: [] }
  const breakdown = services.map((id) => ({
    service: id,
    label: SERVICES[id]?.label || id,
    price: priceFor(id, tier),
  }))
  const subtotal = breakdown.reduce((s, b) => s + b.price, 0)
  // Range = ±15% to communicate uncertainty
  return {
    min: Math.round(subtotal * 0.85 / 500) * 500,
    max: Math.round(subtotal * 1.15 / 500) * 500,
    subtotal,
    breakdown,
  }
}

const catalog = () => ({
  services: Object.entries(SERVICES).map(([id, s]) => ({ id, label: s.label, basic: s.basic, pro: s.pro, premium: s.premium })),
  packages: PACKAGES,
})

module.exports = { SERVICES, PACKAGES, priceFor, estimate, catalog }
