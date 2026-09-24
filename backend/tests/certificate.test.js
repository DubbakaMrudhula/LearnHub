import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Category from '../src/models/Category.js';
import Module from '../src/models/Module.js';
import Lesson from '../src/models/Lesson.js';
import Enrollment from '../src/models/Enrollment.js';
import Certificate from '../src/models/Certificate.js';
import env from '../src/config/env.js';

describe('Phase 8 — Certificate System (PDFKit + Public Verification)', () => {
  let studentToken = '';
  let studentId = '';
  let instructorId = '';
  let completeCourseId = '';
  let incompleteCourseId = '';
  let issuedCertificateCode = '';
  let issuedCertificateId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const [inst, stud] = await Promise.all([
      User.findOne({ email: 'instructor@learnhub.demo' }),
      User.findOne({ email: 'student@learnhub.demo' })
    ]);

    instructorId = inst._id.toString();
    studentId = stud._id.toString();
    studentToken = stud.generateAuthToken();

    const cat = await Category.findOne();

    // 1. Fully Completed Course
    const c1 = await Course.create({
      title: 'Completed Cloud Mastery Course',
      slug: `completed-cloud-course-${Date.now()}`,
      description: 'Test course for certificate issuance',
      instructor: instructorId,
      category: cat._id,
      difficulty: 'Advanced',
      status: 'PUBLISHED'
    });
    completeCourseId = c1._id.toString();

    const m1 = await Module.create({ course: completeCourseId, title: 'Mod 1', orderIndex: 0 });
    const l1 = await Lesson.create({ course: completeCourseId, module: m1._id, title: 'Les 1', content: 'Cont 1', orderIndex: 0 });

    // Enroll and mark complete
    await Enrollment.create({
      student: studentId,
      course: completeCourseId,
      status: 'COMPLETED',
      completedLessons: [l1._id],
      completedAt: new Date()
    });

    // 2. Incomplete Course
    const c2 = await Course.create({
      title: 'Incomplete Systems Course',
      slug: `incomplete-systems-course-${Date.now()}`,
      description: 'Course that is not yet completed',
      instructor: instructorId,
      category: cat._id,
      difficulty: 'Beginner',
      status: 'PUBLISHED'
    });
    incompleteCourseId = c2._id.toString();

    const m2 = await Module.create({ course: incompleteCourseId, title: 'Mod 2', orderIndex: 0 });
    await Lesson.create({ course: incompleteCourseId, module: m2._id, title: 'Les 2', content: 'Cont 2', orderIndex: 0 });

    await Enrollment.create({
      student: studentId,
      course: incompleteCourseId,
      status: 'ACTIVE',
      completedLessons: []
    });
  });

  afterAll(async () => {
    if (completeCourseId) {
      await Certificate.deleteMany({ course: completeCourseId });
      await Enrollment.deleteMany({ course: completeCourseId });
      await Lesson.deleteMany({ course: completeCourseId });
      await Module.deleteMany({ course: completeCourseId });
      await Course.findByIdAndDelete(completeCourseId);
    }
    if (incompleteCourseId) {
      await Enrollment.deleteMany({ course: incompleteCourseId });
      await Lesson.deleteMany({ course: incompleteCourseId });
      await Module.deleteMany({ course: incompleteCourseId });
      await Course.findByIdAndDelete(incompleteCourseId);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('POST /api/certificates/issue/:courseId should REJECT when course is incomplete (400)', async () => {
    const res = await request(app)
      .post(`/api/certificates/issue/${incompleteCourseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('COURSE_NOT_COMPLETED');
  });

  it('POST /api/certificates/issue/:courseId should successfully issue verified certificate for completed course', async () => {
    const res = await request(app)
      .post(`/api/certificates/issue/${completeCourseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificate).toHaveProperty('certificateCode');
    expect(res.body.data.certificate.certificateCode).toMatch(/^LH-/);
    expect(res.body.data.certificate).toHaveProperty('verificationHash');
    expect(res.body.data.certificate.verificationHash).toHaveLength(64); // SHA-256

    issuedCertificateCode = res.body.data.certificate.certificateCode;
    issuedCertificateId = res.body.data.certificate._id;
  });

  it('GET /api/certificates/my-certificates should return the student credentials', async () => {
    const res = await request(app)
      .get('/api/certificates/my-certificates')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.certificates)).toBe(true);
    expect(res.body.data.certificates.some((c) => c.certificateCode === issuedCertificateCode)).toBe(true);
  });

  it('GET /api/certificates/verify/:certificateCode should publicly verify without authentication', async () => {
    const res = await request(app)
      .get(`/api/certificates/verify/${issuedCertificateCode}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificate.isValid).toBe(true);
    expect(res.body.data.certificate.certificateCode).toBe(issuedCertificateCode);
    expect(res.body.data.certificate).toHaveProperty('studentName');
    expect(res.body.data.certificate).toHaveProperty('courseTitle');
    expect(res.body.data.certificate).toHaveProperty('verificationHash');
  });

  it('GET /api/certificates/verify/INVALID-CODE should return 404', async () => {
    const res = await request(app)
      .get('/api/certificates/verify/LH-INVALID-FAKE-CODE');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/certificates/:certificateId/download should stream the PDF file', async () => {
    const res = await request(app)
      .get(`/api/certificates/${issuedCertificateId}/download`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body).toBeDefined();
  });
});
