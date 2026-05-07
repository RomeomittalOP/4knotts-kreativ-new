import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import './pages.css'
import './BuildProjectPage.css'

const STEPS = ['Services', 'Quality', 'Budget', 'Brief', 'Review']

const BUDGETS = [
  '< ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000',
  '₹50,000 – ₹1,00,000', '> ₹1,00,000', 'Not sure yet',
]
const TIMELINES = ['ASAP (rush)', '2–4 weeks', '1–2 months', '2–3 months', 'Flexible']

export default function BuildProjectPage() {
  const { state } = useLocation()
  const { user, openAuth } = useAuth()
  const [catalog, setCatalog] = useState({ services: [], packages: [] })
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [estimate, setEstimate] = useState({ min: 0, max: 0, breakdown: [] })

  const [data, setData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    services: state?.services || [],
    qualityTier: state?.preselectTier === 'basic' ? 'basic' : (state?.tier || (state?.preselectTier === 'premium' ? 'premium' : 'pro')),
    budget: '',
    timeline: '',
    requirements: '',
    files: [],
  })

  useEffect(() => {
    api.get('/pricing/catalog').then((r) => setCatalog(r.data)).catch(() => {})
  }, [])

  // Live estimate
  useEffect(() => {
    if (data.services.length === 0) { setEstimate({ min: 0, max: 0, breakdown: [] }); return }
    const t = setTimeout(() => {
      api.post('/pricing/estimate', { services: data.services, tier: data.qualityTier })
        .then((r) => setEstimate(r.data))
        .catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [data.services, data.qualityTier])

  const update = (k, v) => setData((p) => ({ ...p, [k]: v }))
  const toggleSvc = (id) => update('services',
    data.services.includes(id) ? data.services.filter((s) => s !== id) : [...data.services, id]
  )

  const fmt = (n) => '₹' + n.toLocaleString('en-IN')

  const validateStep = () => {
    if (step === 0 && data.services.length === 0) return 'Please select at least one service.'
    if (step === 3) {
      if (!data.name || data.name.trim().length < 2) return 'Name is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email is required.'
      if (data.requirements.trim().length < 20) return 'Tell us a bit more — at least 20 characters.'
    }
    return ''
  }

  const next = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }
  const back = () => { setError(''); setStep((s) => Math.max(0, s - 1)) }

  const submit = async () => {
    setBusy(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'files') return
        if (Array.isArray(v)) v.forEach((x) => fd.append(`${k}[]`, x))
        else fd.append(k, v)
      })
      data.files.forEach((f) => fd.append('files', f))
      const r = await api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSubmitted(r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Try again.')
    } finally { setBusy(false) }
  }

  if (submitted) return <BuildSuccess result={submitted} onRestart={() => { setSubmitted(null); setStep(0); }} />

  return (
    <div className="page-wrap build-page">
      <header className="page-header">
        <p className="section-label">Build Your Project</p>
        <h1 className="page-title">
          Let's draft your <span className="gradient-text">brief</span>
        </h1>
        <p className="page-sub">Five quick steps. No obligation. Live cost estimate as you go.</p>
        {!user && (
          <button className="auth-prompt" onClick={() => openAuth('signup')}>
            💡 Sign up to save your brief & track responses →
          </button>
        )}
      </header>

      <div className="build-stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`step-pip${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
            <span className="pip-num">{i + 1}</span>
            <span className="pip-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="build-grid">
        <div className="build-main glass">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="build-step"
            >
              {step === 0 && (
                <>
                  <h3>What do you need built?</h3>
                  <p className="step-hint">Select all that apply.</p>
                  <div className="services-grid">
                    {catalog.services.map((s) => (
                      <label key={s.id} className={`svc-toggle${data.services.includes(s.id) ? ' checked' : ''}`}>
                        <input type="checkbox" checked={data.services.includes(s.id)} onChange={() => toggleSvc(s.id)} hidden />
                        <span className="svc-toggle-check">{data.services.includes(s.id) ? '✓' : '+'}</span>
                        <span className="svc-toggle-label">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h3>What level of polish?</h3>
                  <p className="step-hint">This drives the depth of craft, not the timeline alone.</p>
                  <div className="tier-grid">
                    {[
                      { id: 'basic',   label: 'Basic',   desc: 'Templated foundation, fast turnaround.' },
                      { id: 'pro',     label: 'Pro',     desc: 'Custom design + animation + polish.' },
                      { id: 'premium', label: 'Premium', desc: 'Bespoke, end-to-end, white-glove.' },
                    ].map((t) => (
                      <button key={t.id} className={`tier-btn${data.qualityTier === t.id ? ' active' : ''}`} onClick={() => update('qualityTier', t.id)}>
                        <span className="tier-name">{t.label}</span>
                        <span className="tier-blurb">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3>What's your budget range?</h3>
                  <p className="step-hint">Helps us scope the right approach.</p>
                  <div className="chip-grid">
                    {BUDGETS.map((b) => (
                      <button key={b} className={`chip${data.budget === b ? ' active' : ''}`} onClick={() => update('budget', b)}>{b}</button>
                    ))}
                  </div>
                  <h4 style={{ marginTop: '1.4rem' }}>Timeline?</h4>
                  <div className="chip-grid">
                    {TIMELINES.map((t) => (
                      <button key={t} className={`chip${data.timeline === t ? ' active' : ''}`} onClick={() => update('timeline', t)}>{t}</button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3>Tell us about you & the project</h3>
                  <div className="field-row">
                    <Field label="Your Name" value={data.name} onChange={(v) => update('name', v)} placeholder="Jane Doe" />
                    <Field label="Email" type="email" value={data.email} onChange={(v) => update('email', v)} placeholder="jane@example.com" />
                  </div>
                  <Field label="Phone (optional)" type="tel" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+91 98765 43210" />
                  <div className="field">
                    <label className="auth-label">Project Description</label>
                    <textarea
                      className="auth-input build-textarea"
                      rows={5}
                      placeholder="What are you building? Goals? Audience? Aesthetic references?"
                      value={data.requirements}
                      onChange={(e) => update('requirements', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="auth-label">Reference Files (optional)</label>
                    <FileUploader files={data.files} onChange={(files) => update('files', files)} />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h3>Review your brief</h3>
                  <p className="step-hint">Last check before we send.</p>
                  <div className="review-grid">
                    <ReviewItem label="Services" value={data.services.map((id) => catalog.services.find((s) => s.id === id)?.label || id).join(', ') || '—'} />
                    <ReviewItem label="Tier"     value={data.qualityTier.toUpperCase()} />
                    <ReviewItem label="Budget"   value={data.budget || '—'} />
                    <ReviewItem label="Timeline" value={data.timeline || '—'} />
                    <ReviewItem label="Contact"  value={`${data.name} · ${data.email}${data.phone ? ` · ${data.phone}` : ''}`} />
                    <ReviewItem label="Files"    value={data.files.length ? `${data.files.length} attached` : 'none'} />
                  </div>
                  <div className="review-brief">
                    <label className="auth-label">Brief</label>
                    <p>{data.requirements || '(none)'}</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="auth-error" style={{ marginTop: '1rem' }}>{error}</p>}

          <div className="build-actions">
            <button className="btn-ghost" onClick={back} disabled={step === 0}>← Back</button>
            {step < STEPS.length - 1
              ? <button className="btn-primary" onClick={next}><span>Continue →</span></button>
              : <button className="btn-primary" onClick={submit} disabled={busy}>
                  <span>{busy ? '⏳ Sending…' : '🚀 Submit Brief'}</span>
                </button>}
          </div>
        </div>

        <aside className="build-sidebar glass">
          <p className="section-label">Live Estimate</p>
          {data.services.length === 0 ? (
            <p className="estimate-empty">Select at least one service to see your estimate.</p>
          ) : (
            <>
              <div className="estimate-range">
                <span className="estimate-min">{fmt(estimate.min)}</span>
                <span className="estimate-sep">—</span>
                <span className="estimate-max">{fmt(estimate.max)}</span>
              </div>
              <p className="estimate-note">
                <strong>{data.qualityTier}</strong> tier · {data.services.length} service(s)
              </p>
              <ul className="estimate-breakdown">
                {(estimate.breakdown || []).map((b) => (
                  <li key={b.service}>
                    <span>{b.label}</span>
                    <span className="estimate-line-price">{fmt(b.price)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="sidebar-trust">
            <p className="trust-line">✓ Free discovery call</p>
            <p className="trust-line">✓ No upfront commitment</p>
            <p className="trust-line">✓ Response within 24 hours</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="field">
      <label className="auth-label">{label}</label>
      <input className="auth-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function ReviewItem({ label, value }) {
  return (
    <div className="review-item">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
    </div>
  )
}

function FileUploader({ files, onChange }) {
  const [drag, setDrag] = useState(false)
  const handle = (newFiles) => {
    const merged = [...files, ...Array.from(newFiles)].slice(0, 5)
    onChange(merged)
  }
  const remove = (i) => onChange(files.filter((_, idx) => idx !== i))
  return (
    <div
      className={`file-drop${drag ? ' active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
    >
      <input type="file" multiple onChange={(e) => handle(e.target.files)} hidden id="file-input"
        accept=".pdf,.png,.jpg,.jpeg,.gif,.svg,.doc,.docx,.xlsx,.zip,.fig,.sketch,.psd,.ai,.txt" />
      <label htmlFor="file-input" className="file-drop-label">
        <span className="file-drop-icon">📎</span>
        <span>Drop files here or <strong>browse</strong></span>
        <span className="file-drop-hint">Up to 5 files · Max 10 MB each · PDF, images, design files</span>
      </label>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={i}>
              <span>📄 {f.name}</span>
              <button onClick={() => remove(i)} title="Remove">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BuildSuccess({ result, onRestart }) {
  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN')
  return (
    <div className="page-wrap build-page">
      <motion.div
        className="build-success glass"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <div className="success-anim">
          <span className="success-check">✓</span>
          <div className="success-ring" />
        </div>
        <h2>Brief received!</h2>
        <p>We've logged your project and sent a confirmation to your email. Expect a personalised proposal within 24 hours.</p>
        {result.estimatedRange && (
          <div className="estimate-range" style={{ justifyContent: 'center' }}>
            <span className="estimate-min">{fmt(result.estimatedRange.min)}</span>
            <span className="estimate-sep">—</span>
            <span className="estimate-max">{fmt(result.estimatedRange.max)}</span>
          </div>
        )}
        <button className="btn-primary" onClick={onRestart}><span>Submit another brief</span></button>
      </motion.div>
    </div>
  )
}
