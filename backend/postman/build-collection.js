// Generates PlacementAPI.postman_collection.json: `node postman/build-collection.js`
const fs = require('fs');
const path = require('path');

const test = (code, extra = '') => [
  `pm.test('Status code is ${code}', () => pm.response.to.have.status(${code}));`,
  `pm.test('Response has success flag', () => pm.expect(pm.response.json()).to.have.property('success'));`,
  ...(extra ? [extra] : []),
];
const save = (varName) => `if (pm.response.code === 201) pm.collectionVariables.set('${varName}', pm.response.json().data._id);`;

const req = (name, method, url, { body, code = 200, extra } = {}) => ({
  name,
  event: [{ listen: 'test', script: { type: 'text/javascript', exec: test(code, extra) } }],
  request: {
    method,
    header: body ? [{ key: 'Content-Type', value: 'application/json' }] : [],
    ...(body && { body: { mode: 'raw', raw: JSON.stringify(body, null, 2) } }),
    url: { raw: `{{baseUrl}}${url}`, host: ['{{baseUrl}}'], path: url.split('?')[0].split('/').filter(Boolean), ...(url.includes('?') && { query: url.split('?')[1].split('&').map((q) => ({ key: q.split('=')[0], value: q.split('=')[1] })) }) },
  },
});

const future = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const past = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);

