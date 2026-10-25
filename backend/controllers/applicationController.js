const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const populateAll = [
  { path: 'student', select: 'name rollNo branch cgpa email' },
  { path: 'job', select: 'title salary type deadline', populate: { path: 'company', select: 'name' } },
];

// GET /api/applications?status=&student=&job=
const getApplications = asyncHandler(async (req, res) => {
  const { status, student, job } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (student) filter.student = student;
  if (job) filter.job = job;

  const applications = await Application.find(filter).populate(populateAll).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: applications.length, data: applications });
});

// GET /api/applications/:id
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate(populateAll).lean();
  if (!application) throw new ApiError(404, 'Application not found');
  res.json({ success: true, data: application });
});

// POST /api/applications  -> applies eligibility rules before creating
const createApplication = asyncHandler(async (req, res) => {
  const { student: studentId, job: jobId } = req.body;

  const [student, job] = await Promise.all([Student.findById(studentId), Job.findById(jobId)]);
  if (!student) throw new ApiError(404, 'Student not found');
  if (!job) throw new ApiError(404, 'Job not found');

  // Business rules
  if (new Date(job.deadline) < new Date()) {
    throw new ApiError(400, 'Applications for this job are closed (deadline has passed)');
  }
  if (!job.eligibleBranches.includes(student.branch)) {
    throw new ApiError(403, `Not eligible: ${student.branch} branch is not allowed for this job`);
  }
  if (student.cgpa < job.minCgpa) {
    throw new ApiError(403, `Not eligible: minimum CGPA required is ${job.minCgpa}, student has ${student.cgpa}`);
  }
  if (await Application.exists({ student: studentId, job: jobId })) {
    throw new ApiError(409, 'Student has already applied to this job');
  }

  const application = await Application.create({ student: studentId, job: jobId, remarks: req.body.remarks || '' });
  await application.populate(populateAll);
  res.status(201).json({ success: true, message: 'Application submitted', data: application });
});

// PUT /api/applications/:id  -> admin updates status / remarks
const updateApplication = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.remarks !== undefined) updates.remarks = req.body.remarks;
  if (!Object.keys(updates).length) throw new ApiError(400, 'Nothing to update: send status and/or remarks');

  const application = await Application.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate(
    populateAll
  );
  if (!application) throw new ApiError(404, 'Application not found');
  res.json({ success: true, message: `Application marked as ${application.status}`, data: application });
});

// DELETE /api/applications/:id  -> withdraw an application
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found');
  res.json({ success: true, message: 'Application withdrawn' });
});

module.exports = { getApplications, getApplication, createApplication, updateApplication, deleteApplication };
