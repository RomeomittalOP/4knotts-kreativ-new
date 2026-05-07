const { isMongoReady } = require('../config/db')
const User = require('../models/User')
const json = require('../services/jsonStore')
const { createOtp, verifyOtp } = require('../services/otpService')
const { sendMail, tpl } = require('../services/emailService')
const { signToken } = require('../middleware/auth')

const findUser = async (filter) => {
  if (isMongoReady()) return User.findOne(filter)
  return json.findOne('users', filter) || null
}
const createUser = async (data) => {
  if (isMongoReady()) {
    const u = new User(data); await u.save(); return u
  }
  return json.insert('users', { ...data, emailVerified: false, phoneVerified: false })
}
const safeUser = (u) => u.toSafeJSON ? u.toSafeJSON() : ({
  id: u._id, name: u.name, email: u.email, phone: u.phone,
  emailVerified: !!u.emailVerified, phoneVerified: !!u.phoneVerified,
})

// Validation
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '')
const isPhone = (s) => /^\+?[0-9]{10,15}$/.test((s || '').replace(/\s/g, ''))

// ─── Send OTP (signup or login) ──────────────────────────
exports.sendOtp = async (req, res) => {
  const { phone, email, purpose = 'login' } = req.body
  const channel = phone ? 'phone' : 'email'
  const target = phone || email

  if (channel === 'phone' && !isPhone(phone)) return res.status(400).json({ error: 'Invalid phone number' })
  if (channel === 'email' && !isEmail(email)) return res.status(400).json({ error: 'Invalid email' })

  if (purpose === 'login') {
    const user = await findUser(channel === 'phone' ? { phone: target } : { email: target.toLowerCase() })
    if (!user) return res.status(404).json({ error: 'No account found. Sign up first.' })
  }

  try {
    const result = await createOtp({ channel, target, purpose })
    res.json({
      success: true,
      message: `OTP sent to your ${channel}`,
      expiresAt: result.expiresAt,
      // dev only — exposed for testing convenience
      ...(result.code ? { devCode: result.code } : {}),
    })
  } catch (err) {
    console.error('sendOtp error:', err)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
}

// ─── Signup (verifies OTP, creates account, returns token) ────
exports.signup = async (req, res) => {
  const { name, email, phone, code, password } = req.body
  if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Name is required' })
  if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' })
  if (!isPhone(phone))  return res.status(400).json({ error: 'Invalid phone' })
  if (!code || code.length !== 6) return res.status(400).json({ error: 'OTP code required' })

  // Check duplicate
  const existing = await findUser({ phone })
  if (existing) return res.status(409).json({ error: 'Phone already registered. Try logging in.' })
  const existingEmail = await findUser({ email: email.toLowerCase() })
  if (existingEmail) return res.status(409).json({ error: 'Email already registered.' })

  // Verify OTP (sent via phone for signup)
  const v = await verifyOtp({ channel: 'phone', target: phone, code, purpose: 'signup' })
  if (!v.ok) return res.status(400).json({ error: otpReason(v) })

  let user
  if (isMongoReady()) {
    user = new User({ name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(), phoneVerified: true })
    if (password) await user.setPassword(password)
    await user.save()
  } else {
    user = await createUser({ name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(), phoneVerified: true })
  }

  // Welcome email + admin notification
  try {
    const t = tpl.signupWelcome({ name: user.name })
    await sendMail({ to: user.email, subject: t.subject, html: t.html, text: t.text })
    await sendMail({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `🆕 New signup: ${user.name}`,
      html: `<p><strong>${user.name}</strong> &lt;${user.email}&gt; · ${user.phone} just created an account.</p>`,
      text: `New signup: ${user.name} <${user.email}> ${user.phone}`,
    })
  } catch (e) { console.warn('email error:', e.message) }

  const token = signToken({ id: user._id || user.id, email: user.email })
  res.status(201).json({ success: true, token, user: safeUser(user) })
}

// ─── Login (verifies OTP, returns token) ─────────────────
exports.login = async (req, res) => {
  const { phone, code } = req.body
  if (!isPhone(phone)) return res.status(400).json({ error: 'Invalid phone' })
  if (!code || code.length !== 6) return res.status(400).json({ error: 'OTP code required' })

  const user = await findUser({ phone })
  if (!user) return res.status(404).json({ error: 'No account found' })

  const v = await verifyOtp({ channel: 'phone', target: phone, code, purpose: 'login' })
  if (!v.ok) return res.status(400).json({ error: otpReason(v) })

  // Update last login
  if (isMongoReady()) { user.lastLoginAt = new Date(); await user.save() }
  else json.updateOne('users', { _id: user._id }, { lastLoginAt: new Date().toISOString() })

  const token = signToken({ id: user._id || user.id, email: user.email })
  res.json({ success: true, token, user: safeUser(user) })
}

exports.me = async (req, res) => {
  const user = await findUser({ _id: req.user.id }) || await findUser({ email: req.user.email })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: safeUser(user) })
}

const otpReason = (v) => {
  switch (v.reason) {
    case 'no_otp':            return 'No OTP found. Request a new one.'
    case 'expired':           return 'OTP expired. Please request a new one.'
    case 'too_many_attempts': return 'Too many failed attempts. Request a new OTP.'
    case 'mismatch':          return `Incorrect code. ${v.attemptsLeft} attempt(s) left.`
    default:                  return 'OTP verification failed.'
  }
}
