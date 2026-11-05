const errorHandler = require('../src/middleware/errorHandler');

describe('Error Handler Hardening & Data Leakage Prevention (P0 Remediation)', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should mask 500 internal error messages and suppress stack traces in production', () => {
    process.env.NODE_ENV = 'production';

    const sensitiveError = new Error('DATABASE_CONNECTION_LEAK: mongodb://user:super_secret_password@db:27017');
    sensitiveError.stack = 'Secret stack trace with sensitive server paths';

    const req = {};
    const res = {
      statusCode: 0,
      jsonPayload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.jsonPayload = payload;
        return this;
      },
    };
    const next = jest.fn();

    errorHandler(sensitiveError, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.jsonPayload.error.code).toBe('INTERNAL_ERROR');
    expect(res.jsonPayload.error.message).toBe('An unexpected internal error occurred. Please try again later.');
    expect(res.jsonPayload.error.message).not.toContain('super_secret_password');
    expect(res.jsonPayload.error.stack).toBeUndefined();
  });

  it('should map Mongoose CastError to 400 VALIDATION_ERROR', () => {
    const castError = {
      name: 'CastError',
      path: 'appointmentId',
      value: 'bad_id',
    };

    const res = {
      statusCode: 0,
      jsonPayload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.jsonPayload = payload;
        return this;
      },
    };
    const next = jest.fn();

    errorHandler(castError, {}, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload.error.code).toBe('VALIDATION_ERROR');
    expect(res.jsonPayload.error.details).toEqual(
      expect.arrayContaining([{ field: 'appointmentId', message: 'Malformed identifier format' }])
    );
  });

  it('should map MongoDB E11000 duplicate key error to 409 CONFLICT', () => {
    const dupError = {
      code: 11000,
      keyValue: { email: 'test@example.com' },
    };

    const res = {
      statusCode: 0,
      jsonPayload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.jsonPayload = payload;
        return this;
      },
    };
    const next = jest.fn();

    errorHandler(dupError, {}, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.jsonPayload.error.code).toBe('CONFLICT');
  });

  it('should delegate to next if response headers were already sent', () => {
    const error = new Error('After header error');
    const req = {};
    const res = { headersSent: true };
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

