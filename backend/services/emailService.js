const nodemailer = require('nodemailer')

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️  SMTP not configured — emails will be logged to console only')
    return null
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: String(SMTP_SECURE) === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter()
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  if (!t) {
    console.log('\n📧 [EMAIL — DRY RUN]')
    console.log(`  From: ${from}`)
    console.log(`  To:   ${to}`)
    console.log(`  Subj: ${subject}`)
    console.log(`  Body: ${text || html}\n`)
    return { dryRun: true }
  }
  return t.sendMail({ from, to, subject, html, text })
}

// ─── Templates ─────────────────────────────────────────────
const wrapper = (body) => `
<!doctype html><html><body style="background:#0a0a0a;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#e5e5e5;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-radius:16px;padding:32px">
    <div style="font-family:'Orbitron',sans-serif;font-size:22px;font-weight:900;letter-spacing:.05em;background:linear-gradient(135deg,#ff2e4d,#9ca3af);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:24px">4 KNOTTS KREATIV</div>
    ${body}
    <hr style="border:0;border-top:1px solid #222;margin:32px 0">
    <p style="font-size:12px;color:#666;margin:0">© 4 Knotts Kreativ · Premium creative agency</p>
  </div>
</body></html>`

const tpl = {
  signupWelcome: ({ name }) => ({
    subject: 'Welcome to 4 Knotts Kreativ',
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 12px">Hey ${name} 👋</h2>
      <p style="line-height:1.6;color:#bbb">Your account has been created. We're excited to build something great together.</p>
      <p style="line-height:1.6;color:#bbb">Browse the studio, customise a package, or kick off a brief from <strong style="color:#ff2e4d">Build Your Project</strong>.</p>
    `),
    text: `Hey ${name}, your 4 Knotts Kreativ account is ready. Welcome aboard.`,
  }),
  contactConfirm: ({ name, message }) => ({
    subject: 'We received your message',
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 12px">Thanks, ${name}!</h2>
      <p style="line-height:1.6;color:#bbb">We've received your message and will respond within 24 hours.</p>
      <blockquote style="border-left:3px solid #ff2e4d;padding:8px 16px;color:#999;margin:16px 0">${escapeHtml(message)}</blockquote>
    `),
    text: `Thanks ${name}! We'll respond within 24 hours.`,
  }),
  contactNotify: ({ name, email, message }) => ({
    subject: `📬 New contact: ${name}`,
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 12px">New contact submission</h2>
      <p style="color:#bbb"><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <blockquote style="border-left:3px solid #ff2e4d;padding:8px 16px;color:#ddd;margin:16px 0">${escapeHtml(message)}</blockquote>
    `),
    text: `New contact from ${name} <${email}>:\n\n${message}`,
  }),
  projectConfirm: ({ name, services, estimatedRange }) => ({
    subject: 'Your project brief is in',
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 12px">Got it, ${name}</h2>
      <p style="color:#bbb">We've logged your project brief and will follow up within 24 hours with a detailed proposal.</p>
      <p style="color:#bbb"><strong>Services selected:</strong> ${services.join(', ')}</p>
      ${estimatedRange ? `<p style="color:#bbb"><strong>Estimated range:</strong> ₹${estimatedRange.min.toLocaleString()} – ₹${estimatedRange.max.toLocaleString()}</p>` : ''}
    `),
    text: `Project brief received. We'll follow up within 24 hours.`,
  }),
  projectNotify: ({ name, email, phone, services, qualityTier, budget, requirements, estimatedRange }) => ({
    subject: `🚀 New project brief: ${name}`,
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 12px">New project brief</h2>
      <p style="color:#bbb"><strong>${name}</strong> &lt;${email}&gt; · ${phone || 'no phone'}</p>
      <p style="color:#bbb"><strong>Services:</strong> ${services.join(', ')}</p>
      <p style="color:#bbb"><strong>Tier:</strong> ${qualityTier} · <strong>Budget:</strong> ${budget || 'unspecified'}</p>
      ${estimatedRange ? `<p style="color:#bbb"><strong>Estimated range:</strong> ₹${estimatedRange.min.toLocaleString()} – ₹${estimatedRange.max.toLocaleString()}</p>` : ''}
      <blockquote style="border-left:3px solid #ff2e4d;padding:8px 16px;color:#ddd;margin:16px 0">${escapeHtml(requirements || '(no description)')}</blockquote>
    `),
    text: `New project from ${name} (${email}). Services: ${services.join(', ')}.`,
  }),
  otpEmail: ({ code, purpose }) => ({
    subject: `Your 4 Knotts Kreativ verification code`,
    html: wrapper(`
      <h2 style="color:#fff;margin:0 0 12px">Verification code</h2>
      <p style="color:#bbb">Use this code to ${purpose === 'signup' ? 'complete sign-up' : 'log in'}:</p>
      <div style="font-family:'Orbitron',monospace;font-size:34px;font-weight:900;letter-spacing:.4em;color:#ff2e4d;background:#1a0a14;border:1px solid rgba(255,46,77,.3);border-radius:14px;padding:20px;text-align:center;margin:16px 0">${code}</div>
      <p style="color:#666;font-size:13px">Expires in 5 minutes. Don't share this code.</p>
    `),
    text: `Your verification code: ${code} (expires in 5 minutes)`,
  }),
}

const escapeHtml = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

module.exports = { sendMail, tpl }
