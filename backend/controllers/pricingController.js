const { isMongoReady } = require('../config/db')
const json = require('../services/jsonStore')
const { catalog, estimate } = require('../services/pricingEngine')

// GET /api/pricing/catalog — services + packages for the frontend
const getCatalog = (_req, res) => res.json(catalog())

// POST /api/pricing/estimate — live estimate for the package builder
const computeEstimate = (req, res) => {
  const { services = [], tier = 'pro' } = req.body || {}
  const result = estimate({ services, tier })
  res.json({ success: true, ...result })
}

// POST /api/pricing — record a package selection (for analytics/leads)
const submitPricing = async (req, res) => {
  const { services = [], requirement = '', plan = null, tier = 'pro', email = '' } = req.body || {}
  if (!plan && (!Array.isArray(services) || services.length === 0)) {
    return res.status(400).json({ success: false, errors: { general: 'Plan or services required' } })
  }

  const entry = {
    type: plan ? 'plan' : 'custom',
    plan, services, tier, email,
    requirement: String(requirement).slice(0, 2000),
    status: 'pending',
  }

  let saved
  if (isMongoReady()) {
    const m = require('mongoose')
    const Pricing = m.models.PricingSubmission || m.model('PricingSubmission', new m.Schema({
      type: String, plan: String, services: [String], tier: String, email: String,
      requirement: String, status: String, createdAt: { type: Date, default: Date.now },
    }))
    saved = await Pricing.create(entry)
  } else {
    saved = json.insert('pricing_submissions', entry)
  }

  res.status(201).json({ success: true, id: saved._id || saved.id })
}

const getSubmissions = async (_req, res) => {
  const data = isMongoReady()
    ? await require('mongoose').model('PricingSubmission').find().sort({ createdAt: -1 })
    : json.find('pricing_submissions')
  res.json({ success: true, data, total: data.length })
}

module.exports = { getCatalog, computeEstimate, submitPricing, getSubmissions }
