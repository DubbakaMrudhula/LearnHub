import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import progressService from './progress.service.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class CertificateService {
  constructor() {
    this.uploadDir = path.resolve('uploads', 'certificates');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Issue a verified certificate for a completed course
   */
  async issueCertificate(studentId, courseId) {
    // Check if already issued
    let existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) {
      return existing;
    }

    // Verify completion criteria
    const progress = await progressService.calculateCourseProgress(studentId, courseId);
    if (!progress.isEligibleForCertificate) {
      throw new AppError(
        'Ineligible: Course must be 100% completed with all lessons, quizzes, and assignments satisfied before a certificate can be issued.',
        400,
        'COURSE_NOT_COMPLETED'
      );
    }

    const [student, course] = await Promise.all([
      User.findById(studentId),
      Course.findById(courseId).populate('instructor', 'name')
    ]);

    if (!student || !course) {
      throw new AppError('Student or course not found', 404, 'NOT_FOUND');
    }

    // Unique certificate code and SHA-256 cryptographic hash
    const certificateCode = `LH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const issueDate = new Date();
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${studentId}-${courseId}-${certificateCode}-${issueDate.toISOString()}`)
      .digest('hex');

    const pdfFilename = `certificate_${certificateCode}.pdf`;
    const pdfPath = path.join(this.uploadDir, pdfFilename);

    // Create PDF with PDFKit
    await this.generatePdfFile(pdfPath, {
      studentName: student.name,
      courseTitle: course.title,
      instructorName: course.instructor?.name || 'LearnHub Faculty',
      issueDate,
      certificateCode,
      verificationHash
    });

    const certificate = await Certificate.create({
      certificateCode,
      student: studentId,
      course: courseId,
      studentName: student.name,
      courseTitle: course.title,
      instructorName: course.instructor?.name || 'LearnHub Faculty',
      issueDate,
      verificationHash,
      overallScore: progress.overallProgress,
      pdfFilename
    });

    logger.info(`Certificate issued: ${certificateCode} for ${student.email} in ${course.title}`);
    return certificate;
  }

  /**
   * Get all certificates belonging to a student
   */
  async getStudentCertificates(studentId) {
    return await Certificate.find({ student: studentId })
      .populate('course', 'title slug thumbnail category')
      .sort({ issueDate: -1 });
  }

  /**
   * Public verification check
   */
  async verifyCertificate(certificateCode) {
    const cert = await Certificate.findOne({
      certificateCode: certificateCode.toUpperCase().trim()
    }).populate('course', 'title slug difficulty');

    if (!cert) {
      throw new AppError('Invalid certificate verification code. No record found.', 404, 'NOT_FOUND');
    }

    return {
      isValid: true,
      certificateCode: cert.certificateCode,
      studentName: cert.studentName,
      courseTitle: cert.courseTitle,
      instructorName: cert.instructorName,
      issueDate: cert.issueDate,
      verificationHash: cert.verificationHash,
      overallScore: cert.overallScore
    };
  }

  /**
   * Generate PDF file using PDFKit
   */
  async generatePdfFile(filePath, data) {
    return new Promise((resolve, reject) => {
      // Landscape A4 certificate
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 40
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Gold & Slate Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(4)
        .strokeColor('#D97706') // Amber gold
        .stroke();

      doc
        .rect(26, 26, doc.page.width - 52, doc.page.height - 52)
        .lineWidth(1)
        .strokeColor('#4F46E5') // Indigo
        .stroke();

      // Header
      doc.moveDown(1.5);
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#1E1B4B')
        .text('LEARNHUB', { align: 'center', tracking: 4 });

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#6366F1')
        .text('SKILL LEARNING & ASSESSMENT PLATFORM', { align: 'center', tracking: 2 });

      doc.moveDown(1.2);
      doc
        .font('Helvetica')
        .fontSize(16)
        .fillColor('#475569')
        .text('CERTIFICATE OF COURSE COMPLETION', { align: 'center' });

      doc.moveDown(0.8);
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#64748B')
        .text('This is to officially certify that', { align: 'center' });

      // Student Name
      doc.moveDown(0.6);
      doc
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor('#0F172A')
        .text(data.studentName, { align: 'center' });

      // Description
      doc.moveDown(0.6);
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#475569')
        .text('has successfully completed all rigorous curriculum requirements, verified assessments, and projects for', {
          align: 'center'
        });

      // Course Title
      doc.moveDown(0.6);
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#4338CA')
        .text(data.courseTitle, { align: 'center' });

      // Signatures & Metadata Block
      doc.moveDown(2);
      const bottomY = doc.page.height - 110;

      // Left: Instructor
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1E293B')
        .text(data.instructorName, 60, bottomY);
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748B')
        .text('Lead Instructor & Curriculum Architect', 60, bottomY + 15);

      // Center: Issue Date
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1E293B')
        .text(new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), doc.page.width / 2 - 60, bottomY, { width: 120, align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748B')
        .text('Date of Verification', doc.page.width / 2 - 60, bottomY + 15, { width: 120, align: 'center' });

      // Right: Certificate Code & Hash
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1E293B')
        .text(`Code: ${data.certificateCode}`, doc.page.width - 260, bottomY, { width: 200, align: 'right' });
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#64748B')
        .text(`Hash: ${data.verificationHash.substring(0, 32)}...`, doc.page.width - 260, bottomY + 15, { width: 200, align: 'right' });

      doc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}

export const certificateService = new CertificateService();
export default certificateService;
