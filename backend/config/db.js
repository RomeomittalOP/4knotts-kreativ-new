const mongoose = require('mongoose')

let mongoConnected = false

async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.log('ℹ️  MONGO_URI not set — falling back to JSON flat-file storage')
    return false
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 })
    mongoConnected = true
    console.log('✅ MongoDB connected')
    return true
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed — falling back to JSON storage')
    console.warn('   ' + err.message)
    return false
  }
}

const isMongoReady = () => mongoConnected && mongoose.connection.readyState === 1

module.exports = { connectDB, isMongoReady }
