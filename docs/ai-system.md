# LearnHub — AI Adaptive Learning System Architecture

## Overview
LearnHub integrates Google Gemini AI to analyze learner concept mastery and generate deterministic remediation paths.

## Architecture Workflow

```text
Learner Takes Quiz/Assignment
             │
             ▼
Concept-Level Performance Breakdown
(e.g., Classes: 85%, Inheritance: 42%, Polymorphism: 38%)
             │
             ▼
Weak Concept Detection Algorithm
             │
             ▼
Prompt Construction with Learning Goals & Weak Concepts
             │
             ▼
Gemini Generative AI Call (JSON Mode)
             │
   ┌─────────┴─────────┐
   ▼                   ▼
Success              Timeout / Failure
   │                   │
   ▼                   ▼
Validate Schema      Deterministic Fallback Generator
   │                   │
   └─────────┬─────────┘
             ▼
Persist LearningRecommendation in MongoDB
             │
             ▼
Display in Student Dashboard & Mentor View
```

## Security & Privacy Rules
1. Never transmit user passwords, JWT tokens, email addresses, or personally identifying info to AI endpoints.
2. Only send anonymized learning metrics: concept tags, score percentages, and learner skill objectives.
3. Every AI response is strictly validated before persistence.
4. Robust local fallback engine ensures continuous platform operation during network or rate-limit issues.
