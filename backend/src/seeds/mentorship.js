import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import MentorshipSession from '../models/MentorshipSession.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export const seedMentorshipData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const mentor = await User.findOne({ email: 'mentor@learnhub.demo' });
    const student = await User.findOne({ email: 'student@learnhub.demo' });
    const course = await Course.findOne({ slug: 'full-stack-distributed-systems' });

    if (!mentor || !student) {
      logger.error('Mentor or student not found. Run demoUsers seed first.');
      return;
    }

    // 1. Completed Session with rich feedback notes
    let session1 = await MentorshipSession.findOne({
      mentor: mentor._id,
      student: student._id,
      title: '1-on-1 Distributed Architecture & Concurrency Sync'
    });

    if (!session1) {
      session1 = await MentorshipSession.create({
        mentor: mentor._id,
        student: student._id,
        course: course?._id,
        title: '1-on-1 Distributed Architecture & Concurrency Sync',
        topic: 'Review of event loop scheduling, sliding-window algorithms, and rate-limiting middleware.',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        durationMinutes: 45,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        meetingLink: 'https://meet.learnhub.demo/session-arch-sync-101',
        sessionNotes: 'Rohan demonstrated strong conceptual grasp of Express middleware pipeline and MongoDB schema normalization. We conducted a deep dive into macrotasks vs microtasks. Discussed strategies for mitigating race conditions when multiple API instances write to shared counter documents.',
        recommendedFocusAreas: [
          'Master Node.js cluster module and worker threads for CPU intensive operations',
          'Practice building sliding-window rate-limiters using atomic Redis commands',
          'Review compound index creation to avoid COLLSCAN on multi-attribute queries'
        ]
      });
      logger.info('Completed Mentorship session 1 seeded.');
    }

    // 2. Upcoming Scheduled Session
    let session2 = await MentorshipSession.findOne({
      mentor: mentor._id,
      student: student._id,
      title: 'Capstone Project Technical Architecture Review'
    });

    if (!session2) {
      session2 = await MentorshipSession.create({
        mentor: mentor._id,
        student: student._id,
        course: course?._id,
        title: 'Capstone Project Technical Architecture Review',
        topic: 'Pre-evaluation review of production deployment manifests and AI personalization engine.',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        durationMinutes: 45,
        status: 'SCHEDULED',
        meetingLink: 'https://meet.learnhub.demo/session-capstone-prep-202'
      });
      logger.info('Upcoming Mentorship session 2 seeded.');
    }

    logger.info('All Mentorship seed data verified successfully!');
  } catch (err) {
    logger.error('Error seeding mentorship:', err.message);
  }
};

// Direct invocation check
if (process.argv[1]?.includes('mentorship.js')) {
  seedMentorshipData().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

export default seedMentorshipData;
