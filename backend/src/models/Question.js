import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    codeSnippet: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'true_false'],
      default: 'single_choice',
      required: true
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true, default: false },
        explanation: { type: String, default: '' }
      }
    ],
    points: {
      type: Number,
      default: 10,
      min: 1
    },
    conceptTag: {
      type: String,
      required: [true, 'Concept tag is required for adaptive skill tracking'],
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  },
  {
    timestamps: true
  }
);

export const Question = mongoose.model('Question', questionSchema);
export default Question;
