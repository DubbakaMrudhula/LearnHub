import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      minlength: [2, 'Module title must be at least 2 characters'],
      maxlength: [100, 'Module title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    orderIndex: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for sorting modules within a course
moduleSchema.index({ course: 1, orderIndex: 1 });

// Virtual relationship to lessons
moduleSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'module'
});

export const Module = mongoose.model('Module', moduleSchema);
export default Module;
