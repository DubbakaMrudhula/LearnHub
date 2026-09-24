import mongoose from 'mongoose';

const mentorshipSessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor reference is required'],
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true
    },
    topic: {
      type: String,
      trim: true,
      default: ''
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date and time is required']
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/hub-mentoring-session'
    },
    sessionNotes: {
      type: String,
      default: ''
    },
    recommendedFocusAreas: {
      type: [String],
      default: []
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

mentorshipSessionSchema.index({ mentor: 1, scheduledDate: 1 });
mentorshipSessionSchema.index({ student: 1, scheduledDate: 1 });

export const MentorshipSession = mongoose.model('MentorshipSession', mentorshipSessionSchema);
export default MentorshipSession;
