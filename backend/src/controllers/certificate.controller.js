import path from 'path';
import fs from 'fs';
import certificateService from '../services/certificate.service.js';
import Certificate from '../models/Certificate.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const issueCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.issueCertificate(
      req.user._id,
      req.params.courseId
    );
    return successResponse(res, 'Verified certificate issued successfully', { certificate }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await certificateService.getStudentCertificates(req.user._id);
    return successResponse(res, 'Student certificates retrieved', { certificates }, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req, res, next) => {
  try {
    const result = await certificateService.verifyCertificate(req.params.certificateCode);
    return successResponse(res, 'Certificate verified successfully', { certificate: result }, 200);
  } catch (error) {
    next(error);
  }
};

export const downloadCertificatePdf = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.certificateId);
    if (!cert) {
      throw new AppError('Certificate not found', 404, 'NOT_FOUND');
    }

    const filePath = path.resolve('uploads', 'certificates', cert.pdfFilename);
    if (!fs.existsSync(filePath)) {
      // Regenerate if missing
      await certificateService.generatePdfFile(filePath, {
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        instructorName: cert.instructorName,
        issueDate: cert.issueDate,
        certificateCode: cert.certificateCode,
        verificationHash: cert.verificationHash
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cert.pdfFilename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};
