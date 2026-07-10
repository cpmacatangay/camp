require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const crypto = require('crypto');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { validateEnv } = require('../config/env');

async function seed() {
  try {
    validateEnv();
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = process.env.SEED_ADMIN_EMAIL;
    let password = process.env.SEED_ADMIN_PASSWORD;

    if (!email) {
      console.error('SEED_ADMIN_EMAIL must be set');
      process.exit(1);
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin "${email}" already exists, skipping seed`);
      await mongoose.disconnect();
      return;
    }

    const shouldAutoGenerate = !password || password === 'admin123';
    if (shouldAutoGenerate) {
      password = crypto.randomBytes(16).toString('hex');
      console.log(`No strong password provided. Auto-generated: ${password}`);
    }

    const admin = new Admin({
      email,
      passwordHash: password,
      role: 'admin',
      mustChangePassword: shouldAutoGenerate,
    });
    await admin.save();

    console.log(`Admin "${email}" created successfully`);
    if (shouldAutoGenerate) {
      console.log('⚠️  Admin must change password on first login');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
