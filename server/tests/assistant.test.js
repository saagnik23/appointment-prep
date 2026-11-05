const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

describe('Assistant Chat Endpoint (POST /api/v1/assistant/chat)', () => {
  let authCookies;
  let xsrfToken;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'Password123!',
      });

    authCookies = regRes.headers['set-cookie'];
    xsrfToken = regRes.body.csrfToken;
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .send({ message: 'hi' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when message is empty or missing', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('replies to greeting with user personalization and suggestions', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'hi' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('Sarah Connor');
    expect(res.body.reply).toContain('Appointment Prep Assistant');
    expect(Array.isArray(res.body.suggestions)).toBe(true);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });

  it('replies naturally to "how are you" without robotic fallback', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'how are you' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('doing well');
    expect(res.body.reply).not.toContain("I've noted that.");
    expect(Array.isArray(res.body.suggestions)).toBe(true);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });

  it('replies to gratitude politely', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'thank you so much!' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('welcome');
  });

  it('explains its role when asked who are you or help', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'who are you and how can you help?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('Appointment Prep Assistant');
    expect(res.body.reply).toContain('Brainstorm');
  });

  it('provides question brainstorming suggestions', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'What questions should I ask my doctor?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('Questions to Ask');
    expect(res.body.reply).toContain('side effects');
  });

  it('provides specialty-specific guidance for dentist appointments', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'I have an appointment with a dentist' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('dental');
    expect(res.body.reply).toContain('cavities');
  });

  it('provides checklist and what to bring guidance', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'What should I bring to my appointment?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('checklist');
    expect(res.body.reply).toContain('insurance card');
  });

  it('enforces non-clinical disclaimer and advises asking doctor when asked medical treatment advice', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'Can I stop taking my medication or what dose should I take?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('cannot diagnose');
    expect(res.body.reply).toContain('healthcare provider');
  });

  it('gives warm fallback for arbitrary input without robotic phrase', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set('Cookie', authCookies)
      .set('X-XSRF-TOKEN', xsrfToken)
      .send({ message: 'xyz random topic' });

    expect(res.status).toBe(200);
    expect(res.body.reply).not.toContain("I've noted that.");
    expect(res.body.reply).toContain('doctor');
  });
});
