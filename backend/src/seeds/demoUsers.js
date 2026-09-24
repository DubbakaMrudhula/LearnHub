import mongoose from 'mongoose';
import User from '../models/User.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export const seedDemoAccounts = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const demoUsers = [
      {
        name: 'Alex Admin',
        email: 'admin@learnhub.demo',
        password: 'Password123!',
        role: 'admin',
        bio: 'Chief Platform Administrator overseeing curriculum and user governance.',
        skills: ['Platform Governance', 'Security Audit', 'System Administration'],
        isVerified: true
      },
      {
        name: 'Dr. Sarah Connor',
        email: 'instructor@learnhub.demo',
        password: 'Password123!',
        role: 'instructor',
        bio: 'Senior Full Stack & AI instructor with 12+ years building enterprise distributed architectures.',
        skills: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'Cloud Architecture'],
        isVerified: true
      },
      {
        name: 'Marcus Vance',
        email: 'reviewer@learnhub.demo',
        password: 'Password123!',
        role: 'reviewer',
        bio: 'Lead Curriculum Reviewer specializing in pedagogical quality and assessment rigor.',
        skills: ['Quality Assurance', 'Curriculum Design', 'Assessment Standards'],
        isVerified: true
      },
      {
        name: 'Elena Rostova',
        email: 'mentor@learnhub.demo',
        password: 'Password123!',
        role: 'mentor',
        bio: 'Staff Software Engineer and industry mentor guiding capstone learners on system design.',
        skills: ['Microservices', 'Distributed Systems', 'Career Mentoring'],
        isVerified: true
      },
      {
        name: 'Rohan Sharma',
        email: 'student@learnhub.demo',
        password: 'Password123!',
        role: 'student',
        bio: 'Final year computer science student mastering modern web systems and adaptive AI.',
        skills: ['JavaScript', 'React', 'Data Structures', 'Python'],
        learningGoals: ['Full Stack Mastery', 'Algorithmic Problem Solving'],
        isVerified: true
      }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        logger.info(`Seeded demo user: ${u.email} (${u.role})`);
      } else {
        // Ensure role and password are up to date
        exists.role = u.role;
        exists.name = u.name;
        exists.password = u.password;
        await exists.save();
        logger.info(`Updated demo user: ${u.email} (${u.role})`);
      }
    }

    logger.info('All 5 demo accounts ready for evaluation testing!');
  } catch (err) {
    logger.error('Error seeding demo accounts:', err.message);
  }
};

// If run directly via node
if (process.argv[1]?.includes('demoUsers.js')) {
  seedDemoAccounts().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

export default seedDemoAccounts;
