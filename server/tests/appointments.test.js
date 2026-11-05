const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const { generateToken } = require('../src/modules/auth/auth.controller');

let userToken;
let userId;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Appointment Owner',
    email: 'owner@example.com',
    password: 'Password123!',
  });
  userToken = generateToken(res.body.user);
  userId = res.body.user.id;
});

describe('Appointments API Endpoints', () => {
  describe('POST /api/v1/appointments', () => {
    it('should create an appointment with required and optional fields', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Cardiology Annual Check',
          providerName: 'Dr. Sarah Smith',
          scheduledAt: '2026-11-20T14:30:00.000Z',
          location: 'Heart Health Clinic, Room 302',
          notes: 'Remember to fast for 8 hours before lipid test',
          status: 'upcoming',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Cardiology Annual Check');
      expect(res.body.providerName).toBe('Dr. Sarah Smith');
      expect(res.body.location).toBe('Heart Health Clinic, Room 302');
      expect(res.body.status).toBe('upcoming');
      expect(res.body.questions).toEqual([]);
      expect(res.body.medications).toEqual([]);
      expect(res.body.followUps).toEqual([]);
    });

    it('should create an appointment with only title (all other fields optional per FR-02)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Routine General Checkup',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Routine General Checkup');
      expect(res.body.status).toBe('upcoming');
      expect(res.body.providerName).toBe('');
    });

    it('should reject creation without title', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '   ',
          providerName: 'Dr. Smith',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/appointments', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Dentist Cleaning',
          providerName: 'Dr. Green',
          status: 'upcoming',
        });

      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Dermatology Consultation',
          providerName: 'Dr. Blue',
          status: 'completed',
        });
    });

    it('should list all appointments for current user', async () => {
      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should filter appointments by status', async () => {
      const res = await request(app)
        .get('/api/v1/appointments?status=completed')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Dermatology Consultation');
    });

    it('should search appointments by title or provider', async () => {
      const res = await request(app)
        .get('/api/v1/appointments?search=Dentist')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Dentist Cleaning');
    });
  });

  describe('GET, PATCH, DELETE /api/v1/appointments/:appointmentId', () => {
    let appointmentId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Ophthalmology Exam',
          providerName: 'Dr. Sight',
          status: 'upcoming',
        });
      appointmentId = res.body.id;
    });

    it('should get an appointment by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(appointmentId);
      expect(res.body.title).toBe('Ophthalmology Exam');
    });

    it('should update appointment details', async () => {
      const res = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Comprehensive Eye Exam',
          status: 'completed',
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Comprehensive Eye Exam');
      expect(res.body.status).toBe('completed');
    });

    it('should delete an appointment and its data', async () => {
      const delRes = await request(app)
        .delete(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(delRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});

