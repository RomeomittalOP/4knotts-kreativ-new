import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './Contact.css'

const CONTACT_INFO = [
  { icon: '📧', label: 'Email', value: 'hello@4knottskreativ.com' },
  { icon: '📍', label: 'Location', value: 'India · Remote Worldwide' },
  { icon: '⏰', label: 'Response time', value: '< 24 hours' },
]

export default function Contact() {
  const sectionRef = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo('.contact-left > *',
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
          )
          gsap.fromTo('.contact-right',
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
          )
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Shake animation
      gsap.fromTo('.contact-form', { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
      gsap.fromTo('.contact-success', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.6)' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section contact-section" ref={sectionRef}>
      <div className="contact-bg" />

      <div className="contact-inner">
        {/* Left */}
        <div className="contact-left">
          <p className="section-label">Get In Touch</p>
          <h2 className="section-title">
            Start a <span className="gradient-text">Conversation</span>
          </h2>
          <p className="contact-desc">
            Have a project in mind? Drop us a brief and we'll get back within a day.
            No obligation, no sales pitch — just an honest conversation about your goals.
          </p>

          <div className="contact-info-list">
            {CONTACT_INFO.map((item) => (
              <div key={item.label} className="contact-info-item">
                <span className="ci-icon">{item.icon}</span>
                <div>
                  <span className="ci-label">{item.label}</span>
                  <span className="ci-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-socials">
            {['Twitter', 'Instagram', 'LinkedIn', 'GitHub'].map((s) => (
              <span key={s} className="social-chip glass">{s}</span>
            ))}
          </div>
        </div>

        {/* Right – form */}
        <div className="contact-right">
          {status === 'success' ? (
            <div className="contact-success glass">
              <div className="success-anim">
                <span className="success-check">✓</span>
                <div className="success-ring" />
              </div>
              <h3>Message Sent!</h3>
              <p>We'll be in touch within 24 hours. Exciting things ahead.</p>
              <button className="btn-primary" onClick={() => setStatus('idle')}>
                <span>Send Another</span>
              </button>
            </div>
          ) : (
            <form className="contact-form glass" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className={`form-group${errors.name ? ' form-group--error' : ''}`}>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange('name')}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className={`form-group${errors.email ? ' form-group--error' : ''}`}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              <div className={`form-group${errors.message ? ' form-group--error' : ''}`}>
                <label className="form-label">Message</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Tell us about your project, timeline, and goals…"
                  rows={5}
                  value={form.message}
                  onChange={handleChange('message')}
                />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>

              {status === 'error' && (
                <p className="form-server-error">Something went wrong. Please try again.</p>
              )}

              <button type="submit" className="btn-primary form-submit" disabled={status === 'loading'}>
                <span>{status === 'loading' ? '⏳ Sending…' : '🚀 Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
