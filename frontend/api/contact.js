// Vercel serverless function — saves brief to MongoDB + emails admin & client.
// Set env vars in Vercel: MONGO_URI, SMTP_USER, SMTP_PASS, ADMIN_EMAIL
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

let cachedDb = globalThis._kreativDb;
async function getDb() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGO_URI) return null;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  cachedDb = globalThis._kreativDb = client.db('4knotts');
  return cachedDb;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const message = (body.message || '').trim();

    if (name.length < 2) return res.status(400).json({ error: 'Name required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
    if (message.length < 6) return res.status(400).json({ error: 'Message required' });

    const entry = { name, email, message, status: 'new', createdAt: new Date() };

    // 1) Save to MongoDB (best-effort)
    let saved = false;
    try {
      const db = await getDb();
      if (db) { await db.collection('contacts').insertOne(entry); saved = true; }
    } catch (e) { console.error('Mongo error:', e.message); }

    // 2) Send emails (best-effort)
    let mailed = false;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const port = Number(process.env.SMTP_PORT || 465);
        const t = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port,
          secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        const from = process.env.EMAIL_FROM || `Kreativ by 4 Knotts <${process.env.SMTP_USER}>`;
        const admin = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        // notify admin
        await t.sendMail({
          from, to: admin, replyTo: email,
          subject: `🆕 New project brief — ${name}`,
          text: `From: ${name} <${email}>\n\n${message}`,
          html: `<p><b>${name}</b> &lt;${email}&gt;</p><pre style="font-family:inherit;white-space:pre-wrap">${message}</pre>`,
        });
        // confirmation to client
        await t.sendMail({
          from, to: email,
          subject: `We got your brief — Kreativ by 4 Knotts`,
          text: `Hi ${name},\n\nThanks for reaching out to Kreativ. We've received your brief and will get back to you shortly.\n\n— Kreativ by 4 Knotts`,
        });
        mailed = true;
      } catch (e) { console.error('Mail error:', e.message); }
    }

    return res.status(201).json({ success: true, saved, mailed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
