const { isMongoReady } = require('../config/db')
const json = require('../services/jsonStore')
const { sendMail, tpl } = require('../services/emailService')

// Lightweight contact model — keep using json fallback even with mongo for simplicity here
const submitContact = async (req, res) => {
  const { name, email, message } = req.body
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters'
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Valid email required'
  if (!message || message.trim().length < 10) errors.message = 'Message must be at least 10 characters'
  if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, errors })

  const entry = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    status: 'new',
  }

  let saved
  if (isMongoReady()) {
    const m = require('mongoose')
    const Contact = m.models.Contact || m.model('Contact', new m.Schema({
      name: String, email: String, message: String, status: String, createdAt: { type: Date, default: Date.now },
    }))
    saved = await Contact.create(entry)
  } else {
    saved = json.insert('contacts', entry)
  }

  // Send confirmation + admin notification
  try {
    const userMail = tpl.contactConfirm({ name: entry.name, message: entry.message })
    await sendMail({ to: entry.email, ...userMail })
    const adminMail = tpl.contactNotify(entry)
    await sendMail({ to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, ...adminMail })
  } catch (e) { console.warn('email error:', e.message) }

  console.log(`📬 contact: ${entry.email}`)
  res.status(201).json({ success: true, id: saved._id || saved.id, message: 'Message received. We\'ll be in touch!' })
}

const getContacts = async (_req, res) => {
  const data = isMongoReady()
    ? await require('mongoose').model('Contact').find().sort({ createdAt: -1 })
    : json.find('contacts')
  res.json({ success: true, data, total: data.length })
}

module.exports = { submitContact, getContacts }
