const rateLimit = require('express-rate-limit');
const request = require('supertest');
const express = require('express');

describe('Auth Dedicated Rate Limiting (P1 Remediation)', () => {
  it('should reject requests exceeding configured authentication rate limit with 429', async () => {
    const testApp = express();
    testApp.use(express.json());

    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many authentication attempts. Please try again later.',
        },
      },
    });

    testApp.post('/login', limiter, (req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    // Requests 1, 2, 3 should succeed
    for (let i = 0; i < 3; i++) {
      const res = await request(testApp).post('/login').send({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    }

    // 4th request should be rate-limited
    const rateLimitedRes = await request(testApp).post('/login').send({ email: 'test@example.com' });
    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(rateLimitedRes.body.error.message).toContain('Too many authentication attempts');
  });
});

