import mongoose from 'mongoose';

const rubricItemSchema = new mongoose.Schema(
  {
    criteria: { type: String, required: true },
    maxPoints: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
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
      required: [true, 'Assignment title is required'],
      trim: true
    },
    instructions: {
      type: String,
      required: [true, 'Assignment instructions are required']
    },
    dueDate: {
      type: Date
    },
    totalPoints: {
      type: Number,
      default: 100,
      min: 1
    },
    submissionTypes: {
      type: [String],
      enum: ['text', 'github_url', 'file_url'],
      default: ['text', 'github_url']
    },
    rubric: [rubricItemSchema]
  },
  {
    timestamps: true
  }
);

export const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
