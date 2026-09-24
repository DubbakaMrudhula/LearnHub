import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true
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
    submissionText: {
      type: String,
      default: ''
    },
    githubUrl: {
      type: String,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED', 'RESUBMITTED'],
      default: 'SUBMITTED',
      index: true
    },
    grade: {
      type: Number,
      min: 0
    },
    feedback: {
      type: String,
      default: ''
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

assignmentSubmissionSchema.index({ assignment: 1, student: 1 });

export const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
export default AssignmentSubmission;
