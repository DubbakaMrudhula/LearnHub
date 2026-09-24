import mongoose from 'mongoose';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import seedDemoUsers from './demoUsers.js';
import seedCourseData from './courses.js';
import seedAssessmentData from './assessments.js';
import seedMentorshipData from './mentorship.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const runAllSeeds = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }
    logger.info('=========================================');
    logger.info('   LearnHub Master Seed Pipeline Initializing');
    logger.info('=========================================');

    // 1. Users
    logger.info('Seeding Demo Users across 5 Roles...');
    await seedDemoUsers();

    // 2. Categories & Courses
    logger.info('Seeding Course Curriculums, Modules & Lessons...');
    await seedCourseData();

    // 3. Quizzes & Assignments
    logger.info('Seeding Assessments, Questions & Rubrics...');
    await seedAssessmentData();

    // 4. Mentorship
    logger.info('Seeding Mentorship Syncs & Recommendations...');
    await seedMentorshipData();

    // 5. In-App Notifications
    const student = await User.findOne({ email: 'student@learnhub.demo' });
    if (student) {
      const existingNotifs = await Notification.countDocuments({ recipient: student._id });
      if (existingNotifs === 0) {
        await Notification.create([
          {
            recipient: student._id,
            title: 'Welcome to LearnHub!',
            message: 'Your learner profile has been provisioned. Explore courses and view your adaptive learning path.',
            type: 'SYSTEM',
            link: '/courses'
          },
          {
            recipient: student._id,
            title: 'Mentorship Confirmed',
            message: 'Elena Rostova scheduled your upcoming 1-on-1 architecture sync.',
            type: 'MENTORSHIP',
            link: '/mentorship'
          },
          {
            recipient: student._id,
            title: 'Quiz Performance Ready',
            message: 'Your recent Distributed Systems quiz evaluation identified concepts for review.',
            type: 'ASSESSMENT',
            link: '/ai-path'
          }
        ]);
        logger.info('Initial in-app notifications created for student demo account.');
      }
    }

    logger.info('=========================================');
    logger.info('   LearnHub Master Seed Completed Successfully!');
    logger.info('=========================================');
  } catch (err) {
    logger.error('Master seed execution failed:', err);
  }
};

if (process.argv[1]?.includes('index.js')) {
  runAllSeeds().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

export default runAllSeeds;
