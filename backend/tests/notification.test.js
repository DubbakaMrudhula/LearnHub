import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Notification from '../src/models/Notification.js';
import notificationService from '../src/services/notification.service.js';
import env from '../src/config/env.js';

describe('Phase 10 — In-App Notification Engine', () => {
  let studentToken = '';
  let studentId = '';
  let notifId1 = '';
  let notifId2 = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const student = await User.findOne({ email: 'student@learnhub.demo' });
    studentId = student._id.toString();
    studentToken = student.generateAuthToken();

    // Create 2 test in-app notifications
    const n1 = await notificationService.createNotification(studentId, {
      title: 'Course Completed!',
      message: 'Congratulations! You satisfied all requirements for Distributed Systems.',
      type: 'CERTIFICATE',
      link: '/certificates'
    });
    notifId1 = n1._id.toString();

    const n2 = await notificationService.createNotification(studentId, {
      title: 'Mentorship Confirmed',
      message: 'Elena Rostova accepted your 1-on-1 architecture review.',
      type: 'MENTORSHIP',
      link: '/mentorship'
    });
    notifId2 = n2._id.toString();
  });

  afterAll(async () => {
    if (studentId) {
      await Notification.deleteMany({ recipient: studentId });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/notifications should fetch user in-app notifications and unread badge count', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(2);
  });

  it('PATCH /api/notifications/:id/read should mark a single notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notifId1}/read`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notification.isRead).toBe(true);
  });

  it('PATCH /api/notifications/mark-all-read should mark all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.markedCount).toBeGreaterThanOrEqual(1);

    // Verify unreadCount is now 0
    const checkRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(checkRes.body.data.unreadCount).toBe(0);
  });
});
