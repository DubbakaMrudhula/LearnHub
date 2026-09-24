import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class QuizService {
  /**
   * Create a quiz for a course
   */
  async createQuiz(instructorId, userRole, quizData) {
    const course = await Course.findById(quizData.course);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Forbidden: You can only create quizzes for your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    const quiz = await Quiz.create({
      ...quizData,
      questions: [],
      conceptTags: []
    });

    logger.info(`Quiz created: "${quiz.title}" for course ${course.title}`);
    return quiz;
  }

  /**
   * Get the primary featured quiz for assessment explorer
   */
  async getFeaturedQuiz() {
    const quiz = await Quiz.findOne({ isPublished: true }).sort({ createdAt: 1 });
    if (!quiz) {
      throw new AppError('No published quizzes found', 404, 'NOT_FOUND');
    }
    return quiz;
  }

  /**
   * Add a question to a quiz
   */
  async addQuestion(quizId, instructorId, userRole, questionData) {
    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && quiz.course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Forbidden: You can only add questions to your own course quizzes', 403, 'INSUFFICIENT_PERMISSION');
    }

    // Verify at least one correct option exists
    const hasCorrect = questionData.options?.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      throw new AppError('Question must have at least one correct option', 400, 'NO_CORRECT_OPTION');
    }

    const question = await Question.create({
      ...questionData,
      quiz: quizId,
      course: quiz.course._id
    });

    quiz.questions.push(question._id);
    if (questionData.conceptTag && !quiz.conceptTags.includes(questionData.conceptTag)) {
      quiz.conceptTags.push(questionData.conceptTag);
    }
    await quiz.save();

    logger.info(`Question added to Quiz "${quiz.title}": "${question.questionText.slice(0, 30)}..."`);
    return question;
  }

  /**
   * Get all quizzes for a course
   */
  async getCourseQuizzes(courseId) {
    const quizzes = await Quiz.find({ course: courseId, isPublished: true })
      .populate('module', 'title')
      .select('-questions')
      .lean();

    // Attach question count
    for (const q of quizzes) {
      q.questionCount = await Question.countDocuments({ quiz: q._id });
    }

    return quizzes;
  }

  /**
   * Prepare quiz for student to take:
   * Strips correct answers and explanations to prevent cheating!
   */
  async getQuizForAttempt(quizId, studentId, userRole) {
    const quiz = await Quiz.findById(quizId).populate('course', 'title instructor');
    if (!quiz) {
      throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    }

    // Check enrollment if student
    if (userRole === 'student') {
      const isEnrolled = await Enrollment.findOne({ student: studentId, course: quiz.course._id });
      if (!isEnrolled) {
        throw new AppError('You must be enrolled in this course to take this quiz', 403, 'ENROLLMENT_REQUIRED');
      }
    }

    // Check attempt limit
    const previousAttempts = await QuizAttempt.countDocuments({ quiz: quizId, student: studentId });
    if (previousAttempts >= quiz.maxAttempts && userRole === 'student') {
      throw new AppError(`Maximum attempt limit (${quiz.maxAttempts}) reached for this quiz`, 400, 'MAX_ATTEMPTS_EXCEEDED');
    }

    const questions = await Question.find({ quiz: quizId }).lean();
    if (questions.length === 0) {
      throw new AppError('This quiz does not have any questions yet', 400, 'EMPTY_QUIZ');
    }

    // Secure sanitized questions: remove isCorrect & explanation
    let sanitizedQuestions = questions.map((q) => {
      const sanitizedOptions = q.options.map((opt, idx) => ({
        index: idx,
        text: opt.text
      }));

      // Option randomization if requested
      if (quiz.isRandomized) {
        sanitizedOptions.sort(() => Math.random() - 0.5);
      }

      return {
        _id: q._id,
        questionText: q.questionText,
        codeSnippet: q.codeSnippet,
        type: q.type,
        points: q.points,
        conceptTag: q.conceptTag,
        options: sanitizedOptions
      };
    });

    // Randomize question order if enabled
    if (quiz.isRandomized) {
      sanitizedQuestions = sanitizedQuestions.sort(() => Math.random() - 0.5);
    }

    return {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimitMinutes: quiz.timeLimitMinutes,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        totalQuestions: sanitizedQuestions.length,
        attemptNumber: previousAttempts + 1
      },
      questions: sanitizedQuestions
    };
  }

  /**
   * Submit quiz answers, auto-score, and identify weak concepts
   */
  async submitQuizAttempt(quizId, studentId, submittedAnswers) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    }

    const previousAttempts = await QuizAttempt.countDocuments({ quiz: quizId, student: studentId });
    if (previousAttempts >= quiz.maxAttempts) {
      throw new AppError(`Maximum attempt limit (${quiz.maxAttempts}) exceeded`, 400, 'MAX_ATTEMPTS_EXCEEDED');
    }

    const dbQuestions = await Question.find({ quiz: quizId }).lean();
    const questionMap = new Map(dbQuestions.map((q) => [q._id.toString(), q]));

    let totalPoints = 0;
    let earnedScore = 0;
    const answerRecords = [];
    const conceptPerformance = {}; // { [tag]: { totalPoints: 0, earnedPoints: 0 } }

    for (const q of dbQuestions) {
      totalPoints += q.points;
      const tag = q.conceptTag || 'General';
      if (!conceptPerformance[tag]) {
        conceptPerformance[tag] = { totalPoints: 0, earnedPoints: 0 };
      }
      conceptPerformance[tag].totalPoints += q.points;
    }

    // Evaluate answers
    for (const sub of submittedAnswers) {
      const q = questionMap.get(sub.questionId?.toString());
      if (!q) continue;

      const userSelected = Array.isArray(sub.selectedOptionIndices)
        ? sub.selectedOptionIndices
        : [sub.selectedOptionIndices];

      // Identify correct indices in original question
      const correctIndices = q.options
        .map((opt, idx) => (opt.isCorrect ? idx : null))
        .filter((idx) => idx !== null);

      // Check match
      const isCorrect =
        correctIndices.length === userSelected.length &&
        correctIndices.every((idx) => userSelected.includes(idx));

      const points = isCorrect ? q.points : 0;
      earnedScore += points;

      const tag = q.conceptTag || 'General';
      if (conceptPerformance[tag]) {
        conceptPerformance[tag].earnedPoints += points;
      }

      answerRecords.push({
        question: q._id,
        selectedOptionIndices: userSelected,
        isCorrect,
        pointsAwarded: points
      });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedScore / totalPoints) * 100) : 0;
    const isPassed = percentage >= quiz.passingScore;

    // Detect weak concepts (accuracy < 60%)
    const weakConcepts = [];
    for (const [tag, stats] of Object.entries(conceptPerformance)) {
      const tagPct = stats.totalPoints > 0 ? (stats.earnedPoints / stats.totalPoints) * 100 : 0;
      if (tagPct < 60) {
        weakConcepts.push(tag);
      }
    }

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      student: studentId,
      course: quiz.course,
      attemptNumber: previousAttempts + 1,
      answers: answerRecords,
      score: earnedScore,
      totalPoints,
      percentage,
      isPassed,
      weakConcepts,
      submittedAt: new Date()
    });

    logger.info(`Student ${studentId} completed Quiz "${quiz.title}": ${percentage}% (${isPassed ? 'PASSED' : 'FAILED'})`);

    return {
      attemptId: attempt._id,
      score: earnedScore,
      totalPoints,
      percentage,
      isPassed,
      passingScore: quiz.passingScore,
      weakConcepts,
      attemptNumber: attempt.attemptNumber,
      attemptsRemaining: Math.max(0, quiz.maxAttempts - attempt.attemptNumber)
    };
  }

  /**
   * Detailed attempt breakdown with explanations
   */
  async getAttemptReview(attemptId, studentId, userRole) {
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz', 'title description passingScore maxAttempts')
      .populate('answers.question');

    if (!attempt) {
      throw new AppError('Quiz attempt record not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && userRole !== 'instructor' && attempt.student.toString() !== studentId.toString()) {
      throw new AppError('Forbidden: You can only view your own quiz attempt review', 403, 'INSUFFICIENT_PERMISSION');
    }

    return attempt;
  }
}

export const quizService = new QuizService();
export default quizService;
