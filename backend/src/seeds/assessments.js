import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Assignment from '../models/Assignment.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export const seedAssessmentData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const course = await Course.findOne({ slug: 'full-stack-distributed-systems' });
    if (!course) {
      logger.error('Course "full-stack-distributed-systems" not found. Run courses seed first.');
      return;
    }

    // 1. Seed Quiz 1
    let quiz = await Quiz.findOne({ course: course._id, title: 'Distributed Systems & Database Mastery' });
    if (!quiz) {
      quiz = await Quiz.create({
        course: course._id,
        title: 'Distributed Systems & Database Mastery',
        description: 'Test your understanding of 4-tier layered architecture, compound indexing, and non-blocking concurrency.',
        timeLimitMinutes: 10,
        passingScore: 75,
        maxAttempts: 3,
        isRandomized: false,
        conceptTags: ['Separation of Concerns', 'Database Indexing', 'Atomic Concurrency', 'Event Loop'],
        isPublished: true
      });

      const q1 = await Question.create({
        course: course._id,
        quiz: quiz._id,
        questionText: 'In a production 4-tier backend architecture, where should pure domain business logic and state calculations be placed?',
        type: 'single_choice',
        points: 25,
        conceptTag: 'Separation of Concerns',
        difficulty: 'Medium',
        options: [
          { text: 'In Express route handler files directly alongside endpoint declarations.', isCorrect: false, explanation: 'Routes should only declare paths and verb mappings.' },
          { text: 'Inside the Controller methods right before returning the HTTP response.', isCorrect: false, explanation: 'Controllers should remain thin HTTP dispatchers.' },
          { text: 'Inside Domain Services that decouple business rules from HTTP transport details.', isCorrect: true, explanation: 'Correct! Services encapsulate reusable business logic independent of protocol.' },
          { text: 'Directly in the Mongoose database connection callback.', isCorrect: false, explanation: 'Connection callbacks only manage network sockets.' }
        ]
      });

      const q2 = await Question.create({
        course: course._id,
        quiz: quiz._id,
        questionText: 'When executing a multi-field query on MongoDB with filter `{ status: 1, category: 1, difficulty: 1 }`, which index prevents a full collection scan (COLLSCAN)?',
        type: 'single_choice',
        points: 25,
        conceptTag: 'Database Indexing',
        difficulty: 'Medium',
        options: [
          { text: 'Single field index on `createdAt`', isCorrect: false, explanation: 'A createdAt index cannot assist queries filtering by status, category, and difficulty.' },
          { text: 'A Compound index on `{ status: 1, category: 1, difficulty: 1 }`', isCorrect: true, explanation: 'Correct! Compound indexes evaluate multi-attribute queries in logarithmic time (IXSCAN).' },
          { text: 'Text search index on `description` only', isCorrect: false, explanation: 'Text indexes are designed for keyword searching, not exact compound filtering.' },
          { text: 'No index is required; MongoDB automatically caches all documents in RAM.', isCorrect: false, explanation: 'RAM cache without indexes still causes expensive COLLSCANs.' }
        ]
      });

      const q3 = await Question.create({
        course: course._id,
        quiz: quiz._id,
        questionText: 'To prevent race conditions when two concurrent requests increment a student enrollment counter, which pattern must be used?',
        type: 'single_choice',
        points: 25,
        conceptTag: 'Atomic Concurrency',
        difficulty: 'Hard',
        options: [
          { text: 'JavaScript in-memory variable: `course.enrolledCount = course.enrolledCount + 1` followed by save()', isCorrect: false, explanation: 'Read-modify-write patterns in application memory suffer from race conditions.' },
          { text: 'Database-level atomic update using `$inc: { enrolledCount: 1 }`', isCorrect: true, explanation: 'Correct! MongoDB atomic operators guarantee serialized, thread-safe updates without lost writes.' },
          { text: 'Setting setTimeout() of 100ms before each database write', isCorrect: false, explanation: 'Timeouts do not prevent concurrent race conditions.' },
          { text: 'Storing counts in local browser cookies', isCorrect: false, explanation: 'Browser storage cannot coordinate server-side data consistency.' }
        ]
      });

      const q4 = await Question.create({
        course: course._id,
        quiz: quiz._id,
        questionText: 'Consider the following JavaScript snippet. Which console log prints first?',
        codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
        type: 'single_choice',
        points: 25,
        conceptTag: 'Event Loop',
        difficulty: 'Medium',
        options: [
          { text: '2 prints first because setTimeout duration is 0ms', isCorrect: false, explanation: 'Macrotasks queued via setTimeout run after synchronous and microtask queues empty.' },
          { text: '1 and 4 print first synchronously, followed by 3 (microtask), then 2 (macrotask)', isCorrect: true, explanation: 'Correct! Synchronous code runs first (1, 4), then the microtask promise queue (3), then the timers macrotask phase (2).' },
          { text: '3 prints before 1', isCorrect: false, explanation: 'Promise microtasks never interrupt already-executing synchronous stack frames.' },
          { text: 'All numbers print concurrently at the exact same millisecond', isCorrect: false, explanation: 'JavaScript is single-threaded; execution is strictly sequential based on event loop phases.' }
        ]
      });

      quiz.questions = [q1._id, q2._id, q3._id, q4._id];
      await quiz.save();
      logger.info('Quiz 1 seeded with 4 questions.');
    }

    // 2. Seed Assignment 1
    let assignment = await Assignment.findOne({ course: course._id, title: 'Distributed Rate-Limiter Architecture' });
    if (!assignment) {
      assignment = await Assignment.create({
        course: course._id,
        title: 'Distributed Rate-Limiter Architecture',
        instructions: 'Design and implement an algorithmic sliding-window rate-limiting middleware in Node.js. Your solution must handle concurrent requests, return HTTP 429 when limits are exceeded, include standard `Retry-After` headers, and provide automated unit tests.',
        totalPoints: 100,
        submissionTypes: ['text', 'github_url'],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        rubric: [
          { criteria: 'Sliding window algorithm correctness and rate enforcement', maxPoints: 40 },
          { criteria: 'Atomic concurrency safety and race-condition defense', maxPoints: 30 },
          { criteria: 'Automated test suite and error handling resilience', maxPoints: 30 }
        ]
      });
      logger.info('Assignment 1 seeded successfully.');
    }

    logger.info('All Assessment seeds (Quizzes, Questions, Assignments) verified successfully!');
  } catch (err) {
    logger.error('Error seeding assessments:', err.message);
  }
};

// Direct invocation check
if (process.argv[1]?.includes('assessments.js')) {
  seedAssessmentData().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

export default seedAssessmentData;
