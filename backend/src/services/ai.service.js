import { GoogleGenerativeAI } from '@google/generative-ai';
import AILearningPath from '../models/AILearningPath.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';
import MentorshipSession from '../models/MentorshipSession.js';
import progressService from './progress.service.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export class AIService {
  /**
   * Get cached path or generate a new one
   */  
  async getOrGeneratePath(studentId) {
    let path = await AILearningPath.findOne({ student: studentId }).populate('recommendedCourses', 'title slug thumbnail difficulty');
    if (!path) {
      path = await this.generatePersonalizedPath(studentId);
    }
    return path;
  }

  /**
   * Generate personalized path with Gemini or domain fallback
   */
  async generatePersonalizedPath(studentId) {
    const student = await User.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // 1. Gather student diagnostic context
    const progressData = await progressService.getStudentDashboard(studentId);
    const quizAttempts = await QuizAttempt.find({ student: studentId })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const mentorSessions = await MentorshipSession.find({ student: studentId, status: 'COMPLETED' })
      .select('recommendedFocusAreas sessionNotes')
      .lean();

    // Extract weak concepts and strengths
    const weakConceptSet = new Set();
    const strongConceptSet = new Set();

    for (const att of quizAttempts) {
      for (const c of att.weakConcepts || []) {
        weakConceptSet.add(c);
      }
      if (att.percentage >= 80 && att.quiz?.title) {
        strongConceptSet.add(att.quiz.title);
      }
    }

    for (const sess of mentorSessions) {
      for (const f of sess.recommendedFocusAreas || []) {
        weakConceptSet.add(f);
      }
    }

    const weakConcepts = Array.from(weakConceptSet);
    const strongConcepts = Array.from(strongConceptSet);

    // Fetch related published courses for recommendations
    const recommendedCourses = await Course.find({ status: 'PUBLISHED' })
      .select('_id title slug difficulty thumbnail')
      .limit(3)
      .lean();

    // 2. Attempt Gemini Generative AI Generation if API key is present
    let aiResponse = null;
    let isFallback = false;

    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'dummy_gemini_key') {
      try {
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an expert full-stack software engineering mentor and pedagogical tutor for LearnHub.
Analyze this student's profile and learning diagnostics:
- Student Name: ${student.name}
- Career Goals: ${student.learningGoals || 'Full-Stack Software Engineer'}
- Current Skills: ${student.skills?.join(', ') || 'JavaScript, React, Node.js'}
- Identified Diagnostic Weak Spots (Quiz & Mentor feedback): ${weakConcepts.length > 0 ? weakConcepts.join(', ') : 'None identified yet'}
- Demonstrated Strengths: ${strongConcepts.length > 0 ? strongConcepts.join(', ') : 'General foundational knowledge'}

Generate a structured JSON response (no markdown backticks, only pure valid JSON) with the following structure:
{
  "summary": "2-3 sentences summarizing current trajectory and focal recommendations",
  "diagnosticStrengths": ["list of confirmed strengths"],
  "priorityWeakSpots": ["list of areas requiring immediate practice"],
  "customStudyPlan": [
    {
      "step": 1,
      "title": "Module Title",
      "conceptTag": "Tag",
      "estimatedMinutes": 45,
      "description": "What to learn",
      "recommendedAction": "Concrete action to take"
    }
  ],
  "recommendedPracticeExercises": [
    {
      "title": "Exercise Title",
      "difficulty": "Intermediate",
      "prompt": "Specific coding task",
      "solutionHint": "Pedagogical architectural hint"
    }
  ]
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        aiResponse = JSON.parse(cleanedText);
        logger.info(`Gemini AI learning path generated for student: ${student.email}`);
      } catch (err) {
        logger.warn(`Gemini API call failed or rate-limited: ${err.message}. Seamlessly engaging domain fallback engine.`);
        isFallback = true;
      }
    } else {
      isFallback = true;
    }

    // 3. Fallback Engine: Deterministic, Pedagogically Sound Rule-Based Model
    if (!aiResponse || isFallback) {
      aiResponse = this.generateDeterministicPath(student, weakConcepts, strongConcepts);
      isFallback = true;
    }

    // 4. Save / Update in MongoDB
    const path = await AILearningPath.findOneAndUpdate(
      { student: studentId },
      {
        student: studentId,
        generatedAt: new Date(),
        modelUsed: isFallback ? 'Domain Rule-Based Pedagogical Engine' : 'gemini-1.5-flash',
        isFallbackEngine: isFallback,
        summary: aiResponse.summary,
        diagnosticStrengths: aiResponse.diagnosticStrengths || strongConcepts,
        priorityWeakSpots: aiResponse.priorityWeakSpots || weakConcepts,
        customStudyPlan: aiResponse.customStudyPlan,
        recommendedPracticeExercises: aiResponse.recommendedPracticeExercises,
        recommendedCourses: recommendedCourses.map((c) => c._id)
      },
      { new: true, upsert: true }
    ).populate('recommendedCourses', 'title slug thumbnail difficulty');

    return path;
  }

  /**
   * Deterministic Domain Pedagogical Engine (Reliable Fallback)
   */
  generateDeterministicPath(student, weakConcepts, strongConcepts) {
    const hasEventLoop = weakConcepts.some((c) => /event loop|concurrency|async/i.test(c));
    const hasIndexing = weakConcepts.some((c) => /index|database|mongo/i.test(c));
    const hasArchitecture = weakConcepts.some((c) => /architecture|separation|pattern/i.test(c));

    const studyPlan = [];
    const practiceExercises = [];

    let stepCounter = 1;

    if (hasEventLoop || weakConcepts.length === 0) {
      studyPlan.push({
        step: stepCounter++,
        title: 'Node.js Microtask & Macrotask Execution Deep Dive',
        conceptTag: 'Event Loop',
        estimatedMinutes: 45,
        description: 'Master call stack mechanics, process.nextTick vs Promise microtask queue, and libuv thread pool scheduling.',
        recommendedAction: 'Code a synthetic event queue simulator that logs execution orders of setImmediate, setTimeout, and process.nextTick.'
      });

      practiceExercises.push({
        title: 'Event Loop Phase Execution Simulator',
        difficulty: 'Intermediate',
        prompt: 'Write an asynchronous script containing nested setTimeout(0), Promise.resolve().then(), process.nextTick(), and setImmediate(). Predict and verify the exact output sequence.',
        solutionHint: 'Remember that process.nextTick queues are drained immediately following the current phase before microtasks and timers.'
      });
    }

    if (hasIndexing || weakConcepts.length === 0) {
      studyPlan.push({
        step: stepCounter++,
        title: 'Compound Indexing & Query Plan Optimization',
        conceptTag: 'Database Indexing',
        estimatedMinutes: 40,
        description: 'Learn the Equality, Sort, Range (ESR) rule in MongoDB and eliminate in-memory sort COLLSCAN bottlenecks.',
        recommendedAction: 'Execute explain("executionStats") in MongoDB Compass on high-volume filtering queries and achieve totalDocsExamined equal to nReturned.'
      });

      practiceExercises.push({
        title: 'Zero COLLSCAN Compound Index Architecture',
        difficulty: 'Intermediate',
        prompt: 'Given a collection of 500,000 documents filtered by course category, status, and sorted by createdAt, build the optimal Mongoose compound index.',
        solutionHint: 'Place Equality fields first (category, status), followed by Sort (createdAt), followed by Range filters.'
      });
    }

    if (hasArchitecture || weakConcepts.length === 0) {
      studyPlan.push({
        step: stepCounter++,
        title: '4-Tier Backend Clean Architecture & Separation of Concerns',
        conceptTag: 'Separation of Concerns',
        estimatedMinutes: 35,
        description: 'Decouple HTTP routing layers from business domain services, transactional validators, and raw database queries.',
        recommendedAction: 'Refactor direct Mongoose model calls out of express controller handlers into isolated, testable service classes.'
      });

      practiceExercises.push({
        title: 'Atomic Sliding-Window Rate-Limiter Challenge',
        difficulty: 'Advanced',
        prompt: 'Implement a thread-safe sliding window rate-limiter middleware handling up to 10,000 concurrent requests without race condition leaks.',
        solutionHint: 'Utilize atomic Redis pipelines (MULTI/EXEC) with ZREMRANGEBYSCORE, ZADD, and ZCARD.'
      });
    }

    const priorityWeakSpots = weakConcepts.length > 0
      ? weakConcepts
      : ['Event Loop Concurrency', 'Database Index Optimization', 'Distributed Clean Architecture'];

    const diagnosticStrengths = strongConcepts.length > 0
      ? strongConcepts
      : ['REST API Design', 'JWT Authentication', 'MERN Fundamentals'];

    return {
      summary: `Diagnostic analysis for ${student.name}: Learning trajectory is strongly aligned with modern Full-Stack engineering. targeted focus on ${priorityWeakSpots.slice(0, 2).join(' and ')} will accelerate your readiness for production-level system design and technical evaluations.`,
      diagnosticStrengths,
      priorityWeakSpots,
      customStudyPlan: studyPlan,
      recommendedPracticeExercises: practiceExercises
    };
  }
}

export const aiService = new AIService();
export default aiService;
