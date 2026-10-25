const mongoose = require('mongoose');

const STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: STATUSES, default: 'Applied' },
    remarks: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// A student can apply to a job only once
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
