const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/jobs?search=&branch=&type=&minSalary=&company=&status=open|closed
const getJobs = asyncHandler(async (req, res) => {
  const { search, branch, type, minSalary, company, status } = req.query;
  const filter = {};

  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    const companyIds = (await Company.find({ name: re }, '_id')).map((c) => c._id);
    filter.$or = [{ title: re }, { location: re }, { company: { $in: companyIds } }];
  }
  if (branch) filter.eligibleBranches = branch;
  if (type) filter.type = type;
  if (minSalary) filter.salary = { $gte: Number(minSalary) };
  if (company) filter.company = company;
  if (status === 'open') filter.deadline = { $gte: new Date() };
  if (status === 'closed') filter.deadline = { $lt: new Date() };

  const jobs = await Job.find(filter).populate('company', 'name location industry').sort({ deadline: 1 }).lean();

  // Attach number of applicants for each job
  const counts = await Application.aggregate([{ $group: { _id: '$job', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  const now = new Date();
  const data = jobs
    .map((j) => ({ ...j, applicantCount: countMap[String(j._id)] || 0 }))
    // Open jobs first (nearest deadline first), closed jobs at the end
    .sort((a, b) => (new Date(a.deadline) < now) - (new Date(b.deadline) < now));

  res.json({ success: true, count: data.length, data });
});

// GET /api/jobs/:id
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company').lean();
  if (!job) throw new ApiError(404, 'Job not found');
  const applicantCount = await Application.countDocuments({ job: job._id });
  res.json({ success: true, data: { ...job, applicantCount } });
});

// POST /api/jobs
const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.body.company);
  if (!company) throw new ApiError(404, 'Company not found');
  const job = await Job.create(req.body);
  res.status(201).json({ success: true, message: 'Job posted', data: job });
});

// PUT /api/jobs/:id
const updateJob = asyncHandler(async (req, res) => {
  if (req.body.company && !(await Company.exists({ _id: req.body.company }))) {
    throw new ApiError(404, 'Company not found');
  }
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, message: 'Job updated', data: job });
});

// DELETE /api/jobs/:id  (also removes its applications)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  const { deletedCount } = await Application.deleteMany({ job: job._id });
  res.json({ success: true, message: `Job deleted along with ${deletedCount} application(s)` });
});

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };
