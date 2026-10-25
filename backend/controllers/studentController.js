const Student = require('../models/Student');
const Application = require('../models/Application');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accept skills either as an array or a comma separated string
const normalizeSkills = (body) => {
  if (typeof body.skills === 'string') {
    body.skills = body.skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return body;
};

// GET /api/students?search=&branch=&minCgpa=
const getStudents = asyncHandler(async (req, res) => {
  const { search, branch, minCgpa } = req.query;
  const filter = {};
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: re }, { rollNo: re }, { email: re }, { skills: re }];
  }
  if (branch) filter.branch = branch;
  if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };

  const students = await Student.find(filter).sort({ rollNo: 1 }).lean();
  res.json({ success: true, count: students.length, data: students });
});

// GET /api/students/:id  (includes the student's applications)
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).lean();
  if (!student) throw new ApiError(404, 'Student not found');
  const applications = await Application.find({ student: student._id })
    .populate({ path: 'job', select: 'title salary type', populate: { path: 'company', select: 'name' } })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: { ...student, applications } });
});

// POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(normalizeSkills(req.body));
  res.status(201).json({ success: true, message: 'Student registered', data: student });
});

// PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, normalizeSkills(req.body), { new: true, runValidators: true });
  if (!student) throw new ApiError(404, 'Student not found');
  res.json({ success: true, message: 'Student updated', data: student });
});

// DELETE /api/students/:id  (also removes the student's applications)
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found');
  const { deletedCount } = await Application.deleteMany({ student: student._id });
  res.json({ success: true, message: `Student deleted along with ${deletedCount} application(s)` });
});

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
