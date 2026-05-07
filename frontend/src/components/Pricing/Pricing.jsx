import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useNavigation } from '../../context/NavigationContext'
import './Pricing.css'

const PLANS = [
  {
    id: 'recon',
    codename: 'RECON',
    price: '₹5,000',
    subtitle: 'Scout the territory',
    tagline: 'For early-stage projects & startups',
    features: [
      'Landing page (1 page)',
      'Responsive design',
      'Contact form integration',
      'Basic SEO setup',
      '3 revision rounds',
      '2 weeks delivery',
    ],
    color: '#d4d4d8',
    highlighted: false,
  },
  {
    id: 'strike',
    codename: 'STRIKE',
    price: '₹8,000',
    subtitle: 'Execute with precision',
    tagline: 'Most popular — for growing brands',
    features: [
      'Multi-page website (up to 6)',
      'Custom animations & GSAP',
      'CMS integration',
      'Full SEO optimisation',
      'Unlimited revisions',
      '4 weeks delivery',
      'Performance audit',
    ],
    color: '#e8141e',
    highlighted: true,
  },
  {
    id: 'overwatch',
    codename: 'OVERWATCH',
    price: '₹15,000',
    subtitle: 'Dominate the landscape',
    tagline: 'Full-scale digital transformation',
    features: [
      'Full-stack web application',
      'Custom backend + database',
      'Authentication & dashboard',
      'Mobile-first design system',
      'Priority support (6 months)',
      '6 weeks delivery',
      'Analytics & A/B testing',
    ],
    color: '#06b6d4',
    highlighted: false,
  },
]

const CUSTOM_SERVICES = [
  'UI/UX Design',
  'Web Development',
  'SEO',
  'Content Creation',
  'Brand Identity',
  'Social Media',
  'Video Editing',
  'Maintenance',
]

export default function Pricing() {
  const sectionRef = useRef(null)
  const { goTo } = useNavigation()
  const [selected, setSelected] = useState([])
  const [requirement, setRequirement] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo('.pricing-header > *',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
          )
          gsap.fromTo('.plan-card',
            { opacity: 0, y: 80, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, delay: 0.3, ease: 'back.out(1.3)' }
          )
          gsap.fromTo('.custom-panel',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.8, ease: 'power3.out' }
          )
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const toggleService = (s) => {
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    if (selected.length === 0) return
    try {
      await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: selected, requirement }),
      })
    } catch (_) {}
    setSubmitted(true)
    gsap.fromTo('.custom-success', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' })
  }

  return (
    <section className="section pricing-section" ref={sectionRef}>
      <div className="pricing-bg" />

      <div className="pricing-inner">
        <div className="pricing-header">
          <p className="section-label">Investment</p>
          <h2 className="section-title">
            Choose Your <span className="gradient-text">Operation</span>
          </h2>
          <p className="pricing-sub">No hidden charges. No surprises.</p>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={() => goTo(5)} />
          ))}
        </div>

        {/* Custom plan */}
        <div className="custom-panel glass">
          <div className="custom-panel-header">
            <div>
              <p className="custom-label">Custom Operation</p>
              <h3 className="custom-title">Build Your Own Package</h3>
            </div>
            <span className="custom-badge">CLASSIFIED</span>
          </div>

          {!submitted ? (
            <form className="custom-form" onSubmit={handleCustomSubmit}>
              <div className="custom-services">
                {CUSTOM_SERVICES.map((s) => (
                  <label key={s} className={`custom-chip${selected.includes(s) ? ' checked' : ''}`}>
                    <input type="checkbox" checked={selected.includes(s)} onChange={() => toggleService(s)} hidden />
                    <span className="chip-check">{selected.includes(s) ? '✓' : '+'}</span>
                    {s}
                  </label>
                ))}
              </div>
              <textarea
                className="custom-textarea"
                rows={3}
                placeholder="Describe your project requirements…"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
              <button type="submit" className="btn-primary custom-submit" disabled={selected.length === 0}>
                <span>⚡ Submit Brief</span>
              </button>
            </form>
          ) : (
            <div className="custom-success">
              <span className="success-icon">✓</span>
              <p>Brief received. We'll respond within 24 hours.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan, onSelect }) {
  return (
    <div
      className={`plan-card glass${plan.highlighted ? ' plan-card--highlight' : ''}`}
      style={{ '--plan-color': plan.color }}
    >
      {plan.highlighted && (
        <div className="plan-badge">
          <span>◆ RECOMMENDED</span>
        </div>
      )}

      <div className="plan-top-bar" />

      <div className="plan-codename">{plan.codename}</div>
      <div className="plan-price">{plan.price}</div>
      <p className="plan-subtitle">{plan.subtitle}</p>
      <p className="plan-tagline">{plan.tagline}</p>

      <div className="plan-divider" />

      <ul className="plan-features">
        {plan.features.map((f) => (
          <li key={f} className="plan-feature">
            <span className="plan-tick">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button className={`plan-btn${plan.highlighted ? ' plan-btn--highlight' : ''}`} onClick={onSelect}>
        <span>Deploy Now</span>
      </button>
    </div>
  )
}
