import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Category from '../src/models/Category.js';
import Module from '../src/models/Module.js';
import Lesson from '../src/models/Lesson.js';
import Enrollment from '../src/models/Enrollment.js';
import env from '../src/config/env.js';

describe('Phase 3 — Course System, Curriculum & Reviewer Tests', () => {
  let instructorToken = '';
  let otherInstructorToken = '';
  let reviewerToken = '';
  let studentToken = '';
  let categoryId = '';
  let testCourseId = '';
  let testModuleId = '';
  let testLessonId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    // Ensure test category exists
    let cat = await Category.findOne({ slug: 'software-engineering' });
    if (!cat) {
      cat = await Category.create({
        name: 'Software Engineering',
        slug: 'software-engineering',
        description: 'Testing Category'
      });
    }
    categoryId = cat._id.toString();

    // Create or find test users
    const [instUser, otherInstUser, revUser, studUser] = await Promise.all([
      User.findOneAndUpdate(
        { email: 'instructor@learnhub.demo' },
        { role: 'instructor', name: 'Dr. Sarah Connor', password: 'Password123!' },
        { upsert: true, new: true }
      ),
      User.findOneAndUpdate(
        { email: 'other.instructor@learnhub.demo' },
        { role: 'instructor', name: 'Other Instructor', password: 'Password123!' },
        { upsert: true, new: true }
      ),
      User.findOneAndUpdate(
        { email: 'reviewer@learnhub.demo' },
        { role: 'reviewer', name: 'Marcus Vance', password: 'Password123!' },
        { upsert: true, new: true }
      ),
      User.findOneAndUpdate(
        { email: 'student@learnhub.demo' },
        { role: 'student', name: 'Rohan Sharma', password: 'Password123!' },
        { upsert: true, new: true }
      )
    ]);

    instructorToken = instUser.generateAuthToken();
    otherInstructorToken = otherInstUser.generateAuthToken();
    reviewerToken = revUser.generateAuthToken();
    studentToken = studUser.generateAuthToken();
  });

  afterAll(async () => {
    // Clean up test-created course
    if (testCourseId) {
      await Lesson.deleteMany({ course: testCourseId });
      await Module.deleteMany({ course: testCourseId });
      await Enrollment.deleteMany({ course: testCourseId });
      await Course.findByIdAndDelete(testCourseId);
    }
    await User.deleteOne({ email: 'other.instructor@learnhub.demo' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Public Course Catalog', () => {
    it('GET /api/courses should return published courses and categories', async () => {
      const res = await request(app).get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('courses');
      expect(Array.isArray(res.body.data.courses)).toBe(true);
    });

    it('GET /api/courses should support search query filtering', async () => {
      const res = await request(app).get('/api/courses?search=Distributed');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Instructor Course Creation & Ownership Enforcement', () => {
    it('POST /api/courses should allow an instructor to create a course in DRAFT', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Distributed Systems & Fault Tolerance Test Course',
          subtitle: 'A test course for automated test suite',
          description: 'Deep dive into consensus algorithms and distributed state machines with high reliability.',
          category: categoryId,
          difficulty: 'Intermediate',
          tags: ['Distributed Systems', 'Testing']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course).toHaveProperty('_id');
      expect(res.body.data.course.status).toBe('DRAFT');

      testCourseId = res.body.data.course._id;
    });

    it('PUT /api/courses/:id should FORBID another instructor from modifying the course', async () => {
      const res = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${otherInstructorToken}`)
        .send({
          title: 'Hacked Title Attempt'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INSUFFICIENT_PERMISSION');
    });

    it('POST /api/courses/:courseId/modules should create curriculum module', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/modules`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Module 1: Foundations',
          description: 'Module for testing'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.module).toHaveProperty('_id');

      testModuleId = res.body.data.module._id;
    });

    it('POST /api/courses/modules/:moduleId/lessons should create a lesson', async () => {
      const res = await request(app)
        .post(`/api/courses/modules/${testModuleId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Lesson 1: Paxos & Raft Consensus',
          type: 'reading',
          content: 'Consensus protocols ensure distributed nodes agree on state machines.',
          durationMinutes: 20,
          isFreePreview: false
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson).toHaveProperty('_id');

      testLessonId = res.body.data.lesson._id;
    });
  });

  describe('Review Workflow & Decision Audit Trail', () => {
    it('PATCH /api/courses/:id/submit should submit course for review', async () => {
      const res = await request(app)
        .patch(`/api/courses/${testCourseId}/submit`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.status).toBe('SUBMITTED');
    });

    it('GET /api/reviews/pending should allow Reviewer to view review queue', async () => {
      const res = await request(app)
        .get('/api/reviews/pending')
        .set('Authorization', `Bearer ${reviewerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.courses)).toBe(true);
    });

    it('POST /api/reviews/:courseId/decision should allow Reviewer to APPROVE course', async () => {
      const res = await request(app)
        .post(`/api/reviews/${testCourseId}/decision`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          action: 'APPROVE',
          comments: 'Curriculum structure and lesson depth meet platform quality standards.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.status).toBe('APPROVED');
    });

    it('PATCH /api/courses/:id/publish should allow instructor to publish approved course', async () => {
      const res = await request(app)
        .patch(`/api/courses/${testCourseId}/publish`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.status).toBe('PUBLISHED');
    });
  });

  describe('Student Enrollment & Progress Tracking', () => {
    it('POST /api/enrollments/:courseId should allow student to enroll in course', async () => {
      // Clear existing enrollment if any
      await Enrollment.deleteMany({ course: testCourseId });

      const res = await request(app)
        .post(`/api/enrollments/${testCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment.status).toBe('ACTIVE');
    });

    it('POST /api/enrollments/:courseId should prevent duplicate enrollment', async () => {
      const res = await request(app)
        .post(`/api/enrollments/${testCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DUPLICATE_ENROLLMENT');
    });

    it('POST /api/enrollments/:courseId/lessons/:lessonId/complete should mark lesson complete and update progress', async () => {
      const res = await request(app)
        .post(`/api/enrollments/${testCourseId}/lessons/${testLessonId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.progressPercent).toBe(100);
      expect(res.body.data.isCourseCompleted).toBe(true);
    });

    it('GET /api/courses/lessons/:id should allow enrolled student to access full lesson content', async () => {
      const res = await request(app)
        .get(`/api/courses/lessons/${testLessonId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson.content).toContain('Consensus protocols');
    });
  });
});
