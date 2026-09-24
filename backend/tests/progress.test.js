import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Category from '../src/models/Category.js';
import Module from '../src/models/Module.js';
import Lesson from '../src/models/Lesson.js';
import Quiz from '../src/models/Quiz.js';
import Question from '../src/models/Question.js';
import QuizAttempt from '../src/models/QuizAttempt.js';
import Assignment from '../src/models/Assignment.js';
import AssignmentSubmission from '../src/models/AssignmentSubmission.js';
import Enrollment from '../src/models/Enrollment.js';
import env from '../src/config/env.js';

describe('Phase 5 — Progress Engine (Real Calculations & Certificate Eligibility)', () => {
  let studentToken = '';
  let studentId = '';
  let instructorId = '';
  let courseId = '';
  let lessonId1 = '';
  let lessonId2 = '';
  let quizId = '';
  let assignmentId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const [instUser, studUser] = await Promise.all([
      User.findOne({ email: 'instructor@learnhub.demo' }),
      User.findOne({ email: 'student@learnhub.demo' })
    ]);

    instructorId = instUser._id.toString();
    studentId = studUser._id.toString();
    studentToken = studUser.generateAuthToken();

    let cat = await Category.findOne();

    // Create a dedicated controlled course for progress testing
    const testCourse = await Course.create({
      title: 'Progress Engine Test Course',
      slug: `progress-test-course-${Date.now()}`,
      description: 'Controlled course to test real mathematical progress formulas',
      instructor: instructorId,
      category: cat._id,
      difficulty: 'Beginner',
      status: 'PUBLISHED'
    });
    courseId = testCourse._id.toString();

    // 2 Lessons
    const m = await Module.create({ course: courseId, title: 'Module 1', orderIndex: 0 });
    const l1 = await Lesson.create({ course: courseId, module: m._id, title: 'L1', content: 'C1', orderIndex: 0 });
    const l2 = await Lesson.create({ course: courseId, module: m._id, title: 'L2', content: 'C2', orderIndex: 1 });
    lessonId1 = l1._id.toString();
    lessonId2 = l2._id.toString();

    // 1 Quiz
    const q = await Quiz.create({
      course: courseId,
      title: 'Course Quiz',
      passingScore: 70,
      maxAttempts: 3,
      isPublished: true
    });
    quizId = q._id.toString();

    const question = await Question.create({
      course: courseId,
      quiz: quizId,
      questionText: 'Test Question',
      type: 'single_choice',
      conceptTag: 'Testing',
      options: [
        { text: 'Correct Option', isCorrect: true },
        { text: 'Wrong Option', isCorrect: false }
      ]
    });
    q.questions = [question._id];
    await q.save();

    // 1 Assignment
    const a = await Assignment.create({
      course: courseId,
      title: 'Course Assignment',
      instructions: 'Submit your solution',
      totalPoints: 100
    });
    assignmentId = a._id.toString();

    // Enroll student
    await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'ACTIVE',
      completedLessons: []
    });
  });

  afterAll(async () => {
    if (courseId) {
      await AssignmentSubmission.deleteMany({ course: courseId });
      await Assignment.deleteMany({ course: courseId });
      await QuizAttempt.deleteMany({ course: courseId });
      await Question.deleteMany({ course: courseId });
      await Quiz.deleteMany({ course: courseId });
      await Lesson.deleteMany({ course: courseId });
      await Module.deleteMany({ course: courseId });
      await Enrollment.deleteMany({ course: courseId });
      await Course.findByIdAndDelete(courseId);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/progress/course/:courseId should return 0% initially for a new enrollment', async () => {
    const res = await request(app)
      .get(`/api/progress/course/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallProgress).toBe(0);
    expect(res.body.data.isCompleted).toBe(false);
    expect(res.body.data.isEligibleForCertificate).toBe(false);
    expect(res.body.data.breakdown.lessons.completed).toBe(0);
    expect(res.body.data.breakdown.lessons.total).toBe(2);
  });

  it('Completing 1 of 2 lessons should mathematically advance progress', async () => {
    // Complete lesson 1
    await request(app)
      .post(`/api/enrollments/${courseId}/lessons/${lessonId1}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);

    const res = await request(app)
      .get(`/api/progress/course/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.breakdown.lessons.completed).toBe(1);
    expect(res.body.data.breakdown.lessons.percentage).toBe(50);
    // Weighted (50% lesson weight * 50% = 25% overall)
    expect(res.body.data.overallProgress).toBe(25);
    expect(res.body.data.isEligibleForCertificate).toBe(false);
  });

  it('Passing the quiz should advance the quiz component and overall progress', async () => {
    // Submit quiz with correct answer
    await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [{ questionId: (await Question.findOne({ quiz: quizId }))._id, selectedOptionIndices: [0] }]
      });

    const res = await request(app)
      .get(`/api/progress/course/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.breakdown.quizzes.passed).toBe(1);
    expect(res.body.data.breakdown.quizzes.percentage).toBe(100);
    // 50% * 0.5 (lessons) + 100% * 0.3 (quizzes) = 25 + 30 = 55%
    expect(res.body.data.overallProgress).toBe(55);
  });

  it('Submitting the assignment should advance assignment progress', async () => {
    await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        githubUrl: 'https://github.com/learnhub/test-repo',
        submissionText: 'Test architecture documentation'
      });

    const res = await request(app)
      .get(`/api/progress/course/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.breakdown.assignments.submitted).toBe(1);
    expect(res.body.data.breakdown.assignments.percentage).toBe(100);
    // 50% * 0.5 (lessons) + 100% * 0.3 (quizzes) + 100% * 0.2 (assignments) = 25 + 30 + 20 = 75%
    expect(res.body.data.overallProgress).toBe(75);
    expect(res.body.data.isEligibleForCertificate).toBe(false);
  });

  it('Completing the final lesson should achieve 100% and unlock certificate eligibility', async () => {
    // Complete lesson 2
    await request(app)
      .post(`/api/enrollments/${courseId}/lessons/${lessonId2}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);

    const res = await request(app)
      .get(`/api/progress/course/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.overallProgress).toBe(100);
    expect(res.body.data.isCompleted).toBe(true);
    expect(res.body.data.isEligibleForCertificate).toBe(true);
  });

  it('GET /api/progress/dashboard should aggregate enrolled courses and completion metrics', async () => {
    const res = await request(app)
      .get('/api/progress/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data.summary.totalEnrolled).toBeGreaterThan(0);
    expect(res.body.data.summary.completedCoursesCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.summary).toHaveProperty('averageCompletionRate');
  });
});
