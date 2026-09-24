import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true
    },
    courseTitle: {
      type: String,
      required: true
    },
    instructorName: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    verificationHash: {
      type: String,
      required: true
    },
    overallScore: {
      type: Number,
      default: 100
    },
    pdfFilename: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
