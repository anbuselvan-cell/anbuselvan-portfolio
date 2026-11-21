import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { Message, readPortfolio, seed, seedDatabase } from './db.js';

dotenv.config();
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const messagesFile = path.join(here, 'data', 'messages.json');

// Connect to MongoDB when MONGODB_URI is set. Otherwise run in file mode so the site still works.
let mode = 'file';
if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const seeded = await seedDatabase();
    mode = 'mongodb';
    console.log(`MongoDB connected${seeded ? ' and seeded' : ''}.`);
  } catch (err) {
    console.warn('MongoDB connection failed, using file mode:', err.message);
  }
} else {
  console.log('MONGODB_URI is not set. Running in file mode.');
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, mode }));

app.get('/api/portfolio', async (_req, res) => {
  try {
    res.json(mode === 'mongodb' ? await readPortfolio() : seed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load the portfolio.' });
  }
});

// Simple in-memory rate limit: 5 messages per IP every 10 minutes.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

app.post('/api/contact', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !email || !message) return res.status(400).json({ error: 'Please fill in every field.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (name.length > 80 || email.length > 120 || message.length > 2000)
    return res.status(400).json({ error: 'One of the fields is too long.' });
  if (limited(req.ip)) return res.status(429).json({ error: 'Too many messages. Try again later.' });

  try {
    if (mode === 'mongodb') {
      await Message.create({ name, email, message });
    } else {
      fs.mkdirSync(path.dirname(messagesFile), { recursive: true });
      const list = fs.existsSync(messagesFile) ? JSON.parse(fs.readFileSync(messagesFile, 'utf8')) : [];
      list.push({ name, email, message, createdAt: new Date().toISOString() });
      fs.writeFileSync(messagesFile, JSON.stringify(list, null, 2));
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save your message.' });
  }
});

// Read your messages: GET /api/messages with the header x-admin-key set to ADMIN_KEY from .env
app.get('/api/messages', async (req, res) => {
  if (!process.env.ADMIN_KEY || req.get('x-admin-key') !== process.env.ADMIN_KEY)
    return res.status(401).json({ error: 'Not allowed.' });
  if (mode === 'mongodb') return res.json(await Message.find().sort({ createdAt: -1 }).lean());
  res.json(fs.existsSync(messagesFile) ? JSON.parse(fs.readFileSync(messagesFile, 'utf8')) : []);
});

// Serve the built React app when it exists, so one server can host everything.
const dist = path.join(here, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT} (${mode} mode)`));
