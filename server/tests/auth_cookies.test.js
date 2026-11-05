const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } = require('../src/utils/cookies');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Session Cookie & CSRF Protection (P1 Remediation)', () => {
  it('should set HttpOnly session cookie and XSRF-TOKEN cookie on registration without exposing token in JSON', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Cookie User',
      email: 'cookie@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      name: 'Cookie User',
      email: 'cookie@example.com',
    });
    // Never expose token in JSON payload
    expect(res.body).not.toHaveProperty('token');
    expect(res.body).toHaveProperty('csrfToken');

    const setCookieHeaders = res.headers['set-cookie'];
    expect(setCookieHeaders).toBeDefined();

    const authCookie = setCookieHeaders.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');

    const csrfCookie = setCookieHeaders.find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`));
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie).not.toContain('HttpOnly'); // Client needs to read CSRF token
  });

  it('should set HttpOnly session cookie on login', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login Cookie User',
      email: 'logincookie@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'logincookie@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('token');
    const setCookieHeaders = res.headers['set-cookie'];
    const authCookie = setCookieHeaders.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
  });

  it('should clear session and CSRF cookies on logout', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Successfully signed out');

    const setCookieHeaders = res.headers['set-cookie'];
    expect(setCookieHeaders).toBeDefined();
    const clearedAuth = setCookieHeaders.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=;`));
    const clearedCsrf = setCookieHeaders.find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=;`));
    expect(clearedAuth).toBeDefined();
    expect(clearedCsrf).toBeDefined();
  });

  it('should reject state-changing cookie-authenticated request when X-XSRF-TOKEN header is missing', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'CSRF Target User',
      email: 'csrftarget@example.com',
      password: 'Password123!',
    });

    const cookies = regRes.headers['set-cookie'];

    // Attempt POST without X-XSRF-TOKEN
    const postRes = await request(app)
      .post('/api/v1/appointments')
      .set('Cookie', cookies)
      .send({ title: 'CSRF Exploit Attempt' });

    expect(postRes.status).toBe(403);
    expect(postRes.body.error.code).toBe('CSRF_ERROR');
  });

  it('should permit state-changing cookie-authenticated request when valid X-XSRF-TOKEN header is provided', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Valid CSRF User',
      email: 'validcsrf@example.com',
      password: 'Password123!',
    });

    const cookies = regRes.headers['set-cookie'];
    const csrfToken = regRes.body.csrfToken;

    const postRes = await request(app)
      .post('/api/v1/appointments')
      .set('Cookie', cookies)
      .set('X-XSRF-TOKEN', csrfToken)
      .send({ title: 'Legitimate Appointment' });

    expect(postRes.status).toBe(201);
    expect(postRes.body.title).toBe('Legitimate Appointment');
  });

  it('should allow GET requests without CSRF token when using cookie authentication', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Safe GET User',
      email: 'safeget@example.com',
      password: 'Password123!',
    });

    const cookies = regRes.headers['set-cookie'];

    const getRes = await request(app)
      .get('/api/v1/appointments')
      .set('Cookie', cookies);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
  });
});