const collection = {
  info: {
    name: 'Placement Management API',
    description: 'REST API tests for the College Placement Management System. Run the folders in order (Run collection) — later requests use ids saved by earlier ones.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000/api' },
    { key: 'companyId', value: '' },
    { key: 'jobId', value: '' },
    { key: 'closedJobId', value: '' },
    { key: 'studentId', value: '' },
    { key: 'lowCgpaStudentId', value: '' },
    { key: 'applicationId', value: '' },
  ],
  item: [
    {
      name: '1. Companies',
      item: [
        req('Create company', 'POST', '/companies', { code: 201, extra: save('companyId'), body: { name: 'Postman Tech', industry: 'Software', location: 'Visakhapatnam', website: 'https://postman.example.com', email: 'hr@postman.example.com', description: 'Created from Postman' } }),
        req('Create company - validation error', 'POST', '/companies', { code: 400, body: { name: '', website: 'not-a-url' } }),
        req('Create company - duplicate name', 'POST', '/companies', { code: 409, body: { name: 'Postman Tech', industry: 'Software', location: 'Vizag' } }),
        req('Get all companies', 'GET', '/companies'),
        req('Search companies', 'GET', '/companies?search=tech'),
        req('Get company by id', 'GET', '/companies/{{companyId}}'),
        req('Update company', 'PUT', '/companies/{{companyId}}', { body: { location: 'Hyderabad' } }),
        req('Get company - invalid id', 'GET', '/companies/123', { code: 400 }),
        req('Get company - not found', 'GET', '/companies/64b000000000000000000000', { code: 404 }),
      ],
    },
    {
      name: '2. Jobs',
      item: [
        req('Create job', 'POST', '/jobs', { code: 201, extra: save('jobId'), body: { company: '{{companyId}}', title: 'Full Stack Developer', location: 'Hyderabad', type: 'Full-time', salary: 9.5, openings: 5, minCgpa: 7.5, eligibleBranches: ['CSE', 'IT'], deadline: future, description: 'MERN stack role' } }),
        req('Create closed job (past deadline)', 'POST', '/jobs', { code: 201, extra: save('closedJobId'), body: { company: '{{companyId}}', title: 'Closed Drive', location: 'Pune', salary: 5, eligibleBranches: ['CSE'], deadline: past } }),
        req('Create job - validation error', 'POST', '/jobs', { code: 400, body: { title: 'No company', salary: -1, eligibleBranches: [] } }),
        req('Get all jobs', 'GET', '/jobs'),
        req('Search / filter jobs', 'GET', '/jobs?search=developer&branch=CSE&minSalary=5&status=open'),
        req('Get job by id', 'GET', '/jobs/{{jobId}}'),
        req('Update job', 'PUT', '/jobs/{{jobId}}', { body: { salary: 10, openings: 6 } }),
      ],
    },
    {
      name: '3. Students',
      item: [
        req('Register student', 'POST', '/students', { code: 201, extra: save('studentId'), body: { name: 'Postman Student', rollNo: 'VU21CSE9001', email: 'pm.student@gitam.in', phone: '9123456780', branch: 'CSE', cgpa: 8.2, graduationYear: 2026, skills: 'React, Node.js, MongoDB' } }),
        req('Register low CGPA student', 'POST', '/students', { code: 201, extra: save('lowCgpaStudentId'), body: { name: 'Second Student', rollNo: 'VU21CSE9002', email: 'pm.second@gitam.in', phone: '9123456781', branch: 'CSE', cgpa: 6.5, graduationYear: 2026 } }),
        req('Register student - validation error', 'POST', '/students', { code: 400, body: { name: 'X', email: 'bad-email', phone: '12345', branch: 'ABC', cgpa: 12 } }),
        req('Register student - duplicate roll no', 'POST', '/students', { code: 409, body: { name: 'Dup', rollNo: 'VU21CSE9001', email: 'dup@gitam.in', phone: '9123456782', branch: 'CSE', cgpa: 8, graduationYear: 2026 } }),
        req('Get all students', 'GET', '/students'),
        req('Search students', 'GET', '/students?search=postman&branch=CSE&minCgpa=8'),
        req('Get student by id', 'GET', '/students/{{studentId}}'),
        req('Update student', 'PUT', '/students/{{studentId}}', { body: { cgpa: 8.6, phone: '9123456789' } }),
      ],
    },
    {
      name: '4. Applications',
      item: [
        req('Apply for job', 'POST', '/applications', { code: 201, extra: save('applicationId'), body: { student: '{{studentId}}', job: '{{jobId}}' } }),
        req('Apply again - duplicate (409)', 'POST', '/applications', { code: 409, body: { student: '{{studentId}}', job: '{{jobId}}' } }),
        req('Apply - CGPA too low (403)', 'POST', '/applications', { code: 403, body: { student: '{{lowCgpaStudentId}}', job: '{{jobId}}' } }),
        req('Apply - deadline passed (400)', 'POST', '/applications', { code: 400, body: { student: '{{studentId}}', job: '{{closedJobId}}' } }),
        req('Apply - missing fields (400)', 'POST', '/applications', { code: 400, body: {} }),
        req('Get all applications', 'GET', '/applications'),
        req('Filter applications by status', 'GET', '/applications?status=Applied'),
        req('Get applications of a student', 'GET', '/applications?student={{studentId}}'),
        req('Get application by id', 'GET', '/applications/{{applicationId}}'),
        req('Update status to Shortlisted', 'PUT', '/applications/{{applicationId}}', { body: { status: 'Shortlisted', remarks: 'Cleared aptitude test' } }),
        req('Update status - invalid value (400)', 'PUT', '/applications/{{applicationId}}', { code: 400, body: { status: 'Hired' } }),
      ],
    },
    {
      name: '5. Dashboard',
      item: [req('Get dashboard stats', 'GET', '/stats'), req('Unknown route (404)', 'GET', '/unknown', { code: 404 })],
    },
    {
      name: '6. Cleanup (DELETE)',
      item: [
        req('Withdraw application', 'DELETE', '/applications/{{applicationId}}'),
        req('Delete job', 'DELETE', '/jobs/{{jobId}}'),
        req('Delete student', 'DELETE', '/students/{{studentId}}'),
        req('Delete low CGPA student', 'DELETE', '/students/{{lowCgpaStudentId}}'),
        req('Delete company (cascades jobs)', 'DELETE', '/companies/{{companyId}}'),
        req('Delete company again - not found', 'DELETE', '/companies/{{companyId}}', { code: 404 }),
      ],
    },
  ],
};

fs.writeFileSync(path.join(__dirname, 'PlacementAPI.postman_collection.json'), JSON.stringify(collection, null, 2));
console.log('Postman collection written');
