# LearnHub — REST API Specifications

## Global Conventions

- Base Prefix: `/api`
- Content Type: `application/json`
- Authentication Header: `Authorization: Bearer <jwt_token>`

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "ERROR_CODE_IDENTIFIER"
}
```

## Core Route Prefixes

- `/api/health` — System and database health status (Phase 1)
- `/api/auth` — Registration, login, JWT issuance, profile, password management (Phase 2)
- `/api/users` — User administration & profile queries (Phase 2)
- `/api/courses` — Course catalog, CRUD, curriculum builder (Phase 3)
- `/api/reviews` — Course review workflow for Content Reviewers (Phase 3)
- `/api/quizzes` — Quiz definitions & Question bank (Phase 4)
- `/api/attempts` — Quiz attempt execution & scoring (Phase 4)
- `/api/assignments` — Assignment creation & submissions (Phase 4)
- `/api/progress` — Learner progress calculation & tracking (Phase 5)
- `/api/mentors` — Mentorship sessions and learner guidance (Phase 6)
- `/api/ai` — Gemini AI recommendation engine & weak-concept analysis (Phase 7)
- `/api/certificates` — Certificate generation & verification (Phase 8)
- `/api/analytics` — Role-based aggregation analytics (Phase 9)
- `/api/notifications` — In-app notification management (Phase 10)
