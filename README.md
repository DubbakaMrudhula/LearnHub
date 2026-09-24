# LearnHub — Skill Learning & Assessment Platform

> A production-grade, AI-enabled MERN platform for skill acquisition, adaptive assessments, concept-level evaluation, automated certification, and mentoring.
> Suitable for B.Tech Capstone / Final Evaluation.

---

## 1. Demo Credentials (Quick-Fill Available on Login Page)

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@learnhub.demo` | `Password123!` | System-wide analytics, user governance, category management |
| **Instructor** | `instructor@learnhub.demo` | `Password123!` | Course authoring studio, module/lesson builder, quiz authoring, assignment rubric grading |
| **Reviewer** | `reviewer@learnhub.demo` | `Password123!` | Curriculum review queue, inspection, approve/reject/request changes workflow with audit trail |
| **Mentor** | `mentor@learnhub.demo` | `Password123!` | 1-on-1 session queue, student progress inspection, weak concept diagnostic review, session notes & recommendations |
| **Student** | `student@learnhub.demo` | `Password123!` | Course enrollment, classroom learning, timed quizzes, assignment submissions, real progress tracking, certificates, AI adaptive learning |

---

## 2. Complete Architecture & Features

### Core Modules
1. **Authentication & RBAC (Role-Based Access Control)**
   - JWT authentication with HTTP-only tokens, bcryptjs password hashing (cost factor 12).
   - Strict 5-role governance (`student`, `instructor`, `reviewer`, `mentor`, `admin`).
   - Profile management with skill tags and career learning goals.

2. **Course Curriculum & Content Reviewer Workflow**
   - Course status lifecycle: `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` → `PUBLISHED` → `ARCHIVED`.
   - Instructor Studio with module and lesson builder.
   - Dedicated Reviewer Portal with audit trail logging for all decisions.
   - Interactive Learning Classroom with hierarchical curriculum navigation and progress tracking.

3. **Assessment Engine, Quizzes & Assignments**
   - Anti-cheat question sanitization (stripping `isCorrect` and explanations before submission).
   - Interactive Quiz Runner with live countdown timer and auto-submission.
   - Algorithmic detection of weak concept tags (accuracy < 60%).
   - Pedagogical question-by-question breakdown with detailed explanations.
   - Homework assignment submissions with GitHub repository links and rubric-based instructor grading.

4. **Real Progress Engine (Mathematical Calculations)**
   - Multi-factor weighted progress formula:
     $$\text{Overall Progress} = (0.50 \times L) + (0.30 \times Q) + (0.20 \times A)$$
   - Real-time completion validation: 100% course completion unlocked only when all lessons are finished, required quizzes passed, and assignments submitted.
   - "Resume Learning" pointer tracking last accessed lessons.

5. **Mentoring System**
   - Direct 1-on-1 booking with senior industry mentors.
   - Mentor progress inspection modal (displays student course completion, quiz scores, and weak spots).
   - Session logging form for qualitative feedback and recommended focus tags.

6. **AI Adaptive Learning System (Gemini API with Fallback)**
   - Google Generative AI integration powered by Gemini API.
   - Deterministic offline domain-specific pedagogical fallback ensures 100% reliability with zero crashes even without an API key or when rate-limited.
   - Synthesizes personalized study plans and interactive practice challenges directly addressing detected quiz weak spots.

7. **Verifiable Certificate System (PDFKit + Public Verification)**
   - Issued exclusively upon verified 100% course completion.
   - Dynamic high-resolution landscape A4 PDF generation with gold/indigo border, signatures, and timestamps.
   - SHA-256 cryptographic verification hash and unique code (`LH-XXXXX`).
   - Public verification portal (`/verify/:code`) accessible without authentication.

8. **Role-Based Analytics Aggregation**
   - Admin Executive Command Center: KPI metrics, user distribution by role, course lifecycle breakdown, and recent activity logs.
   - Instructor Analytics: enrollment volumes, quiz pass rates, and assignment performance.
   - Reviewer Analytics: review queue turnaround and approval counts.

9. **In-App Notification Engine**
   - 100% in-app notification center (strictly no external email dependencies).
   - Real-time notification bell dropdown in navigation bar with unread counters, mark all read, and direct navigation links.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React, React Hook Form
- **Backend**: Node.js (ES Modules), Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit, Express-Validator, Cloudinary, Multer, PDFKit, @google/generative-ai
- **Testing**: Jest, Supertest (65 integration tests passing across 10 test suites)

---

## 4. Quick Start Guide

### Prerequisites
- Node.js >= 18
- MongoDB running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### Installation & Seeding
```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all

# 2. Configure environment (backend/.env)
cp backend/.env.example backend/.env

# 3. Seed all realistic demo data (users, courses, assessments, mentorship, notifications)
cd backend
npm run seed
```

### Running Locally
```bash
# Run backend (Port 5000)
cd backend
npm run dev

# In a separate terminal, run frontend (Port 5173 / 5174)
cd frontend
npm run dev
```

Visit the application in your browser:
- **Frontend**: [http://localhost:5174](http://localhost:5174) (or [http://localhost:5173](http://localhost:5173))
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Public Certificate Verification**: [http://localhost:5174/verify](http://localhost:5174/verify)

---

## 5. Automated Test Suite (65/65 Passing)

Run the full integration test suite against the backend:
```bash
cd backend
npm test
```

```text
Test Suites: 10 passed, 10 total
Tests:       65 passed, 65 total
Snapshots:   0 total
Time:        49.313 s
```
- `tests/health.test.js`: 3 passed
- `tests/auth.test.js`: 10 passed
- `tests/course.test.js`: 14 passed
- `tests/assessment.test.js`: 10 passed
- `tests/progress.test.js`: 6 passed
- `tests/mentorship.test.js`: 7 passed
- `tests/ai.test.js`: 2 passed
- `tests/certificate.test.js`: 6 passed
- `tests/analytics.test.js`: 4 passed
- `tests/notification.test.js`: 3 passed
