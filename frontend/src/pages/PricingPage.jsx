import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'
import './pages.css'
import './PricingPage.css'

const QUALITY_TIERS = [
  { id: 'basic',   label: 'Basic',   blurb: 'Essentials, fast turnaround' },
  { id: 'pro',     label: 'Pro',     blurb: 'Custom craft + animation' },
  { id: 'premium', label: 'Premium', blurb: 'Bespoke, end-to-end' },
]

export default function PricingPage() {
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState({ services: [], packages: [] })
  const [tier, setTier] = useState('pro')
  const [selected, setSelected] = useState([])
  const [estimate, setEstimate] = useState({ min: 0, max: 0, breakdown: [] })

  useEffect(() => {
    api.get('/pricing/catalog')
      .then((r) => setCatalog(r.data))
      .catch(() => setCatalog({ services: [], packages: [] }))
  }, [])

  // Live estimate (debounced)
  useEffect(() => {
    if (selected.length === 0) { setEstimate({ min: 0, max: 0, breakdown: [] }); return }
    const t = setTimeout(() => {
      api.post('/pricing/estimate', { services: selected, tier })
        .then((r) => setEstimate(r.data))
        .catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [selected, tier])

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const fmt = (n) => '₹' + n.toLocaleString('en-IN')

  return (
    <div className="page-wrap pricing-page">
      <header className="page-header">
        <p className="section-label">Investment</p>
        <h1 className="page-title">
          Transparent <span className="gradient-text">pricing</span>, tailored to your scope
        </h1>
        <p className="page-sub">
          Pick a starter package or compose your own. Every project quotes a precise number after a discovery call.
        </p>
      </header>

      {/* Packages */}
      <section className="packages-grid">
        {catalog.packages.map((p, i) => (
          <motion.div
            key={p.id}
            className={`pkg-card glass${p.highlighted ? ' pkg-card--highlight' : ''}`}
            style={{ '--pkg-color': p.color }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            {p.highlighted && <div className="pkg-badge">◆ MOST POPULAR</div>}
            <div className="pkg-top-bar" />
            <p className="pkg-name">{p.name}</p>
            <div className="pkg-price-row">
              <span className="pkg-from">Starting from</span>
              <span className="pkg-price">{fmt(p.startingFrom)}</span>
            </div>
            <p className="pkg-subtitle">{p.subtitle}</p>
            <p className="pkg-tagline">{p.tagline}</p>
            <div className="pkg-divider" />
            <ul className="pkg-list">
              {p.inclusions.map((f) => (
                <li key={f}><span className="pkg-tick">✓</span><span>{f}</span></li>
              ))}
            </ul>
            <button
              className={`pkg-btn${p.highlighted ? ' pkg-btn--highlight' : ''}`}
              onClick={() => navigate('/build', { state: { preselectTier: p.id } })}
            >
              <span>Configure {p.name}</span>
            </button>
          </motion.div>
        ))}
      </section>

      {/* Builder */}
      <section className="builder-panel glass">
        <div className="builder-header">
          <div>
            <p className="section-label">Custom Estimator</p>
            <h2 className="builder-title">Compose your own package</h2>
          </div>
          <Link to="/build" className="builder-link">
            Need to send a brief? <span>→</span>
          </Link>
        </div>

        <div className="builder-grid">
          {/* Services */}
          <div className="builder-block">
            <p className="builder-block-label">1. Pick services</p>
            <div className="services-grid">
              {catalog.services.map((s) => (
                <label
                  key={s.id}
                  className={`svc-toggle${selected.includes(s.id) ? ' checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    hidden
                  />
                  <span className="svc-toggle-check">{selected.includes(s.id) ? '✓' : '+'}</span>
                  <span className="svc-toggle-label">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tier */}
          <div className="builder-block">
            <p className="builder-block-label">2. Choose quality</p>
            <div className="tier-grid">
              {QUALITY_TIERS.map((t) => (
                <button
                  key={t.id}
                  className={`tier-btn${tier === t.id ? ' active' : ''}`}
                  onClick={() => setTier(t.id)}
                >
                  <span className="tier-name">{t.label}</span>
                  <span className="tier-blurb">{t.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Estimate */}
          <div className="builder-block builder-estimate">
            <p className="builder-block-label">3. Your estimate</p>
            <div className="estimate-card">
              {selected.length === 0 ? (
                <p className="estimate-empty">Select services to see a live estimate.</p>
              ) : (
                <>
                  <div className="estimate-range">
                    <span className="estimate-min">{fmt(estimate.min)}</span>
                    <span className="estimate-sep">—</span>
                    <span className="estimate-max">{fmt(estimate.max)}</span>
                  </div>
                  <p className="estimate-note">
                    Range based on <strong>{tier}</strong> tier. Final quote follows discovery.
                  </p>
                  <ul className="estimate-breakdown">
                    {(estimate.breakdown || []).map((b) => (
                      <li key={b.service}>
                        <span>{b.label}</span>
                        <span className="estimate-line-price">{fmt(b.price)}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn-primary estimate-cta"
                    onClick={() => navigate('/build', { state: { services: selected, tier } })}
                  >
                    <span>📝 Send a brief</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
