const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/companies?search=
const getCompanies = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const re = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: re }, { industry: re }, { location: re }];
  }
  const companies = await Company.find(filter).sort({ name: 1 }).lean();

  // Attach number of jobs posted by each company
  const counts = await Job.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  const data = companies.map((c) => ({ ...c, jobCount: countMap[String(c._id)] || 0 }));

  res.json({ success: true, count: data.length, data });
});

// GET /api/companies/:id  (includes the company's jobs)
const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).lean();
  if (!company) throw new ApiError(404, 'Company not found');
  const jobs = await Job.find({ company: company._id }).sort({ deadline: 1 }).lean();
  res.json({ success: true, data: { ...company, jobs } });
});

// POST /api/companies
const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json({ success: true, message: 'Company created', data: company });
});

// PUT /api/companies/:id
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) throw new ApiError(404, 'Company not found');
  res.json({ success: true, message: 'Company updated', data: company });
});

// DELETE /api/companies/:id  (also removes its jobs and their applications)
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  const jobIds = (await Job.find({ company: company._id }, '_id')).map((j) => j._id);
  await Application.deleteMany({ job: { $in: jobIds } });
  await Job.deleteMany({ company: company._id });
  res.json({ success: true, message: `Company deleted along with ${jobIds.length} job(s)` });
});

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany };
