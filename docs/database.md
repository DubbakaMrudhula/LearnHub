# LearnHub — Database Design Specification

## Normalized Schema Architecture

The database is built on MongoDB using Mongoose with 16 normalized schemas:

1. **User**: Credentials, hashed password, role (`admin`, `instructor`, `reviewer`, `student`, `mentor`), bio, skills, learning goals, status (`isActive`, `isVerified`).
2. **Category**: Course category taxonomies (`Web Development`, `Data Science`, `Artificial Intelligence`, `Cloud & DevOps`, `Cybersecurity`).
3. **Course**: Instructor reference, category, title, slug, description, difficulty (`Beginner`, `Intermediate`, `Advanced`), status workflow (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`), review notes.
4. **Module**: Course reference, title, description, orderIndex.
5. **Lesson**: Module reference, course reference, title, type (`video`, `reading`, `resource`), content, resourceUrl, duration, orderIndex.
6. **Question**: Topic, conceptTag, questionText, questionType (`single_choice`, `multiple_choice`, `true_false`), options, correctAnswers, explanation, difficulty.
7. **Quiz**: Course reference, module reference, title, timeLimitMinutes, passingScorePercent, attemptLimit, questionBank references, isRandomized.
8. **QuizAttempt**: Student reference, quiz reference, answers, score, percentage, passed, conceptBreakdown (weak concepts detected), attemptNumber.
9. **Assignment**: Course reference, module reference, title, instructions, maxMarks, passingMarks, deadline.
10. **Submission**: Assignment reference, student reference, submissionText, fileUrl, status (`SUBMITTED`, `UNDER_REVIEW`, `EVALUATED`, `RESUBMISSION_REQUIRED`), marks, feedback, evaluatedBy.
11. **Enrollment**: Student reference, course reference, enrolledAt, completedAt, status (`ACTIVE`, `COMPLETED`, `DROPPED`).
12. **Progress**: Student reference, course reference, completedLessons, quizScores, assignmentScores, completionPercentage, lastActivityAt.
13. **Certificate**: Student reference, course reference, certificateId (UUID), issueDate, pdfUrl, verificationUrl.
14. **Feedback / CourseReview**: Course reference, student reference, rating (1-5), reviewComment.
15. **Notification**: User reference, title, message, type, isRead, readAt, metadata.
16. **MentoringSession**: Mentor reference, student reference, topic, scheduledAt, status (`SCHEDULED`, `COMPLETED`, `CANCELLED`), notes.
17. **LearningRecommendation**: Student reference, weakConcepts, recommendedAction, confidenceScore, generatedAt.
