import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export const seedCourseData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }

    const instructor = await User.findOne({ email: 'instructor@learnhub.demo' });
    if (!instructor) {
      logger.error('Instructor not found. Run demoUsers seed first.');
      return;
    }

    // 1. Seed Categories
    const categoriesData = [
      { name: 'Software Engineering', slug: 'software-engineering', description: 'Core principles of modern software architecture, patterns, and design.', icon: 'Code' },
      { name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Containerization, Kubernetes, infrastructure as code, and CI/CD pipelines.', icon: 'Cloud' },
      { name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'Machine learning algorithms, deep neural architectures, and LLM orchestration.', icon: 'BrainCircuit' },
      { name: 'Web & Full Stack', slug: 'web-full-stack', description: 'Production-ready MERN applications, reactive state management, and REST/GraphQL APIs.', icon: 'Layers' },
      { name: 'Cyber Security', slug: 'cyber-security', description: 'Application defense, authentication security, cryptography, and penetration testing.', icon: 'ShieldCheck' }
    ];

    const categoryMap = {};
    for (const c of categoriesData) {
      let catDoc = await Category.findOne({ slug: c.slug });
      if (!catDoc) {
        catDoc = await Category.create(c);
      }
      categoryMap[c.slug] = catDoc._id;
    }
    logger.info('Categories verified/seeded.');

    // 2. Course 1: Full-Stack Distributed Systems (PUBLISHED)
    let course1 = await Course.findOne({ slug: 'full-stack-distributed-systems' });
    if (!course1) {
      course1 = await Course.create({
        title: 'Full-Stack Distributed Systems with Node.js & React',
        slug: 'full-stack-distributed-systems',
        subtitle: 'Build resilient, scalable, event-driven web applications from scratch.',
        description: 'Comprehensive curriculum taking learners through production-grade architectural patterns. Learn database normalization, high-throughput message queues, rate limiting, and reactive UI updates.',
        instructor: instructor._id,
        category: categoryMap['web-full-stack'],
        difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        tags: ['React', 'Node.js', 'MongoDB', 'System Design', 'REST API'],
        learningOutcomes: [
          'Design and normalize relational and document databases',
          'Implement JWT security with refresh token rotation',
          'Architect modular services with strict separation of concerns',
          'Deploy containerized full-stack apps with automated health checks'
        ],
        requirements: ['Basic JavaScript ES6 knowledge', 'Familiarity with HTML/CSS'],
        price: 0,
        enrolledCount: 12
      });

      // Modules & Lessons for Course 1
      const m1 = await Module.create({
        course: course1._id,
        title: 'Module 1: Architecture & Backend Foundations',
        description: 'Setting up Node, Express, MongoDB connection pools, and centralized error handling.',
        orderIndex: 0
      });

      await Lesson.create([
        {
          module: m1._id,
          course: course1._id,
          title: 'Understanding 4-Tier Backend Layering',
          type: 'reading',
          content: '### Architectural Separation of Concerns\n\nIn modern web engineering, never mix route handling with business algorithms or direct database queries.\n\n```text\nRoutes -> Middleware -> Controllers -> Services -> Models -> Database\n```\n\n- **Routes**: Declare endpoint paths, HTTP verbs, and link middlewares.\n- **Controllers**: Thin orchestration handlers that parse requests and return unified JSON payloads.\n- **Services**: Pure business algorithms and state calculations.\n- **Models**: Mongoose schemas with validation, defaults, and compound indexes.',
          durationMinutes: 15,
          orderIndex: 0,
          isFreePreview: true
        },
        {
          module: m1._id,
          course: course1._id,
          title: 'Securing APIs with Helmet & Dynamic CORS',
          type: 'reading',
          content: '### Security Headers and Origin Whitelisting\n\nCross-Origin Resource Sharing (CORS) must be tightly restricted in production environments to authorized domains.\n\nCombine this with Helmet to mitigate Cross-Site Scripting (XSS), MIME-type sniffing, and clickjacking attacks.',
          durationMinutes: 20,
          orderIndex: 1,
          isFreePreview: false
        }
      ]);

      const m2 = await Module.create({
        course: course1._id,
        title: 'Module 2: Database Modeling & Index Optimization',
        description: 'Normalizing schemas, compound indexing strategies, and aggregation pipelines.',
        orderIndex: 1
      });

      await Lesson.create([
        {
          module: m2._id,
          course: course1._id,
          title: 'Mongoose Compound Indexes & Query Execution Plans',
          type: 'reading',
          content: '### Index Strategy for High-Throughput APIs\n\nWhen filtering by multiple fields such as `{ status: 1, category: 1, difficulty: 1 }`, a compound index satisfies queries in logarithmic time without full collection scans (`COLLSCAN`).',
          durationMinutes: 25,
          orderIndex: 0,
          isFreePreview: false
        },
        {
          module: m2._id,
          course: course1._id,
          title: 'Implementing Atomic Operations & Transaction Safety',
          type: 'reading',
          content: '### Atomic Updates with $inc and $addToSet\n\nPrevent race conditions by utilizing atomic MongoDB operators for counters and array additions rather than in-memory read-modify-write patterns.',
          durationMinutes: 18,
          orderIndex: 1,
          isFreePreview: false
        }
      ]);
      logger.info('Course 1 (Full-Stack Distributed Systems) seeded with modules and lessons.');
    }

    // 3. Course 2: Modern Microservices with Docker (PUBLISHED)
    let course2 = await Course.findOne({ slug: 'modern-microservices-docker-kubernetes' });
    if (!course2) {
      course2 = await Course.create({
        title: 'Modern Microservices with Docker & Kubernetes',
        slug: 'modern-microservices-docker-kubernetes',
        subtitle: 'Deconstruct monoliths into independent, containerized resilient services.',
        description: 'Master service discovery, internal networking, persistent volumes, ingress routing, and zero-downtime rolling deployments.',
        instructor: instructor._id,
        category: categoryMap['cloud-devops'],
        difficulty: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        tags: ['Docker', 'Kubernetes', 'Microservices', 'DevOps', 'Cloud'],
        learningOutcomes: ['Containerize Node.js applications', 'Author production Kubernetes manifests', 'Implement health and readiness probes'],
        requirements: ['Basic Linux command line', 'Understanding of REST APIs'],
        price: 0,
        enrolledCount: 8
      });

      const m1 = await Module.create({
        course: course2._id,
        title: 'Container Fundamentals & Dockerfile Optimization',
        description: 'Multi-stage builds, alpine images, and layer caching.',
        orderIndex: 0
      });

      await Lesson.create([
        {
          module: m1._id,
          course: course2._id,
          title: 'Writing Multi-Stage Dockerfiles for Node.js',
          type: 'reading',
          content: '### Multi-Stage Containerization\n\nMulti-stage Dockerfiles allow you to install development build tools and tests in early stages while copying only the production artifacts and `node_modules` into the final runtime image.',
          durationMinutes: 20,
          orderIndex: 0,
          isFreePreview: true
        }
      ]);
      logger.info('Course 2 (Modern Microservices) seeded.');
    }

    // 4. Course 3: Applied Machine Learning (SUBMITTED - for Reviewer testing)
    let course3 = await Course.findOne({ slug: 'applied-machine-learning-neural-networks' });
    if (!course3) {
      course3 = await Course.create({
        title: 'Applied Machine Learning & Neural Network Foundations',
        slug: 'applied-machine-learning-neural-networks',
        subtitle: 'Practical implementations of gradient descent, backpropagation, and transformers.',
        description: 'Understand the mathematical foundations of modern generative models and computer vision pipelines.',
        instructor: instructor._id,
        category: categoryMap['artificial-intelligence'],
        difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
        status: 'SUBMITTED',
        tags: ['Machine Learning', 'Python', 'Neural Networks', 'AI'],
        learningOutcomes: ['Understand backpropagation calculus', 'Implement logistic regression from scratch'],
        requirements: ['Basic linear algebra', 'Python programming'],
        price: 0
      });

      const m1 = await Module.create({
        course: course3._id,
        title: 'Vector Calculus & Gradient Descent',
        description: 'Cost functions and optimization.',
        orderIndex: 0
      });

      await Lesson.create([
        {
          module: m1._id,
          course: course3._id,
          title: 'Understanding Loss Functions and Optimization',
          type: 'reading',
          content: '### Minimizing Cost with Gradient Descent\n\nEvery machine learning model is an optimization problem seeking parameters that minimize an empirical loss function.',
          durationMinutes: 30,
          orderIndex: 0,
          isFreePreview: true
        }
      ]);
      logger.info('Course 3 (Applied Machine Learning - SUBMITTED) seeded for reviewer queue.');
    }

    // 5. Course 4: Advanced Asynchronous Programming (UNDER_REVIEW - for Reviewer testing)
    let course4 = await Course.findOne({ slug: 'advanced-asynchronous-node-concurrency' });
    if (!course4) {
      course4 = await Course.create({
        title: 'Advanced Asynchronous Programming & Concurrency in Node.js',
        slug: 'advanced-asynchronous-node-concurrency',
        subtitle: 'Deep dive into libuv, thread pools, event loop phases, and worker threads.',
        description: 'Master non-blocking I/O, cluster modules, worker threads for CPU-heavy tasks, and stream backpressure.',
        instructor: instructor._id,
        category: categoryMap['software-engineering'],
        difficulty: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
        status: 'UNDER_REVIEW',
        tags: ['Node.js', 'Concurrency', 'Event Loop', 'Worker Threads'],
        learningOutcomes: ['Understand libuv event loop phases', 'Master backpressure in streaming pipelines'],
        requirements: ['Advanced JavaScript experience'],
        price: 0
      });

      const m1 = await Module.create({
        course: course4._id,
        title: 'The Event Loop & Libuv Architecture',
        description: 'Microtasks, timers, I/O polling, and setImmediate.',
        orderIndex: 0
      });

      await Lesson.create([
        {
          module: m1._id,
          course: course4._id,
          title: 'Event Loop Phases Deep Dive',
          type: 'reading',
          content: '### The 6 Phases of the Node.js Event Loop\n\nTimers -> Pending Callbacks -> Idle, Prepare -> Poll -> Check -> Close Callbacks.',
          durationMinutes: 25,
          orderIndex: 0,
          isFreePreview: true
        }
      ]);
      logger.info('Course 4 (Advanced Asynchronous Programming - UNDER_REVIEW) seeded for reviewer inspection.');
    }

    logger.info('All curriculum seed data verified successfully!');
  } catch (err) {
    logger.error('Error seeding courses:', err.message);
  }
};

// Direct invocation check
if (process.argv[1]?.includes('courses.js')) {
  seedCourseData().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

export default seedCourseData;
