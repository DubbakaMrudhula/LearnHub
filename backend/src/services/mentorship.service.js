import MentorshipSession from '../models/MentorshipSession.js';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import progressService from './progress.service.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class MentorshipService {
  /**
   * Get all active platform mentors
   */
  async getMentors() {
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .select('name email bio skills profileImage')
      .lean();
    return mentors;
  }

  /**
   * Book a 1-on-1 session with a mentor
   */
  async bookSession(studentId, sessionData) {
    const { mentorId, courseId, title, topic, scheduledDate, durationMinutes } = sessionData;

    const mentor = await User.findOne({ _id: mentorId, role: { $in: ['mentor', 'instructor', 'admin'] } });
    if (!mentor) {
      throw new AppError('Selected mentor does not exist or is not authorized as a mentor', 404, 'MENTOR_NOT_FOUND');
    }

    const session = await MentorshipSession.create({
      mentor: mentorId,
      student: studentId,
      course: courseId || undefined,
      title,
      topic: topic || '',
      scheduledDate: new Date(scheduledDate),
      durationMinutes: durationMinutes || 45,
      meetingLink: `https://meet.learnhub.demo/session-${Math.random().toString(36).substring(2, 8)}`,
      status: 'SCHEDULED'
    });

    logger.info(`Mentorship session booked: "${session.title}" between student ${studentId} and mentor ${mentorId}`);
    return session;
  }

  /**
   * Get sessions assigned to a mentor
   */
  async getMentorSessions(mentorId) {
    const sessions = await MentorshipSession.find({ mentor: mentorId })
      .populate('student', 'name email profileImage skills learningGoals')
      .populate('course', 'title slug')
      .sort({ scheduledDate: 1 });
    return sessions;
  }

  /**
   * Get sessions booked by a student
   */
  async getStudentSessions(studentId) {
    const sessions = await MentorshipSession.find({ student: studentId })
      .populate('mentor', 'name email profileImage bio skills')
      .populate('course', 'title slug')
      .sort({ scheduledDate: 1 });
    return sessions;
  }

  /**
   * Record session notes and recommendations
   */
  async completeSession(sessionId, mentorId, userRole, updateData) {
    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
      throw new AppError('Mentorship session not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && session.mentor.toString() !== mentorId.toString()) {
      throw new AppError('Forbidden: You can only complete your own assigned sessions', 403, 'INSUFFICIENT_PERMISSION');
    }

    session.sessionNotes = updateData.sessionNotes || session.sessionNotes;
    session.recommendedFocusAreas = Array.isArray(updateData.recommendedFocusAreas)
      ? updateData.recommendedFocusAreas
      : session.recommendedFocusAreas;
    session.status = 'COMPLETED';
    session.completedAt = new Date();

    await session.save();
    logger.info(`Mentorship session "${session.title}" marked COMPLETED with feedback notes.`);
    return session;
  }

  /**
   * Mentor inspects a student's real progress and weak concepts
   */
  async inspectLearnerProgress(mentorId, studentId) {
    const student = await User.findById(studentId).select('name email skills learningGoals');
    if (!student) {
      throw new AppError('Student not found', 404, 'NOT_FOUND');
    }

    // Real mathematical progress
    const progressData = await progressService.getStudentDashboard(studentId);

    // Recent quiz attempts with identified weak concepts
    const quizAttempts = await QuizAttempt.find({ student: studentId })
      .populate('quiz', 'title passingScore')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Aggregate unique weak concepts from attempts
    const weakConceptSet = new Set();
    for (const att of quizAttempts) {
      for (const concept of att.weakConcepts || []) {
        weakConceptSet.add(concept);
      }
    }

    return {
      student,
      progressSummary: progressData.summary,
      courses: progressData.courses,
      recentAttempts: quizAttempts,
      diagnosticWeakAreas: Array.from(weakConceptSet)
    };
  }
}

export const mentorshipService = new MentorshipService();
export default mentorshipService;
