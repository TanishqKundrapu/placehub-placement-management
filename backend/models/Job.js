const mongoose = require('mongoose');

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const JOB_TYPES = ['Full-time', 'Internship'];

const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: [true, 'Company is required'] },
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    type: { type: String, enum: JOB_TYPES, default: 'Full-time' },
    salary: { type: Number, required: [true, 'Salary is required'], min: [0, 'Salary cannot be negative'] }, // in LPA
    openings: { type: Number, default: 1, min: [1, 'At least one opening is required'] },
    minCgpa: { type: Number, default: 0, min: 0, max: 10 },
    eligibleBranches: {
      type: [{ type: String, enum: BRANCHES }],
      validate: [(v) => v.length > 0, 'Select at least one eligible branch'],
    },
    deadline: { type: Date, required: [true, 'Application deadline is required'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
module.exports.BRANCHES = BRANCHES;
module.exports.JOB_TYPES = JOB_TYPES;
