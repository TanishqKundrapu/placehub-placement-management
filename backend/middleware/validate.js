const mongoose = require('mongoose');
const { BRANCHES, JOB_TYPES } = require('../models/Job');
const { STATUSES } = require('../models/Application');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// Builds a middleware from a rule function. The rule pushes messages into `errors`.
// `partial` is true for PUT requests, so missing fields are allowed but present ones are still checked.
const makeValidator = (rules) => (req, res, next) => {
  const errors = [];
  const partial = req.method === 'PUT' || req.method === 'PATCH';
  rules(req.body || {}, errors, partial);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

const required = (body, fields, errors, partial) => {
  if (partial) return;
  fields.forEach(([key, label]) => {
    if (isBlank(body[key])) errors.push(`${label} is required`);
  });
};

const validateCompany = makeValidator((b, errors, partial) => {
  required(b, [['name', 'Company name'], ['industry', 'Industry'], ['location', 'Location']], errors, partial);
  if (!isBlank(b.email) && !EMAIL_RE.test(b.email)) errors.push('Company email is invalid');
  if (!isBlank(b.website) && !/^https?:\/\//.test(b.website)) errors.push('Website must start with http:// or https://');
});

const validateJob = makeValidator((b, errors, partial) => {
  required(
    b,
    [['company', 'Company'], ['title', 'Job title'], ['location', 'Location'], ['salary', 'Salary'], ['deadline', 'Deadline']],
    errors,
    partial
  );
  if (!isBlank(b.company) && !mongoose.isValidObjectId(b.company)) errors.push('Company id is invalid');
  if (!isBlank(b.salary) && (isNaN(b.salary) || Number(b.salary) < 0)) errors.push('Salary must be a positive number');
  if (!isBlank(b.minCgpa) && (isNaN(b.minCgpa) || b.minCgpa < 0 || b.minCgpa > 10)) errors.push('Minimum CGPA must be between 0 and 10');
  if (!isBlank(b.openings) && (!Number.isInteger(Number(b.openings)) || Number(b.openings) < 1)) errors.push('Openings must be at least 1');
  if (!isBlank(b.type) && !JOB_TYPES.includes(b.type)) errors.push(`Type must be one of ${JOB_TYPES.join(', ')}`);
  if (!isBlank(b.deadline) && isNaN(Date.parse(b.deadline))) errors.push('Deadline must be a valid date');
  if (b.eligibleBranches !== undefined) {
    if (!Array.isArray(b.eligibleBranches) || b.eligibleBranches.length === 0) errors.push('Select at least one eligible branch');
    else if (b.eligibleBranches.some((br) => !BRANCHES.includes(br))) errors.push(`Branches must be from ${BRANCHES.join(', ')}`);
  } else if (!partial) errors.push('Select at least one eligible branch');
});

const validateStudent = makeValidator((b, errors, partial) => {
  required(
    b,
    [['name', 'Name'], ['rollNo', 'Roll number'], ['email', 'Email'], ['phone', 'Phone'], ['branch', 'Branch'], ['cgpa', 'CGPA'], ['graduationYear', 'Graduation year']],
    errors,
    partial
  );
  if (!isBlank(b.email) && !EMAIL_RE.test(b.email)) errors.push('Email is invalid');
  if (!isBlank(b.phone) && !PHONE_RE.test(String(b.phone))) errors.push('Phone must be a valid 10-digit mobile number');
  if (!isBlank(b.branch) && !BRANCHES.includes(b.branch)) errors.push(`Branch must be one of ${BRANCHES.join(', ')}`);
  if (!isBlank(b.cgpa) && (isNaN(b.cgpa) || b.cgpa < 0 || b.cgpa > 10)) errors.push('CGPA must be between 0 and 10');
  if (!isBlank(b.graduationYear) && !/^\d{4}$/.test(String(b.graduationYear))) errors.push('Graduation year must be a 4-digit year');
});

const validateApplication = makeValidator((b, errors, partial) => {
  required(b, [['student', 'Student'], ['job', 'Job']], errors, partial);
  if (!isBlank(b.student) && !mongoose.isValidObjectId(b.student)) errors.push('Student id is invalid');
  if (!isBlank(b.job) && !mongoose.isValidObjectId(b.job)) errors.push('Job id is invalid');
  if (!isBlank(b.status) && !STATUSES.includes(b.status)) errors.push(`Status must be one of ${STATUSES.join(', ')}`);
});

// Rejects malformed :id params before they reach the database
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: `Invalid id: ${req.params.id}` });
  }
  next();
};

module.exports = { validateCompany, validateJob, validateStudent, validateApplication, validateObjectId };
