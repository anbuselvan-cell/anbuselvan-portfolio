import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const here = path.dirname(fileURLToPath(import.meta.url));
export const seed = JSON.parse(
  fs.readFileSync(path.join(here, '..', 'shared', 'portfolio.json'), 'utf8')
);

const { Schema, model } = mongoose;
const loose = () => new Schema({}, { strict: false });

export const Profile = model('Profile', loose());
export const Project = model('Project', loose());
export const Certificate = model('Certificate', loose());
export const Message = model(
  'Message',
  new Schema(
    {
      name: { type: String, required: true, maxlength: 80 },
      email: { type: String, required: true, maxlength: 120 },
      message: { type: String, required: true, maxlength: 2000 },
    },
    { timestamps: true }
  )
);

// Loads the shared JSON into MongoDB. Skips if data already exists, unless force is true.
export async function seedDatabase({ force = false } = {}) {
  const has = await Profile.countDocuments();
  if (has && !force) return false;
  await Promise.all([Profile.deleteMany({}), Project.deleteMany({}), Certificate.deleteMany({})]);
  const { projects, certificates, ...rest } = seed;
  await Profile.create(rest);
  await Project.insertMany(projects);
  await Certificate.insertMany(certificates);
  return true;
}

const clean = ({ _id, __v, order, ...doc }) => doc;

export async function readPortfolio() {
  const [profile, projects, certificates] = await Promise.all([
    Profile.findOne().lean(),
    Project.find().sort({ order: 1 }).lean(),
    Certificate.find().sort({ order: 1 }).lean(),
  ]);
  if (!profile) return seed;
  return { ...clean(profile), projects: projects.map(clean), certificates: certificates.map(clean) };
}
