const request = require('supertest');
const app = require('../src/app');

describe('CORS Policy Security Verification (P0 Remediation)', () => {
  it('should permit requests without an Origin header (CLI, curl, internal)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should permit explicitly allowed frontend origin with credentials', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should reject unauthorized / rogue origins', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://malicious-phishing-site.example.com');

    // Express with CORS callback returning error triggers errorHandler or blocks request
    expect([403, 500]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

