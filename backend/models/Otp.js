const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  channel:  { type: String, enum: ['phone', 'email'], required: true },
  target:   { type: String, required: true, index: true },  // phone or email
  code:     { type: String, required: true },
  purpose:  { type: String, enum: ['signup', 'login', 'verify'], required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },  // TTL
  used:     { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Otp', otpSchema)
