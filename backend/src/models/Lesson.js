import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
      index: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: [2, 'Lesson title must be at least 2 characters'],
      maxlength: [120, 'Lesson title cannot exceed 120 characters']
    },
    type: {
      type: String,
      enum: ['video', 'reading', 'resource'],
      default: 'reading',
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    resourceUrls: {
      type: [String],
      default: []
    },
    durationMinutes: {
      type: Number,
      default: 10,
      min: 1
    },
    orderIndex: {
      type: Number,
      default: 0
    },
    isFreePreview: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Order index within module
lessonSchema.index({ module: 1, orderIndex: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
