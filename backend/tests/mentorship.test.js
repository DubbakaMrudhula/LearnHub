import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import MentorshipSession from '../src/models/MentorshipSession.js';
import env from '../src/config/env.js';

describe('Phase 6 — Mentorship System (1-on-1 Syncs, Progress Inspection, Notes)', () => {
  let mentorToken = '';
  let mentorId = '';
  let studentToken = '';
  let studentId = '';
  let unauthorizedMentorToken = '';
  let courseId = '';
  let testSessionId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const [mUser, sUser] = await Promise.all([
      User.findOne({ email: 'mentor@learnhub.demo' }),
      User.findOne({ email: 'student@learnhub.demo' })
    ]);

    mentorId = mUser._id.toString();
    mentorToken = mUser.generateAuthToken();
    studentId = sUser._id.toString();
    studentToken = sUser.generateAuthToken();

    // Create a second mentor to test access control
    let otherMentor = await User.findOne({ email: 'other.mentor@learnhub.demo' });
    if (!otherMentor) {
      otherMentor = await User.create({
        name: 'Marcus Vance',
        email: 'other.mentor@learnhub.demo',
        password: 'Password123!',
        role: 'mentor',
        isEmailVerified: true
      });
    }
    unauthorizedMentorToken = otherMentor.generateAuthToken();

    const course = await Course.findOne();
    if (course) courseId = course._id.toString();
  });

  afterAll(async () => {
    if (testSessionId) {
      await MentorshipSession.findByIdAndDelete(testSessionId);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/mentorship/mentors should return list of active platform mentors', async () => {
    const res = await request(app)
      .get('/api/mentorship/mentors')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.mentors)).toBe(true);
    expect(res.body.data.mentors.length).toBeGreaterThan(0);
    expect(res.body.data.mentors.some((m) => m.email === 'mentor@learnhub.demo')).toBe(true);
  });

  it('POST /api/mentorship/sessions should allow a student to book a session with a mentor', async () => {
    const scheduledTime = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/mentorship/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        mentorId,
        courseId,
        title: 'System Design Mock Interview',
        topic: 'Discussing distributed caching and message broker idempotency',
        scheduledDate: scheduledTime,
        durationMinutes: 45
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session).toHaveProperty('_id');
    expect(res.body.data.session.status).toBe('SCHEDULED');
    expect(res.body.data.session.title).toBe('System Design Mock Interview');

    testSessionId = res.body.data.session._id;
  });

  it('GET /api/mentorship/mentor/sessions should allow assigned mentor to view their sessions', async () => {
    const res = await request(app)
      .get('/api/mentorship/mentor/sessions')
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.sessions)).toBe(true);
    expect(res.body.data.sessions.some((s) => s._id === testSessionId)).toBe(true);
  });

  it('GET /api/mentorship/learners/:studentId/progress should allow mentor to inspect student progress and weak spots', async () => {
    const res = await request(app)
      .get(`/api/mentorship/learners/${studentId}/progress`)
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('student');
    expect(res.body.data).toHaveProperty('progressSummary');
    expect(res.body.data).toHaveProperty('diagnosticWeakAreas');
  });

  it('PATCH /api/mentorship/sessions/:sessionId/complete should FORBID an unauthorized mentor (403)', async () => {
    const res = await request(app)
      .patch(`/api/mentorship/sessions/${testSessionId}/complete`)
      .set('Authorization', `Bearer ${unauthorizedMentorToken}`)
      .send({
        sessionNotes: 'Unauthorized note attempt'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/mentorship/sessions/:sessionId/complete should allow assigned mentor to record notes and recommendations', async () => {
    const res = await request(app)
      .patch(`/api/mentorship/sessions/${testSessionId}/complete`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        sessionNotes: 'Learner demonstrated solid knowledge. Recommended review of distributed transactions and 2-phase commit protocols.',
        recommendedFocusAreas: ['Two-phase commit', 'Saga pattern', 'Outbox pattern']
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session.status).toBe('COMPLETED');
    expect(res.body.data.session.sessionNotes).toContain('Learner demonstrated solid knowledge');
    expect(res.body.data.session.recommendedFocusAreas).toHaveLength(3);
  });

  it('GET /api/mentorship/student/sessions should allow student to review completed notes and recommendations', async () => {
    const res = await request(app)
      .get('/api/mentorship/student/sessions')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const completed = res.body.data.sessions.find((s) => s._id === testSessionId);
    expect(completed).toBeDefined();
    expect(completed.status).toBe('COMPLETED');
    expect(completed.sessionNotes).toBeTruthy();
  });
});
