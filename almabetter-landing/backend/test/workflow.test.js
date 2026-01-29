const request = require('supertest');
const app = require('../server');

describe('Admin and Mentor Workflow', () => {
  let adminToken, mentorToken, studentId, mentorId, assignmentId;

  it('Admin login', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpass' });
    expect(res.statusCode).toBe(200);
    adminToken = res.body.token;
  });

  it('Mentor login', async () => {
    const res = await request(app)
      .post('/api/mentor/auth/login')
      .send({ email: 'mentor@example.com', password: 'mentorpass' });
    expect(res.statusCode).toBe(200);
    mentorToken = res.body.token;
    mentorId = res.body.mentor.id;
  });

  it('Admin assigns mentor to student', async () => {
    // Assume studentId is known or created before
    const res = await request(app)
      .post('/api/admin/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId, mentorId });
    expect(res.statusCode).toBe(200);
  });

  it('Mentor views assigned students', async () => {
    const res = await request(app)
      .get('/api/mentor/students')
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    assignmentId = res.body[0]?.id;
  });

  it('Mentor updates student progress', async () => {
    const res = await request(app)
      .post('/api/mentor/progress')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ assignmentId, status: 'completed', completionDate: '2026-01-14', notes: 'Great job!' });
    expect(res.statusCode).toBe(200);
  });

  it('Admin views assignment history', async () => {
    const res = await request(app)
      .get('/api/admin/history')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
