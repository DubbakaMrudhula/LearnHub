import mongoose from 'mongoose';

const reviewLogSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'START_REVIEW'],
      required: true
    },
    comments: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters'],
      maxlength: [100, 'Course title cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [20, 'Description must be at least 20 characters']
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course instructor is required'],
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Course category is required'],
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
      index: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    learningOutcomes: {
      type: [String],
      default: []
    },
    requirements: {
      type: [String],
      default: []
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewHistory: [reviewLogSchema],
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Compound filter indexes
courseSchema.index({ status: 1, category: 1, difficulty: 1 });
courseSchema.index({ instructor: 1, status: 1 });

// Virtual for modules relation
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'course'
});

// Auto-generate slug from title if not set
courseSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

export const Course = mongoose.model('Course', courseSchema);
export default Course;
