const { isMongoReady } = require('../config/db')
const ProjectRequest = require('../models/ProjectRequest')
const json = require('../services/jsonStore')
const { estimate } = require('../services/pricingEngine')
const { sendMail, tpl } = require('../services/emailService')

exports.submitProject = async (req, res) => {
  const {
    name, email, phone = '',
    services = [], qualityTier = 'pro',
    budget = '', timeline = '', requirements = '',
  } = req.body || {}

  // Validate
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = 'Name required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) errors.email = 'Valid email required'
  if (!Array.isArray(services) || services.length === 0) errors.services = 'Pick at least one service'
  if (!['basic', 'pro', 'premium'].includes(qualityTier)) errors.qualityTier = 'Invalid tier'

  if (Object.keys(errors).length) return res.status(400).json({ errors })

  const est = estimate({ services, tier: qualityTier })

  // Files (multer adds req.files)
  const attachments = (req.files || []).map((f) => ({
    filename: f.filename,
    originalname: f.originalname,
    size: f.size,
    mimetype: f.mimetype,
  }))

  const data = {
    user: req.user?.id || null,
    name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(),
    services, qualityTier, budget, timeline, requirements: requirements.slice(0, 5000),
    estimatedRange: { min: est.min, max: est.max },
    attachments, status: 'new',
  }

  let saved
  if (isMongoReady()) saved = await ProjectRequest.create(data)
  else saved = json.insert('project_requests', data)

  // Emails
  try {
    const userMail = tpl.projectConfirm({ name: data.name, services, estimatedRange: data.estimatedRange })
    await sendMail({ to: data.email, ...userMail })
    const adminMail = tpl.projectNotify({
      name: data.name, email: data.email, phone: data.phone,
      services, qualityTier, budget,
      requirements: data.requirements, estimatedRange: data.estimatedRange,
    })
    await sendMail({ to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, ...adminMail })
  } catch (e) { console.warn('email error:', e.message) }

  res.status(201).json({
    success: true,
    id: saved._id || saved.id,
    estimatedRange: data.estimatedRange,
    breakdown: est.breakdown,
  })
}

exports.listProjects = async (_req, res) => {
  const data = isMongoReady()
    ? await ProjectRequest.find().sort({ createdAt: -1 })
    : json.find('project_requests')
  res.json({ success: true, total: data.length, data })
}
