import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import env from '../src/config/env.js';

describe('Phase 9 — Role-based Analytics Aggregation', () => {
  let adminToken = '';
  let instructorToken = '';
  let reviewerToken = '';
  let studentToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const [admin, instructor, reviewer, student] = await Promise.all([
      User.findOne({ email: 'admin@learnhub.demo' }),
      User.findOne({ email: 'instructor@learnhub.demo' }),
      User.findOne({ email: 'reviewer@learnhub.demo' }),
      User.findOne({ email: 'student@learnhub.demo' })
    ]);

    adminToken = admin.generateAuthToken();
    instructorToken = instructor.generateAuthToken();
    reviewerToken = reviewer.generateAuthToken();
    studentToken = student.generateAuthToken();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/analytics/admin should return platform KPI aggregation for Admin', async () => {
    const res = await request(app)
      .get('/api/analytics/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('kpi');
    expect(res.body.data.kpi).toHaveProperty('totalUsers');
    expect(res.body.data.kpi).toHaveProperty('totalEnrollments');
    expect(res.body.data.kpi).toHaveProperty('platformCompletionRate');
    expect(res.body.data).toHaveProperty('usersByRole');
    expect(res.body.data).toHaveProperty('coursesByStatus');
  });

  it('GET /api/analytics/admin should FORBID non-admin users (403)', async () => {
    const res = await request(app)
      .get('/api/analytics/admin')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/analytics/instructor should return authoring performance for Instructor', async () => {
    const res = await request(app)
      .get('/api/analytics/instructor')
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('coursesCount');
    expect(res.body.data).toHaveProperty('enrollmentsCount');
    expect(res.body.data).toHaveProperty('quizPassRate');
  });

  it('GET /api/analytics/reviewer should return review queue metrics for Reviewer', async () => {
    const res = await request(app)
      .get('/api/analytics/reviewer')
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('pendingReviewCount');
    expect(res.body.data).toHaveProperty('approvedCount');
  });
});
