import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Quiz from '../src/models/Quiz.js';
import Question from '../src/models/Question.js';
import QuizAttempt from '../src/models/QuizAttempt.js';
import Assignment from '../src/models/Assignment.js';
import AssignmentSubmission from '../src/models/AssignmentSubmission.js';
import Enrollment from '../src/models/Enrollment.js';
import env from '../src/config/env.js';

describe('Phase 4 — Assessment Engine, Quizzes & Assignments Tests', () => {
  let instructorToken = '';
  let studentToken = '';
  let otherInstructorToken = '';
  let courseId = '';
  let testQuizId = '';
  let testQuestionId = '';
  let testAttemptId = '';
  let testAssignmentId = '';
  let testSubmissionId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const [instUser, otherInstUser, studUser] = await Promise.all([
      User.findOne({ email: 'instructor@learnhub.demo' }),
      User.findOneAndUpdate(
        { email: 'unauthorized.inst@learnhub.demo' },
        { role: 'instructor', name: 'Unauthorized Inst', password: 'Password123!' },
        { upsert: true, new: true }
      ),
      User.findOne({ email: 'student@learnhub.demo' })
    ]);

    instructorToken = instUser.generateAuthToken();
    otherInstructorToken = otherInstUser.generateAuthToken();
    studentToken = studUser.generateAuthToken();

    // Find or create test course
    let course = await Course.findOne({ instructor: instUser._id });
    courseId = course._id.toString();

    // Ensure student is enrolled
    await Enrollment.findOneAndUpdate(
      { student: studUser._id, course: course._id },
      { status: 'ACTIVE' },
      { upsert: true }
    );
  });

  afterAll(async () => {
    // Clean up test quiz and assignment
    if (testQuizId) {
      await Question.deleteMany({ quiz: testQuizId });
      await QuizAttempt.deleteMany({ quiz: testQuizId });
      await Quiz.findByIdAndDelete(testQuizId);
    }
    if (testAssignmentId) {
      await AssignmentSubmission.deleteMany({ assignment: testAssignmentId });
      await Assignment.findByIdAndDelete(testAssignmentId);
    }
    await User.deleteOne({ email: 'unauthorized.inst@learnhub.demo' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Quiz Authoring & Ownership Security', () => {
    it('POST /api/quizzes should allow instructor to create a quiz', async () => {
      const res = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          course: courseId,
          title: 'Automated Test Suite Quiz',
          description: 'Evaluating concurrent event execution and indexing',
          timeLimitMinutes: 15,
          passingScore: 70,
          maxAttempts: 2
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quiz).toHaveProperty('_id');
      testQuizId = res.body.data.quiz._id;
    });

    it('POST /api/quizzes/:quizId/questions should allow instructor to add a question', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${testQuizId}/questions`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          questionText: 'What is the primary benefit of compound indexing in MongoDB?',
          type: 'single_choice',
          points: 10,
          conceptTag: 'Database Indexing',
          options: [
            { text: 'Reduces disk space', isCorrect: false, explanation: 'Indexes actually take additional storage.' },
            { text: 'Allows logarithmic search across multiple fields without full collection scan', isCorrect: true, explanation: 'Compound indexes satisfy multi-attribute queries efficiently.' },
            { text: 'Encrypts documents automatically', isCorrect: false, explanation: 'Indexes do not encrypt data.' }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.question).toHaveProperty('_id');
      testQuestionId = res.body.data.question._id;
    });

    it('POST /api/quizzes/:quizId/questions should FORBID an unauthorized instructor', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${testQuizId}/questions`)
        .set('Authorization', `Bearer ${otherInstructorToken}`)
        .send({
          questionText: 'Unauthorized question',
          type: 'single_choice',
          points: 10,
          conceptTag: 'Hacking',
          options: [{ text: 'Yes', isCorrect: true }]
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INSUFFICIENT_PERMISSION');
    });
  });

  describe('Secure Quiz Runner & Auto-Scoring Engine', () => {
    it('GET /api/quizzes/:quizId/attempt should return questions STRIPPING isCorrect and explanations', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${testQuizId}/attempt`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions.length).toBeGreaterThan(0);

      const firstQuestion = res.body.data.questions[0];
      // Anti-cheat verification
      firstQuestion.options.forEach((opt) => {
        expect(opt).not.toHaveProperty('isCorrect');
        expect(opt).not.toHaveProperty('explanation');
      });
    });

    it('POST /api/quizzes/:quizId/submit should auto-score answers, calculate percentage, and detect weak concepts', async () => {
      // Find index of the correct option
      const qDoc = await Question.findById(testQuestionId);
      const correctIdx = qDoc.options.findIndex((o) => o.isCorrect);

      const res = await request(app)
        .post(`/api/quizzes/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [
            {
              questionId: testQuestionId,
              selectedOptionIndices: [correctIdx]
            }
          ]
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(10);
      expect(res.body.data.percentage).toBe(100);
      expect(res.body.data.isPassed).toBe(true);
      expect(res.body.data).toHaveProperty('attemptId');
      testAttemptId = res.body.data.attemptId;
    });

    it('GET /api/quizzes/attempts/:attemptId should provide detailed review breakdown with explanations', async () => {
      const res = await request(app)
        .get(`/api/quizzes/attempts/${testAttemptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attempt).toHaveProperty('answers');
      expect(res.body.data.attempt.answers[0].isCorrect).toBe(true);
    });

    it('POST /api/quizzes/:quizId/submit should enforce maxAttempts limit', async () => {
      // Attempt 2 (Max is 2)
      await request(app)
        .post(`/api/quizzes/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: [] });

      // Attempt 3 should fail
      const res = await request(app)
        .post(`/api/quizzes/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('MAX_ATTEMPTS_EXCEEDED');
    });
  });

  describe('Assignment Workflow & Rubric Grading', () => {
    it('POST /api/assignments should allow instructor to create an assignment with rubrics', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          course: courseId,
          title: 'Automated Test Assignment',
          instructions: 'Implement concurrency safety and submit GitHub link',
          totalPoints: 100,
          rubric: [
            { criteria: 'Concurrency safety', maxPoints: 50 },
            { criteria: 'Code clean architecture', maxPoints: 50 }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignment).toHaveProperty('_id');
      testAssignmentId = res.body.data.assignment._id;
    });

    it('POST /api/assignments/:assignmentId/submit should allow enrolled student to submit homework', async () => {
      const res = await request(app)
        .post(`/api/assignments/${testAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          githubUrl: 'https://github.com/learnhub-student/distributed-rate-limiter',
          submissionText: 'Implemented token bucket algorithm with Redis atomic pipelining.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.submission.status).toBe('SUBMITTED');
      testSubmissionId = res.body.data.submission._id;
    });

    it('POST /api/assignments/submissions/:submissionId/grade should allow instructor to grade with feedback', async () => {
      const res = await request(app)
        .post(`/api/assignments/submissions/${testSubmissionId}/grade`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          grade: 95,
          feedback: 'Excellent use of atomic multi/exec Redis blocks. Well-documented architecture.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.submission.grade).toBe(95);
      expect(res.body.data.submission.status).toBe('GRADED');
    });
  });
});
