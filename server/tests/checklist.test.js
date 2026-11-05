const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const { transformToChecklist } = require('../src/utils/checklistTransformer');
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
    name: 'Checklist Patient',
    email: 'checklist@example.com',
    password: 'Password123!',
  });
  userToken = generateToken(authRes.body.user);

  const aptRes = await request(app)
    .post('/api/v1/appointments')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Annual Physical',
      providerName: 'Dr. Jane Miller',
      scheduledAt: '2026-12-01T09:00:00.000Z',
      location: 'Community Health Suite 100',
      notes: 'Fasting from midnight',
    });
  appointmentId = aptRes.body.id;

  // Add questions out of order
  await request(app)
    .post(`/api/v1/appointments/${appointmentId}/questions`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ text: 'Question 2: Should I get a booster?', order: 2 });

  await request(app)
    .post(`/api/v1/appointments/${appointmentId}/questions`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ text: 'Question 1: Any diet adjustments needed?', order: 1 });

  // Add medication
  await request(app)
    .post(`/api/v1/appointments/${appointmentId}/medications`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      name: 'Atorvastatin',
      dose: '20 mg',
      frequency: 'Nightly',
      notes: 'No adverse reactions',
      order: 1,
    });

  // Add follow-up
  await request(app)
    .post(`/api/v1/appointments/${appointmentId}/follow-ups`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      text: 'Schedule eye screening',
      dueAt: '2027-03-01T00:00:00.000Z',
    });
});

describe('Checklist Generation Module', () => {
  it('should generate a structured, deterministic checklist via API', async () => {
    const res = await request(app)
      .get(`/api/v1/appointments/${appointmentId}/checklist`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.appointment).toMatchObject({
      title: 'Annual Physical',
      providerName: 'Dr. Jane Miller',
      location: 'Community Health Suite 100',
    });

    expect(res.body.sections).toHaveLength(3);

    // Section 1: Questions to ask
    const qSection = res.body.sections.find((s) => s.id === 'questions');
    expect(qSection.title).toBe('Questions to ask');
    expect(qSection.items).toHaveLength(2);
    // Verifying deterministic ordering by order field
    expect(qSection.items[0].text).toBe('Question 1: Any diet adjustments needed?');
    expect(qSection.items[1].text).toBe('Question 2: Should I get a booster?');

    // Section 2: Medication list entered by me
    const medSection = res.body.sections.find((s) => s.id === 'medications');
    expect(medSection.title).toBe('Medication list entered by me');
    expect(medSection.items).toHaveLength(1);
    expect(medSection.items[0]).toMatchObject({
      name: 'Atorvastatin',
      dose: '20 mg',
      frequency: 'Nightly',
      notes: 'No adverse reactions',
    });

    // Section 3: Follow-up actions and notes
    const followUpSection = res.body.sections.find((s) => s.id === 'follow_ups');
    expect(followUpSection.title).toBe('Follow-up actions and notes');
    expect(followUpSection.items).toHaveLength(1);
    expect(followUpSection.items[0].text).toBe('Schedule eye screening');

    // Notes area present for doctor visit notes
    expect(res.body.notesArea).toBe(true);

    // Disclaimer present explicitly stating no medical advice
    expect(res.body.disclaimer).toBeDefined();
    expect(res.body.disclaimer.toLowerCase()).toContain('does not contain medical advice');
  });

  it('should transform empty appointment deterministically without hallucinating values', () => {
    const emptyApt = {
      id: 'mock-1',
      title: 'Quick Checkup',
      questions: [],
      medications: [],
      followUps: [],
    };

    const checklist = transformToChecklist(emptyApt);
    expect(checklist.appointment.title).toBe('Quick Checkup');
    expect(checklist.appointment.providerName).toBe('');
    expect(checklist.sections[0].items).toEqual([]);
    expect(checklist.sections[1].items).toEqual([]);
    expect(checklist.sections[2].items).toEqual([]);
  });
});

