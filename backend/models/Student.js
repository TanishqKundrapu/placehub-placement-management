const mongoose = require('mongoose');
const { BRANCHES } = require('./Job');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    rollNo: { type: String, required: [true, 'Roll number is required'], trim: true, uppercase: true, unique: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true, unique: true },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    branch: { type: String, required: [true, 'Branch is required'], enum: BRANCHES },
    cgpa: { type: Number, required: [true, 'CGPA is required'], min: 0, max: 10 },
    graduationYear: { type: Number, required: [true, 'Graduation year is required'] },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
