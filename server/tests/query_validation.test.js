const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

let userToken;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  const regRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Query Test User',
    email: 'queryuser@example.com',
    password: 'Password123!',
  });
  const cookies = regRes.headers['set-cookie'];
  userToken = cookies;
});

describe('Appointments Query Validation (P2 Remediation)', () => {
  it('should accept supported status query parameters (upcoming, completed, cancelled)', async () => {
    const res = await request(app)
      .get('/api/v1/appointments?status=upcoming')
      .set('Cookie', userToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject unsupported status values with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .get('/api/v1/appointments?status=non_existent_status')
      .set('Cookie', userToken);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'status',
          message: expect.stringContaining('upcoming, completed, or cancelled'),
        }),
      ])
    );
  });

  it('should reject search parameters longer than 100 characters', async () => {
    const excessivelyLongSearch = 'a'.repeat(101);
    const res = await request(app)
      .get(`/api/v1/appointments?search=${excessivelyLongSearch}`)
      .set('Cookie', userToken);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'search',
          message: expect.stringContaining('cannot exceed 100 characters'),
        }),
      ])
    );
  });
});

