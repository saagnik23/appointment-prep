const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current dir .env

const INSECURE_PLACEHOLDERS = [
  'dev_insecure_jwt_secret_key_appointment_prep_2026',
  'replace_this_with_a_secure_random_secret_at_least_32_characters_long',
  'secret',
  'changeme',
  'password',
  'jwt_secret',
];

function validateEnv(envObj = process.env) {
  const nodeEnv = envObj.NODE_ENV || 'development';
  const jwtSecret = envObj.JWT_SECRET;

  if (nodeEnv === 'production') {
    if (!jwtSecret || typeof jwtSecret !== 'string') {
      throw new Error(
        'FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is required in production.'
      );
    }
    if (jwtSecret.length < 32) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: JWT_SECRET must be at least 32 characters long in production.'
      );
    }
    if (INSECURE_PLACEHOLDERS.includes(jwtSecret.trim())) {
      throw new Error(
        'FATAL CONFIGURATION ERROR: JWT_SECRET is set to an insecure default placeholder.'
      );
    }
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: parseInt(envObj.PORT, 10) || 5001,
    MONGODB_URI: envObj.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment_prep',
    JWT_SECRET:
      jwtSecret ||
      (nodeEnv === 'test'
        ? 'test_jwt_secret_must_be_deterministic_32chars_long'
        : 'dev_insecure_jwt_secret_key_appointment_prep_2026'),
    JWT_EXPIRES_IN: envObj.JWT_EXPIRES_IN || '7d',
    CORS_ORIGIN: envObj.CORS_ORIGIN || 'http://localhost:5173',
    RATE_LIMIT_MAX: parseInt(envObj.RATE_LIMIT_MAX, 10) || 200,
    RATE_LIMIT_WINDOW_MS: parseInt(envObj.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    AUTH_RATE_LIMIT_MAX: parseInt(envObj.AUTH_RATE_LIMIT_MAX, 10) || 10,
    AUTH_RATE_LIMIT_WINDOW_MS: parseInt(envObj.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    CSRF_SECRET: envObj.CSRF_SECRET || 'dev_csrf_secret_for_double_submit_cookies_2026',
  };
}

let env;
try {
  env = validateEnv(process.env);
} catch (err) {
  console.error(err.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
  throw err;
}

module.exports = env;
module.exports.validateEnv = validateEnv;
