const { validateEnv } = require('../src/config/env');

describe('Environment Configuration & JWT Secret Hardening (P0 Remediation)', () => {
  it('should throw fatal error in production when JWT_SECRET is missing', () => {
    expect(() => {
      validateEnv({ NODE_ENV: 'production', JWT_SECRET: '' });
    }).toThrow(/JWT_SECRET environment variable is required in production/);
  });

  it('should throw fatal error in production when JWT_SECRET is less than 32 characters', () => {
    expect(() => {
      validateEnv({ NODE_ENV: 'production', JWT_SECRET: 'short_weak_secret' });
    }).toThrow(/must be at least 32 characters long in production/);
  });

  it('should throw fatal error in production when JWT_SECRET matches default or placeholder', () => {
    expect(() => {
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'dev_insecure_jwt_secret_key_appointment_prep_2026',
      });
    }).toThrow(/insecure default placeholder/);
  });

  it('should succeed in production with a valid 32+ character random secret', () => {
    const strongSecret = '9a7c3b2f1e4d5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b';
    const config = validateEnv({
      NODE_ENV: 'production',
      JWT_SECRET: strongSecret,
    });
    expect(config.JWT_SECRET).toBe(strongSecret);
  });

  it('should never print secret values in error messages', () => {
    const weakSecret = 'bad_secret_value_123';
    try {
      validateEnv({ NODE_ENV: 'production', JWT_SECRET: weakSecret });
    } catch (err) {
      expect(err.message).not.toContain(weakSecret);
    }
  });
});

