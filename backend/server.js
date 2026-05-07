require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { connectDB } = require('./config/db')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',')
app.use(cors({ origin: origins, credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// Static — serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/contact',  require('./routes/contact'))
app.use('/api/pricing',  require('./routes/pricing'))
app.use('/api/projects', require('./routes/projects'))

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  mongo: require('./config/db').isMongoReady(),
}))

// 404 + error handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, _req, res, _next) => {
  console.error(err.stack || err)
  if (err.message?.includes('File type')) return res.status(400).json({ error: err.message })
  if (err.code === 'LIMIT_FILE_SIZE')     return res.status(400).json({ error: 'File too large (max 10 MB)' })
  res.status(500).json({ error: 'Internal server error' })
})

;(async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n🚀 4 Knotts Kreativ API running on http://localhost:${PORT}`)
    console.log('📋 Endpoints:')
    console.log('   POST /api/auth/send-otp')
    console.log('   POST /api/auth/signup')
    console.log('   POST /api/auth/login')
    console.log('   GET  /api/auth/me        (auth)')
    console.log('   POST /api/contact')
    console.log('   GET  /api/pricing/catalog')
    console.log('   POST /api/pricing/estimate')
    console.log('   POST /api/pricing')
    console.log('   POST /api/projects        (multipart, optional auth)')
    console.log('   GET  /api/projects        (auth)')
    console.log('   GET  /api/health\n')
  })
})()
