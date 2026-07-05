require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { validateEnv } = require('../config/env');

async function seed() {
  try {
    validateEnv();
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set');
      process.exit(1);
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin "${email}" already exists, skipping seed`);
      await mongoose.disconnect();
      return;
    }

    const admin = new Admin({
      email,
      passwordHash: password,
      role: 'admin',
    });
    await admin.save();

    console.log(`Admin "${email}" created successfully`);
    console.log('IMPORTANT: Change the password after first login');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
