# LearnHub — Architectural Specification

## 1. System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                    React Client (Vite)                      │
│   Tailwind CSS  │  React Router  │  Axios Layer  │  Context │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Backend API                     │
│  Helmet │ CORS │ Rate Limiter │ Body Parser │ Morgan Logger │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    Authentication & RBAC     │ │     AI Adaptive Engine      │
│ JWT │ bcryptjs │ 5 Roles     │ │ Google Gemini API (Fallback)│
└──────────────┬───────────────┘ └─────────────┬───────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Domain Services                       │
│ Courses │ Quizzes │ Progress │ Certificates │ Notifications │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database (Mongoose)                │
│ Normalized Schemas │ Indexes │ Aggregations │ Relations     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Backend Layering Pattern

The backend strictly adheres to a 4-tier separation:
1. **Routes (`src/routes/`)**: Define HTTP verbs, resource endpoints, and wire middleware.
2. **Middleware (`src/middleware/`)**: Authentication (`verifyToken`), RBAC (`requireRoles`), request validation (`express-validator`), centralized error handling.
3. **Controllers (`src/controllers/`)**: Extract request params/body, invoke domain services, and return standardized JSON responses via `apiResponse.js`.
4. **Services (`src/services/`)**: Implement business logic, mathematical calculations (progress, scores), AI integrations, and database operations.
5. **Models (`src/models/`)**: Normalized Mongoose schemas with validation, defaults, timestamps, and indexes.

## 3. Five-Role Authorization Matrix

| Role | Permissions & Scope |
|---|---|
| **Student** | Browse courses, enroll, consume lessons, take quizzes, submit assignments, view AI learning paths, earn certificates. |
| **Instructor** | Create/manage curriculum, add quizzes & questions, evaluate assignments, inspect course analytics. |
| **Content Reviewer** | Review submitted courses, inspect lessons and quizzes, approve/reject/request changes with audit notes. |
| **Mentor** | Inspect assigned student performance, view concept weak spots, submit feedback, schedule mentoring sessions. |
| **Platform Admin** | User governance, activate/deactivate accounts, manage category taxonomies, inspect system-wide analytics. |
