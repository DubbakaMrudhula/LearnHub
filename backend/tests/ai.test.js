import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import AILearningPath from '../src/models/AILearningPath.js';
import env from '../src/config/env.js';

describe('Phase 7 — AI Adaptive Learning System (Gemini API with Fallback)', () => {
  let studentToken = '';
  let studentId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const student = await User.findOne({ email: 'student@learnhub.demo' });
    studentId = student._id.toString();
    studentToken = student.generateAuthToken();
  });

  afterAll(async () => {
    if (studentId) {
      await AILearningPath.deleteMany({ student: studentId });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/ai/path should generate and return a personalized learning path', async () => {
    const res = await request(app)
      .get('/api/ai/path')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('path');
    const path = res.body.data.path;
    expect(path).toHaveProperty('summary');
    expect(Array.isArray(path.diagnosticStrengths)).toBe(true);
    expect(Array.isArray(path.priorityWeakSpots)).toBe(true);
    expect(Array.isArray(path.customStudyPlan)).toBe(true);
    expect(path.customStudyPlan.length).toBeGreaterThan(0);
    expect(Array.isArray(path.recommendedPracticeExercises)).toBe(true);
    expect(path.recommendedPracticeExercises.length).toBeGreaterThan(0);
  });

  it('POST /api/ai/path/generate should force regenerate recommendations', async () => {
    const res = await request(app)
      .post('/api/ai/path/generate')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.path).toHaveProperty('generatedAt');
    expect(res.body.data.path.customStudyPlan[0]).toHaveProperty('step');
    expect(res.body.data.path.customStudyPlan[0]).toHaveProperty('title');
    expect(res.body.data.path.customStudyPlan[0]).toHaveProperty('conceptTag');
    expect(res.body.data.path.customStudyPlan[0]).toHaveProperty('recommendedAction');
  });
});
