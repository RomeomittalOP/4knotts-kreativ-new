import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import './AuthModal.css'

export default function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModalMode, closeAuth, sendOtp, signup, login } = useAuth()
  const [step, setStep] = useState(1)         // 1 = details, 2 = OTP
  const [form, setForm] = useState({ name: '', email: '', phone: '', code: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [devCode, setDevCode] = useState(null)
  const [resendIn, setResendIn] = useState(0)

  // Reset on open / mode change
  useEffect(() => {
    if (authModalOpen) {
      setStep(1); setError(''); setInfo(''); setDevCode(null); setResendIn(0)
      setForm({ name: '', email: '', phone: '', code: '' })
    }
  }, [authModalOpen, authModalMode])

  // Countdown for resend
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  // Esc closes
  useEffect(() => {
    if (!authModalOpen) return
    const onKey = (e) => e.key === 'Escape' && closeAuth()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [authModalOpen, closeAuth])

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const requestOtp = async () => {
    setError(''); setInfo('')
    if (authModalMode === 'signup') {
      if (!form.name.trim()) return setError('Name is required')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Valid email required')
    }
    if (!/^\+?[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) {
      return setError('Enter a valid phone (10-15 digits)')
    }
    setBusy(true)
    try {
      const r = await sendOtp({
        phone: form.phone.trim(),
        purpose: authModalMode,
      })
      setStep(2); setResendIn(30)
      setInfo(`OTP sent to ${form.phone}`)
      if (r.devCode) setDevCode(r.devCode)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally { setBusy(false) }
  }

  const verifyAndAuth = async () => {
    setError(''); setInfo('')
    if (form.code.length !== 6) return setError('Enter the 6-digit code')
    setBusy(true)
    try {
      if (authModalMode === 'signup') {
        await signup({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), code: form.code })
      } else {
        await login({ phone: form.phone.trim(), code: form.code })
      }
      closeAuth()
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally { setBusy(false) }
  }

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          className="auth-overlay"
          initial={{ opacity: 0, backdropFilter: 'blur(0)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0)' }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && closeAuth()}
        >
          <motion.div
            className="auth-card glass"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button className="auth-close" onClick={closeAuth} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="auth-tabs">
              <button
                className={`auth-tab${authModalMode === 'login' ? ' active' : ''}`}
                onClick={() => setAuthModalMode('login')}
              >Log In</button>
              <button
                className={`auth-tab${authModalMode === 'signup' ? ' active' : ''}`}
                onClick={() => setAuthModalMode('signup')}
              >Sign Up</button>
              <span className={`auth-tab-indicator auth-tab-indicator--${authModalMode}`} />
            </div>

            <div className="auth-header">
              <p className="auth-eyebrow">{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
              <h2 className="auth-title">
                {step === 1
                  ? (authModalMode === 'signup' ? 'Create your account' : 'Welcome back')
                  : 'Enter the 6-digit code'}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="auth-form"
                >
                  {authModalMode === 'signup' && (
                    <>
                      <Field label="Full Name" value={form.name} onChange={update('name')} placeholder="Jane Doe" />
                      <Field label="Email" type="email" value={form.email} onChange={update('email')} placeholder="jane@example.com" />
                    </>
                  )}
                  <Field
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="+91 98765 43210"
                    hint="We'll send a one-time code via SMS"
                  />
                  {error && <p className="auth-error">{error}</p>}
                  <button className="btn-primary auth-submit" onClick={requestOtp} disabled={busy}>
                    <span>{busy ? '⏳ Sending…' : '🔐 Send OTP'}</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="auth-form"
                >
                  <p className="auth-hint">{info || `Code sent to ${form.phone}`}</p>
                  {devCode && (
                    <p className="auth-dev-hint">
                      🛠 Dev mode — code: <strong>{devCode}</strong>
                    </p>
                  )}
                  <OtpInput value={form.code} onChange={(v) => setForm((p) => ({ ...p, code: v }))} />
                  {error && <p className="auth-error">{error}</p>}
                  <button className="btn-primary auth-submit" onClick={verifyAndAuth} disabled={busy || form.code.length !== 6}>
                    <span>{busy ? '⏳ Verifying…' : '✓ Verify & Continue'}</span>
                  </button>
                  <div className="auth-resend-row">
                    <button className="auth-link" onClick={() => setStep(1)}>← Edit details</button>
                    {resendIn > 0
                      ? <span className="auth-muted">Resend in {resendIn}s</span>
                      : <button className="auth-link" onClick={requestOtp} disabled={busy}>Resend OTP</button>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="auth-fineprint">
              By continuing you agree to our terms and that we'll occasionally email about your projects.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <input className="auth-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
      {hint && <span className="auth-field-hint">{hint}</span>}
    </div>
  )
}

function OtpInput({ value, onChange }) {
  const refs = useRef([])
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  const setDigit = (i, d) => {
    if (!/^[0-9]?$/.test(d)) return
    const arr = digits.map((c) => c.trim())
    arr[i] = d
    onChange(arr.join('').slice(0, 6))
    if (d && i < 5) refs.current[i + 1]?.focus()
  }

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  const onPaste = (e) => {
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
    if (pasted) { e.preventDefault(); onChange(pasted); refs.current[Math.min(5, pasted.length - 1)]?.focus() }
  }

  return (
    <div className="otp-input">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          className={`otp-digit${d.trim() ? ' filled' : ''}`}
        />
      ))}
    </div>
  )
}
