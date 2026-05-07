const express = require('express')
const router = express.Router()
const { sendOtp, signup, login, me } = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/send-otp', sendOtp)
router.post('/signup',   signup)
router.post('/login',    login)
router.get('/me',        requireAuth, me)

module.exports = router
