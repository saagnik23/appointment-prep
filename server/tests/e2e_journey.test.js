const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('End-to-End User Journey (Section 10 Acceptance Test)', () => {
  it('executes the full patient journey end-to-end with cookies, CSRF, and synthetic test data', async () => {
    // 1. Authenticate (Register User 1 with HttpOnly session cookie)
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
        password: 'Password999!',
      });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).not.toHaveProperty('token');
    const userCookies = registerRes.headers['set-cookie'];
    const csrfToken = registerRes.body.csrfToken;
    expect(userCookies).toBeDefined();
    expect(csrfToken).toBeDefined();

    // 2. Create appointment
    const aptRes = await request(app)
      .post('/api/v1/appointments')
      .set('Cookie', userCookies)
      .set('X-XSRF-TOKEN', csrfToken)
      .send({
        title: 'Endocrine Specialty Consult',
        providerName: 'Dr. Evelyn Reed',
        scheduledAt: '2026-12-10T11:00:00.000Z',
        location: 'West Wing Pavilion, Suite 12',
        notes: 'Bring previous lab results from June',
        status: 'upcoming',
      });
    expect(aptRes.status).toBe(201);
    const appointmentId = aptRes.body.id;

    // 3. Add a question
    const qRes = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/questions`)
      .set('Cookie', userCookies)
      .set('X-XSRF-TOKEN', csrfToken)
      .send({
        text: 'Are there dietary supplements that interfere with thyroid absorption?',
        order: 0,
      });
    expect(qRes.status).toBe(201);
    const questionId = qRes.body.id;

    // 4. Add a medication entry
    const medRes = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/medications`)
      .set('Cookie', userCookies)
      .set('X-XSRF-TOKEN', csrfToken)
      .send({
        name: 'Levothyroxine',
        dose: '50 mcg',
        frequency: 'Daily before breakfast',
        notes: 'Taken with full glass of water',
        order: 0,
      });
    expect(medRes.status).toBe(201);
    const medicationId = medRes.body.id;

    // 5. Add a follow-up action
    const followUpRes = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/follow-ups`)
      .set('Cookie', userCookies)
      .set('X-XSRF-TOKEN', csrfToken)
      .send({
        text: 'Obtain morning fasting TSH blood draw',
        dueAt: '2027-01-15T00:00:00.000Z',
      });
    expect(followUpRes.status).toBe(201);
    const followUpId = followUpRes.body.id;

    // 6. Generate the checklist
    const checklistRes = await request(app)
      .get(`/api/v1/appointments/${appointmentId}/checklist`)
      .set('Cookie', userCookies);
    expect(checklistRes.status).toBe(200);

    // 7. Verify all details
    expect(checklistRes.body.appointment.title).toBe('Endocrine Specialty Consult');
    expect(checklistRes.body.appointment.providerName).toBe('Dr. Evelyn Reed');
    expect(checklistRes.body.sections[0].items[0].text).toBe(
      'Are there dietary supplements that interfere with thyroid absorption?'
    );
    expect(checklistRes.body.sections[1].items[0].name).toBe('Levothyroxine');
    expect(checklistRes.body.sections[1].items[0].dose).toBe('50 mcg');
    expect(checklistRes.body.sections[2].items[0].text).toBe(
      'Obtain morning fasting TSH blood draw'
    );
    expect(checklistRes.body.notesArea).toBe(true);

    // 8. Edit an item (update medication dose)
    const updateMedRes = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/medications/${medicationId}`)
      .set('Cookie', userCookies)
      .set('X-XSRF-TOKEN', csrfToken)
      .send({
        dose: '75 mcg',
      });
    expect(updateMedRes.status).toBe(200);

    // 9. Verify the updated value in checklist
    const updatedChecklistRes = await request(app)
      .get(`/api/v1/appointments/${appointmentId}/checklist`)
      .set('Cookie', userCookies);
    expect(updatedChecklistRes.body.sections[1].items[0].dose).toBe('75 mcg');

    // 10. Delete an item (delete question)
    const deleteQRes = await request(app)
      .delete(`/api/v1/appointments/${appointmentId}/questions/${questionId}`)
      .set('Cookie', userCookies)
      .set('X-XSRF-TOKEN', csrfToken);
    expect(deleteQRes.status).toBe(200);

    // 11. Verify it disappears
    const checklistAfterDelete = await request(app)
      .get(`/api/v1/appointments/${appointmentId}/checklist`)
      .set('Cookie', userCookies);
    expect(checklistAfterDelete.body.sections[0].items).toHaveLength(0);

    // 12. Confirm another user cannot access this appointment
    const anotherUserRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another Patient',
        email: 'another.patient@example.com',
        password: 'Password999!',
      });
    const anotherUserCookies = anotherUserRes.headers['set-cookie'];

    const crossUserGet = await request(app)
      .get(`/api/v1/appointments/${appointmentId}`)
      .set('Cookie', anotherUserCookies);
    expect(crossUserGet.status).toBe(404);

    const crossUserChecklist = await request(app)
      .get(`/api/v1/appointments/${appointmentId}/checklist`)
      .set('Cookie', anotherUserCookies);
    expect(crossUserChecklist.status).toBe(404);
  });
});
