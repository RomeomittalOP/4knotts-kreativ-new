const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, default: null },  // null for OTP-only accounts
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
})

userSchema.methods.setPassword = async function (pw) {
  this.passwordHash = await bcrypt.hash(pw, 10)
}
userSchema.methods.checkPassword = function (pw) {
  if (!this.passwordHash) return false
  return bcrypt.compare(pw, this.passwordHash)
}
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id || this.id,
    name: this.name, email: this.email, phone: this.phone,
    emailVerified: this.emailVerified, phoneVerified: this.phoneVerified,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model('User', userSchema)
