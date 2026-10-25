// Fills the database with sample data: `npm run seed`
require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Student = require('./models/Student');
const Application = require('./models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_db';

const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

const companies = [
  { name: 'TCS', industry: 'IT Services', location: 'Hyderabad', website: 'https://www.tcs.com', email: 'campus@tcs.com', description: 'Global IT services and consulting company.' },
  { name: 'Infosys', industry: 'IT Services', location: 'Bengaluru', website: 'https://www.infosys.com', email: 'hiring@infosys.com', description: 'Digital services and consulting.' },
  { name: 'Amazon', industry: 'E-commerce / Cloud', location: 'Hyderabad', website: 'https://www.amazon.jobs', email: 'university@amazon.com', description: 'E-commerce, cloud computing and AI.' },
  { name: 'Deloitte', industry: 'Consulting', location: 'Mumbai', website: 'https://www2.deloitte.com', email: 'campus@deloitte.com', description: 'Audit, consulting and advisory services.' },
  { name: 'L&T', industry: 'Engineering & Construction', location: 'Chennai', website: 'https://www.larsentoubro.com', email: 'careers@lnt.com', description: 'Engineering, construction and manufacturing.' },
  { name: 'Qualcomm', industry: 'Semiconductors', location: 'Hyderabad', website: 'https://www.qualcomm.com', email: 'campus@qualcomm.com', description: 'Wireless technology and chip design.' },
];

const students = [
  { name: 'Aarav Sharma', rollNo: 'VU21CSE0001', email: 'aarav@gitam.in', phone: '9876543210', branch: 'CSE', cgpa: 9.1, graduationYear: 2026, skills: ['React', 'Node.js', 'MongoDB'] },
  { name: 'Priya Reddy', rollNo: 'VU21CSE0002', email: 'priya@gitam.in', phone: '9876543211', branch: 'CSE', cgpa: 8.4, graduationYear: 2026, skills: ['Java', 'Spring', 'SQL'] },
  { name: 'Rahul Verma', rollNo: 'VU21IT0003', email: 'rahul@gitam.in', phone: '9876543212', branch: 'IT', cgpa: 7.2, graduationYear: 2026, skills: ['Python', 'Django'] },
  { name: 'Sneha Iyer', rollNo: 'VU21ECE0004', email: 'sneha@gitam.in', phone: '9876543213', branch: 'ECE', cgpa: 8.8, graduationYear: 2026, skills: ['VLSI', 'Verilog', 'C'] },
  { name: 'Karthik Rao', rollNo: 'VU21MECH0005', email: 'karthik@gitam.in', phone: '9876543214', branch: 'MECH', cgpa: 7.9, graduationYear: 2026, skills: ['AutoCAD', 'SolidWorks'] },
  { name: 'Ananya Gupta', rollNo: 'VU21CSE0006', email: 'ananya@gitam.in', phone: '9876543215', branch: 'CSE', cgpa: 6.8, graduationYear: 2026, skills: ['HTML', 'CSS', 'JavaScript'] },
  { name: 'Vikram Singh', rollNo: 'VU21EEE0007', email: 'vikram@gitam.in', phone: '9876543216', branch: 'EEE', cgpa: 8.1, graduationYear: 2026, skills: ['MATLAB', 'Power Systems'] },
  { name: 'Meera Nair', rollNo: 'VU21IT0008', email: 'meera@gitam.in', phone: '9876543217', branch: 'IT', cgpa: 9.4, graduationYear: 2026, skills: ['C++', 'DSA', 'AWS'] },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  await Promise.all([Company.deleteMany(), Job.deleteMany(), Student.deleteMany(), Application.deleteMany()]);
  await Application.syncIndexes();

  const c = await Company.insertMany(companies);
  const byName = Object.fromEntries(c.map((x) => [x.name, x._id]));

  const jobs = await Job.insertMany([
    { company: byName.TCS, title: 'Assistant System Engineer', location: 'Hyderabad', type: 'Full-time', salary: 3.6, openings: 50, minCgpa: 6.0, eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'], deadline: daysFromNow(14), description: 'Entry-level role in software development and support.' },
    { company: byName.Infosys, title: 'Systems Engineer', location: 'Mysuru', type: 'Full-time', salary: 4.5, openings: 30, minCgpa: 6.5, eligibleBranches: ['CSE', 'IT', 'ECE'], deadline: daysFromNow(10), description: 'Training at Mysuru campus followed by project allocation.' },
    { company: byName.Amazon, title: 'SDE Intern', location: 'Hyderabad', type: 'Internship', salary: 12, openings: 5, minCgpa: 8.0, eligibleBranches: ['CSE', 'IT'], deadline: daysFromNow(7), description: '6-month internship with PPO opportunity.' },
    { company: byName.Amazon, title: 'Software Development Engineer I', location: 'Bengaluru', type: 'Full-time', salary: 32, openings: 3, minCgpa: 8.5, eligibleBranches: ['CSE', 'IT'], deadline: daysFromNow(5), description: 'Build large-scale distributed systems.' },
    { company: byName.Deloitte, title: 'Analyst - Technology Consulting', location: 'Mumbai', type: 'Full-time', salary: 7.6, openings: 10, minCgpa: 7.0, eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE'], deadline: daysFromNow(20), description: 'Consulting role across technology projects.' },
    { company: byName['L&T'], title: 'Graduate Engineer Trainee', location: 'Chennai', type: 'Full-time', salary: 5.5, openings: 15, minCgpa: 7.0, eligibleBranches: ['MECH', 'CIVIL', 'EEE'], deadline: daysFromNow(12), description: 'Site and design engineering roles.' },
    { company: byName.Qualcomm, title: 'Hardware Engineer', location: 'Hyderabad', type: 'Full-time', salary: 18, openings: 4, minCgpa: 8.0, eligibleBranches: ['ECE', 'EEE'], deadline: daysFromNow(9), description: 'Chip design and verification.' },
    { company: byName.TCS, title: 'Digital Engineer', location: 'Pune', type: 'Full-time', salary: 7, openings: 20, minCgpa: 7.5, eligibleBranches: ['CSE', 'IT', 'ECE'], deadline: daysFromNow(-3), description: 'Higher package track for digital roles (closed).' },
  ]);

  const s = await Student.insertMany(students);
  const st = Object.fromEntries(s.map((x) => [x.name.split(' ')[0], x._id]));
  const jb = Object.fromEntries(jobs.map((x) => [x.title, x._id]));

  await Application.insertMany([
    { student: st.Aarav, job: jb['SDE Intern'], status: 'Interview' },
    { student: st.Aarav, job: jb['Software Development Engineer I'], status: 'Shortlisted' },
    { student: st.Priya, job: jb['Systems Engineer'], status: 'Selected', remarks: 'Offer letter issued' },
    { student: st.Priya, job: jb['Analyst - Technology Consulting'], status: 'Applied' },
    { student: st.Rahul, job: jb['Assistant System Engineer'], status: 'Selected' },
    { student: st.Sneha, job: jb['Hardware Engineer'], status: 'Interview' },
    { student: st.Karthik, job: jb['Graduate Engineer Trainee'], status: 'Shortlisted' },
    { student: st.Ananya, job: jb['Assistant System Engineer'], status: 'Applied' },
    { student: st.Vikram, job: jb['Graduate Engineer Trainee'], status: 'Rejected', remarks: 'Did not clear technical round' },
    { student: st.Meera, job: jb['SDE Intern'], status: 'Selected', remarks: 'PPO track' },
  ]);

  console.log(`Seeded ${c.length} companies, ${jobs.length} jobs, ${s.length} students, 10 applications`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
