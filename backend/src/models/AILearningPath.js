import mongoose from 'mongoose';

const aiLearningPathSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    modelUsed: {
      type: String,
      default: 'gemini-1.5-flash'
    },
    isFallbackEngine: {
      type: Boolean,
      default: false
    },
    summary: {
      type: String,
      required: true
    },
    diagnosticStrengths: {
      type: [String],
      default: []
    },
    priorityWeakSpots: {
      type: [String],
      default: []
    },
    customStudyPlan: [
      {
        step: { type: Number, required: true },
        title: { type: String, required: true },
        conceptTag: { type: String, required: true },
        estimatedMinutes: { type: Number, default: 30 },
        description: { type: String, required: true },
        recommendedAction: { type: String, required: true }
      }
    ],
    recommendedPracticeExercises: [
      {
        title: { type: String, required: true },
        difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
        prompt: { type: String, required: true },
        solutionHint: { type: String, default: '' }
      }
    ],
    recommendedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ]
  },
  {
    timestamps: true
  }
);

export const AILearningPath = mongoose.model('AILearningPath', aiLearningPathSchema);
export default AILearningPath;
