const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const { setupTestDB, teardownTestDB } = require('./setup');

describe('Liveness and Readiness Probes (P1 Remediation)', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('GET /health should return 200 healthy regardless of database connection', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('appointment-prep-api');
  });

  it('GET /ready should return 200 ready when database is connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });

  it('GET /ready should return 503 not_ready when database is disconnected', async () => {
    const isDBSpy = jest.spyOn(db, 'isDBConnected').mockReturnValue(false);

    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('not_ready');
    expect(res.body.database).toBe('disconnected');

    isDBSpy.mockRestore();
  });
});
