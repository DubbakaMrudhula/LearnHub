import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import env from '../src/config/env.js';

describe('Phase 2 — Authentication & Authorization Tests', () => {
  const testStudent = {
    name: 'Alice Learner',
    email: 'alice.test@learnhub.demo',
    password: 'Password123!',
    role: 'student',
    skills: ['JavaScript', 'React'],
    learningGoals: ['Full Stack Development']
  };

  const testAdmin = {
    name: 'Admin User',
    email: 'admin.test@learnhub.demo',
    password: 'Password123!',
    role: 'admin'
  };

  let studentToken = '';
  let adminToken = '';

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }
    // Clean up test accounts
    await User.deleteMany({ email: { $in: [testStudent.email, testAdmin.email, 'dup.test@learnhub.demo'] } });

    // Seed admin directly for RBAC testing
    const createdAdmin = await User.create(testAdmin);
    adminToken = createdAdmin.generateAuthToken();
  });

  afterAll(async () => {
    // Cleanup created test records
    await User.deleteMany({ email: { $in: [testStudent.email, testAdmin.email, 'dup.test@learnhub.demo'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('User Registration', () => {
    it('POST /api/auth/register should register a student and return JWT token without password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testStudent);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('name', testStudent.name);
      expect(res.body.data.user).toHaveProperty('email', testStudent.email);
      expect(res.body.data.user).toHaveProperty('role', 'student');
      expect(res.body.data.user.password).toBeUndefined();

      studentToken = res.body.data.token;
    });

    it('POST /api/auth/register should fail on duplicate email with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testStudent);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DUPLICATE_EMAIL');
    });

    it('POST /api/auth/register should fail validation if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'shortpass@learnhub.demo',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('User Login', () => {
    it('POST /api/auth/login should log in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(testStudent.email);
    });

    it('POST /api/auth/login should fail with invalid password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudent.email,
          password: 'WrongPassword999!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Protected Profile Endpoints', () => {
    it('GET /api/auth/me should return current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testStudent.email);
    });

    it('GET /api/auth/me should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('NOT_AUTHENTICATED');
    });

    it('PUT /api/auth/profile should update profile fields', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          bio: 'Passionate full stack learner',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.bio).toBe('Passionate full stack learner');
      expect(res.body.data.user.skills).toContain('Node.js');
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('GET /api/users should forbid student access with 403 INSUFFICIENT_PERMISSION', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INSUFFICIENT_PERMISSION');
    });

    it('GET /api/users should allow admin access with 200 OK', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('pagination');
    });
  });
});
