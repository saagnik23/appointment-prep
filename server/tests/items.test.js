const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const { generateToken } = require('../src/modules/auth/auth.controller');

let userToken;
let appointmentId;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  const authRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Prep User',
    email: 'prep@example.com',
    password: 'Password123!',
  });
  userToken = generateToken(authRes.body.user);

  const aptRes = await request(app)
    .post('/api/v1/appointments')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Endocrinology Consultation',
    });
  appointmentId = aptRes.body.id;
});

describe('Preparation Items (Questions, Medications, Follow-ups)', () => {
  describe('Questions Workflow', () => {
    it('should add, update status/order, and delete a question', async () => {
      // 1. Add question
      const addRes = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: 'What are the possible side effects of adjusting my thyroid dose?',
          order: 1,
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body).toHaveProperty('id');
      expect(addRes.body.text).toBe('What are the possible side effects of adjusting my thyroid dose?');
      expect(addRes.body.status).toBe('not_asked');
      const questionId = addRes.body.id;

      // 2. Update status to asked and modify order
      const updateRes = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/questions/${questionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'asked',
          order: 0,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe('asked');
      expect(updateRes.body.order).toBe(0);

      // Verify embedded in appointment
      const aptRes = await request(app)
        .get(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(aptRes.body.questions.length).toBe(1);
      expect(aptRes.body.questions[0].status).toBe('asked');

      // 3. Delete question
      const delRes = await request(app)
        .delete(`/api/v1/appointments/${appointmentId}/questions/${questionId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(delRes.status).toBe(200);

      // Verify deleted from appointment
      const aptAfter = await request(app)
        .get(`/api/v1/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(aptAfter.body.questions.length).toBe(0);
    });
  });

  describe('Medications Workflow (Self-Reported)', () => {
    it('should record medication preserving exact user-entered details without modification', async () => {
      const addRes = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/medications`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Levothyroxine',
          dose: '75 mcg',
          frequency: 'Once daily in the morning on an empty stomach',
          notes: 'Take 30 minutes before coffee',
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.name).toBe('Levothyroxine');
      expect(addRes.body.dose).toBe('75 mcg');
      expect(addRes.body.frequency).toBe('Once daily in the morning on an empty stomach');
      expect(addRes.body.notes).toBe('Take 30 minutes before coffee');

      const medicationId = addRes.body.id;

      // Update medication note
      const updateRes = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/medications/${medicationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dose: '88 mcg',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.dose).toBe('88 mcg');
      // Preserved original values
      expect(updateRes.body.name).toBe('Levothyroxine');

      // Delete medication
      const delRes = await request(app)
        .delete(`/api/v1/appointments/${appointmentId}/medications/${medicationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(delRes.status).toBe(200);
    });

    it('should reject medication entry missing required name', async () => {
      const res = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/medications`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dose: '50 mg',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Follow-ups Workflow', () => {
    it('should add, toggle status, and delete follow-up item', async () => {
      const addRes = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/follow-ups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: 'Get fasting TSH blood draw in 6 weeks',
          dueAt: '2027-01-05T00:00:00.000Z',
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.text).toBe('Get fasting TSH blood draw in 6 weeks');
      expect(addRes.body.status).toBe('pending');
      const followUpId = addRes.body.id;

      // Mark completed
      const updateRes = await request(app)
        .patch(`/api/v1/appointments/${appointmentId}/follow-ups/${followUpId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'completed',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe('completed');

      // Delete
      const delRes = await request(app)
        .delete(`/api/v1/appointments/${appointmentId}/follow-ups/${followUpId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(delRes.status).toBe(200);
    });
  });
});

