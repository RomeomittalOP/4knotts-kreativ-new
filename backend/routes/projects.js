const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const router = express.Router()
const { submitProject, listProjects } = require('../controllers/projectController')
const { optionalAuth, requireAuth } = require('../middleware/auth')

// File uploads stored in /uploads (max 5 files × 10 MB each)
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
    cb(null, `${Date.now()}-${safe}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(pdf|png|jpe?g|gif|svg|doc|docx|xlsx|zip|fig|sketch|psd|ai|txt)$/i.test(file.originalname)
    cb(ok ? null : new Error('File type not allowed'), ok)
  },
})

router.post('/', optionalAuth, upload.array('files', 5), submitProject)
router.get('/', requireAuth, listProjects)

module.exports = router
