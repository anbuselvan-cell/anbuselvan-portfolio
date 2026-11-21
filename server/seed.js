import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedDatabase } from './db.js';

dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in server/.env first.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
await seedDatabase({ force: true });
console.log('Database reset from shared/portfolio.json.');
await mongoose.disconnect();