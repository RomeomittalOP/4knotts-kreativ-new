const jwt = require('jsonwebtoken')

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me')
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me') } catch {}
  }
  next()
}

module.exports = { signToken, requireAuth, optionalAuth }
