import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class AssignmentService {
  /**
   * Create an assignment for a course
   */
  async createAssignment(instructorId, userRole, assignmentData) {
    const course = await Course.findById(assignmentData.course);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Forbidden: You can only create assignments for your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    const assignment = await Assignment.create(assignmentData);
    logger.info(`Assignment created: "${assignment.title}" for course ${course.title}`);
    return assignment;
  }

  /**
   * Get the primary featured assignment
   */
  async getFeaturedAssignment() {
    const assignment = await Assignment.findOne().sort({ createdAt: 1 });
    if (!assignment) {
      throw new AppError('No assignments found', 404, 'NOT_FOUND');
    }
    return assignment;
  }

  /**
   * Get all assignments for a course
   */
  async getCourseAssignments(courseId) {
    const assignments = await Assignment.find({ course: courseId })
      .populate('module', 'title')
      .sort({ createdAt: 1 });
    return assignments;
  }

  /**
   * Student submits an assignment
   */
  async submitAssignment(assignmentId, studentId, submissionData) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    }

    // Verify enrollment
    const isEnrolled = await Enrollment.findOne({ student: studentId, course: assignment.course });
    if (!isEnrolled) {
      throw new AppError('You must be enrolled in this course to submit assignments', 403, 'ENROLLMENT_REQUIRED');
    }

    let submission = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId });

    if (submission) {
      submission.submissionText = submissionData.submissionText || submission.submissionText;
      submission.githubUrl = submissionData.githubUrl || submission.githubUrl;
      submission.fileUrl = submissionData.fileUrl || submission.fileUrl;
      submission.status = 'RESUBMITTED';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignment: assignmentId,
        student: studentId,
        course: assignment.course,
        submissionText: submissionData.submissionText || '',
        githubUrl: submissionData.githubUrl || '',
        fileUrl: submissionData.fileUrl || '',
        status: 'SUBMITTED',
        submittedAt: new Date()
      });
    }

    logger.info(`Student ${studentId} submitted assignment "${assignment.title}"`);
    return submission;
  }

  /**
   * Grade an assignment submission
   */
  async gradeSubmission(submissionId, graderId, userRole, grade, feedback) {
    const submission = await AssignmentSubmission.findById(submissionId).populate('course');
    if (!submission) {
      throw new AppError('Submission not found', 404, 'NOT_FOUND');
    }

    // Must be course instructor, reviewer, or admin
    if (
      userRole !== 'admin' &&
      userRole !== 'reviewer' &&
      submission.course.instructor.toString() !== graderId.toString()
    ) {
      throw new AppError('Forbidden: You are not authorized to grade this submission', 403, 'INSUFFICIENT_PERMISSION');
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    submission.status = 'GRADED';
    submission.gradedBy = graderId;
    submission.gradedAt = new Date();

    await submission.save();
    logger.info(`Submission ${submissionId} graded: ${grade} pts by user ${graderId}`);
    return submission;
  }

  /**
   * Get all submissions for an assignment (instructor view)
   */
  async getAssignmentSubmissions(assignmentId, instructorId, userRole) {
    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    }

    if (
      userRole !== 'admin' &&
      userRole !== 'reviewer' &&
      assignment.course.instructor.toString() !== instructorId.toString()
    ) {
      throw new AppError('Forbidden: You can only view submissions for your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'name email profileImage')
      .sort({ submittedAt: -1 });

    return submissions;
  }

  /**
   * Get student's submission status for an assignment
   */
  async getMySubmission(assignmentId, studentId) {
    const submission = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId })
      .populate('gradedBy', 'name role');
    return submission;
  }
}

export const assignmentService = new AssignmentService();
export default assignmentService;
