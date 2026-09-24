import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
      min: [1, 'Time limit must be at least 1 minute']
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 1,
      max: 100
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1
    },
    isRandomized: {
      type: Boolean,
      default: true
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    conceptTags: {
      type: [String],
      default: []
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
