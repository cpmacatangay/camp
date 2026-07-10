const WEAK_JWT_SECRETS = [
  'dev-jwt-secret-change-in-production',
  'change-this-to-a-long-random-string',
];

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const OPTIONAL_ENV = {
  PORT: 5000,
  UPLOAD_DIR: 'uploads',
  SEED_ADMIN_EMAIL: 'admin@camp.com',
  SEED_ADMIN_PASSWORD: 'admin123',
};

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
  for (const [key, defaultValue] of Object.entries(OPTIONAL_ENV)) {
    if (!process.env[key]) {
      process.env[key] = String(defaultValue);
    }
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security'
    );
  }
  if (WEAK_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
    throw new Error(
      'JWT_SECRET is set to a known weak/default value. Generate a strong random secret.'
    );
  }
}

module.exports = { validateEnv };
