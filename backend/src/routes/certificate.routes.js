import { Router } from 'express';
import {
  issueCertificate,
  getMyCertificates,
  verifyCertificate,
  downloadCertificatePdf
} from '../controllers/certificate.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public verification endpoint (No login required!)
router.get('/verify/:certificateCode', verifyCertificate);

// PDF Download/Stream (Protected or public with token)
router.get('/:certificateId/download', downloadCertificatePdf);

// Authenticated learner endpoints
router.post('/issue/:courseId', authenticate, issueCertificate);
router.get('/my-certificates', authenticate, getMyCertificates);

export default router;
