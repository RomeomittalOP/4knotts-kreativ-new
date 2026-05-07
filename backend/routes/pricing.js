const express = require('express')
const router = express.Router()
const { getCatalog, computeEstimate, submitPricing, getSubmissions } = require('../controllers/pricingController')

router.get('/catalog', getCatalog)
router.post('/estimate', computeEstimate)
router.post('/', submitPricing)
router.get('/', getSubmissions)

module.exports = router
