const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const { generateToken } = require('../src/modules/auth/auth.controller');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Authentication & Authorization Module', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully, setting session cookie without exposing token in JSON', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Patient',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      // Ensure token is NOT leaked in JSON response body
      expect(res.body).not.toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.user).toMatchObject({
        name: 'Jane Patient',
        email: 'jane@example.com',
      });
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeInstanceOf(Array);
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
    });

    it('should prevent registration with already existing email', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Existing User',
        email: 'duplicate@example.com',
        password: 'Password123!',
      });

      const duplicateRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: 'DUPLICATE@EXAMPLE.COM', // casing normalization check
          password: 'Password123!',
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'CorrectPassword123!',
      });
    });

    it('should log in with valid credentials, setting session cookie without returning token in body', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@example.com',
        password: 'CorrectPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'CorrectPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile when valid session cookie provided', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'Password123!',
      });

      const cookies = reg.headers['set-cookie'];

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Profile User');
      expect(res.body.user.email).toBe('profile@example.com');
    });

    it('should return user profile when valid Bearer token provided (for API/test clients)', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        name: 'Bearer User',
        email: 'bearer@example.com',
        password: 'Password123!',
      });

      const token = generateToken(reg.body.user);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Bearer User');
    });

    it('should return 401 when no token or cookie is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
