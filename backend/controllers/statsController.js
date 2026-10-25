const Company = require('../models/Company');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { STATUSES } = Application;
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/stats  -> numbers for the dashboard
const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const [companies, jobs, openJobs, students, applications, byStatus, placedStudents, topPackage, recent] = await Promise.all([
    Company.countDocuments(),
    Job.countDocuments(),
    Job.countDocuments({ deadline: { $gte: now } }),
    Student.countDocuments(),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.distinct('student', { status: 'Selected' }),
    Job.findOne().sort({ salary: -1 }).populate('company', 'name').lean(),
    Application.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate([
        { path: 'student', select: 'name rollNo' },
        { path: 'job', select: 'title', populate: { path: 'company', select: 'name' } },
      ])
      .lean(),
  ]);

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  byStatus.forEach((s) => (statusCounts[s._id] = s.count));

  res.json({
    success: true,
    data: {
      companies,
      jobs,
      openJobs,
      students,
      applications,
      placed: placedStudents.length,
      placementRate: students ? Math.round((placedStudents.length / students) * 100) : 0,
      statusCounts,
      topPackage: topPackage ? { salary: topPackage.salary, title: topPackage.title, company: topPackage.company?.name } : null,
      recent,
    },
  });
});

module.exports = { getStats };
