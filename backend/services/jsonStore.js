// JSON flat-file fallback when MongoDB isn't available.
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data')

const ensureDir = () => { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }) }
const fileFor = (name) => path.join(DATA_DIR, `${name}.json`)

const read = (name) => {
  ensureDir()
  const f = fileFor(name)
  if (!fs.existsSync(f)) return []
  try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return [] }
}
const write = (name, data) => {
  ensureDir()
  fs.writeFileSync(fileFor(name), JSON.stringify(data, null, 2), 'utf8')
}

const insert = (name, doc) => {
  const all = read(name)
  const entry = { _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), ...doc, createdAt: new Date().toISOString() }
  all.push(entry); write(name, all)
  return entry
}
const findOne = (name, filter) => read(name).find(matchFn(filter))
const find = (name, filter = {}) => read(name).filter(matchFn(filter))
const updateOne = (name, filter, update) => {
  const all = read(name)
  const idx = all.findIndex(matchFn(filter))
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...update }; write(name, all)
  return all[idx]
}
const remove = (name, filter) => {
  const all = read(name)
  const next = all.filter((d) => !matchFn(filter)(d))
  write(name, next)
  return all.length - next.length
}

const matchFn = (filter) => (doc) =>
  Object.entries(filter).every(([k, v]) => doc[k] === v)

module.exports = { insert, findOne, find, updateOne, remove, read, write }
