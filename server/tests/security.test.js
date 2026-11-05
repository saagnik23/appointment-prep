const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

let userAToken;
let userBToken;
let userAAppointmentId;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create User A
  const resA = await request(app).post('/api/v1/auth/register').send({
    name: 'User A',
    email: 'userA@example.com',
    password: 'Password123!',
  });
  userAToken = resA.body.token;

  // Create User B
  const resB = await request(app).post('/api/v1/auth/register').send({
    name: 'User B',
    email: 'userB@example.com',
    password: 'Password123!',
  });
  userBToken = resB.body.token;

  // User A creates an appointment with question, medication, and follow-up
  const aptRes = await request(app)
    .post('/api/v1/appointments')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Confidential Cardiology Consult',
      notes: 'Private medical history notes',
    });
  userAAppointmentId = aptRes.body.id;

  // User A adds a question
  await request(app)
    .post(`/api/v1/appointments/${userAAppointmentId}/questions`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ text: 'Private question for my doctor' });

  // User A adds medication
  await request(app)
    .post(`/api/v1/appointments/${userAAppointmentId}/medications`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ name: 'Sensitive Medication X', dose: '10mg' });
});

describe('Security & Multi-Tenant Isolation Tests (FR-01)', () => {
  it('should prevent User B from reading User A appointment', async () => {
    const res = await request(app)
      .get(`/api/v1/appointments/${userAAppointmentId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should prevent User B from seeing User A appointment in list', async () => {
    const res = await request(app)
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should prevent User B from modifying User A appointment', async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${userAAppointmentId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(404);

    // Verify title was not changed
    const verifyRes = await request(app)
      .get(`/api/v1/appointments/${userAAppointmentId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(verifyRes.body.title).toBe('Confidential Cardiology Consult');
  });

  it('should prevent User B from deleting User A appointment', async () => {
    const res = await request(app)
      .delete(`/api/v1/appointments/${userAAppointmentId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);

    // Verify still exists for User A
    const verifyRes = await request(app)
      .get(`/api/v1/appointments/${userAAppointmentId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(verifyRes.status).toBe(200);
  });

  it('should prevent User B from adding a question to User A appointment', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${userAAppointmentId}/questions`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ text: 'Injected question' });

    expect(res.status).toBe(404);
  });

  it('should prevent User B from adding medication to User A appointment', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${userAAppointmentId}/medications`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ name: 'Injected Drug' });

    expect(res.status).toBe(404);
  });

  it('should prevent User B from generating checklist for User A appointment', async () => {
    const res = await request(app)
      .get(`/api/v1/appointments/${userAAppointmentId}/checklist`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });

  it('should reject unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/v1/appointments');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject malformed ObjectIds with 400 validation error', async () => {
    const res = await request(app)
      .get('/api/v1/appointments/not-a-valid-mongo-id')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
