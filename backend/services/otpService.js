const { isMongoReady } = require('../config/db')
const Otp = require('../models/Otp')
const json = require('./jsonStore')
const { sendMail, tpl } = require('./emailService')

const OTP_TTL_MS = 5 * 60 * 1000  // 5 minutes
const MAX_ATTEMPTS = 5

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

async function createOtp({ channel, target, purpose }) {
  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  // Invalidate previous codes for this target+purpose
  if (isMongoReady()) {
    await Otp.deleteMany({ channel, target, purpose, used: false })
    await Otp.create({ channel, target, code, purpose, expiresAt })
  } else {
    json.read('otps').forEach((o) => {
      if (o.channel === channel && o.target === target && o.purpose === purpose && !o.used) {
        json.updateOne('otps', { _id: o._id }, { used: true })
      }
    })
    json.insert('otps', { channel, target, code, purpose, attempts: 0, expiresAt: expiresAt.toISOString(), used: false })
  }

  // Deliver
  if (channel === 'email') {
    const t = tpl.otpEmail({ code, purpose })
    await sendMail({ to: target, subject: t.subject, html: t.html, text: t.text })
  } else if (channel === 'phone') {
    if ((process.env.SMS_PROVIDER || 'mock').toLowerCase() === 'twilio') {
      // Real Twilio integration goes here. Pseudo-code:
      // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      // await twilio.messages.create({ from: process.env.TWILIO_FROM, to: target, body: `4 Knotts code: ${code}` })
      console.log(`[twilio stub] would send OTP ${code} to ${target}`)
    } else {
      console.log(`📱 [MOCK SMS] OTP for ${target}: ${code}`)
    }
  }

  // In dev mode, return the code so the frontend can show it (optional debug aid)
  return { code: process.env.NODE_ENV === 'production' ? null : code, expiresAt }
}

async function verifyOtp({ channel, target, code, purpose }) {
  const now = Date.now()
  if (isMongoReady()) {
    const otp = await Otp.findOne({ channel, target, purpose, used: false }).sort({ createdAt: -1 })
    if (!otp) return { ok: false, reason: 'no_otp' }
    if (otp.expiresAt.getTime() < now) return { ok: false, reason: 'expired' }
    if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' }
    if (otp.code !== code) {
      otp.attempts++; await otp.save()
      return { ok: false, reason: 'mismatch', attemptsLeft: MAX_ATTEMPTS - otp.attempts }
    }
    otp.used = true; await otp.save()
    return { ok: true }
  }

  // JSON fallback
  const otps = json.find('otps', { channel, target, purpose, used: false })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const otp = otps[0]
  if (!otp) return { ok: false, reason: 'no_otp' }
  if (new Date(otp.expiresAt).getTime() < now) return { ok: false, reason: 'expired' }
  if ((otp.attempts || 0) >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' }
  if (otp.code !== code) {
    json.updateOne('otps', { _id: otp._id }, { attempts: (otp.attempts || 0) + 1 })
    return { ok: false, reason: 'mismatch', attemptsLeft: MAX_ATTEMPTS - ((otp.attempts || 0) + 1) }
  }
  json.updateOne('otps', { _id: otp._id }, { used: true })
  return { ok: true }
}

module.exports = { createOtp, verifyOtp }
