const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, default: '' },
  services:  [{ type: String }],
  qualityTier: { type: String, enum: ['basic', 'pro', 'premium'], default: 'pro' },
  budget:    { type: String, default: '' },
  timeline:  { type: String, default: '' },
  requirements: { type: String, default: '' },
  estimatedRange: { min: Number, max: Number },
  attachments: [{ filename: String, originalname: String, size: Number, mimetype: String }],
  status:    { type: String, enum: ['new', 'reviewing', 'quoted', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('ProjectRequest', projectSchema)
