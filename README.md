# PlaceHub: College Placement Management System

A full-stack web app for a college placement cell. Admins manage recruiting companies, post jobs with eligibility rules and move applicants through the hiring pipeline. Students browse jobs, see if they're eligible, apply and track their status.

**Stack:** React.js + React Router (Vite) · Node.js + Express.js · MongoDB (Mongoose) · Axios · Postman

---

## How to run

**Prerequisites:** Node.js 18+ and MongoDB, either running locally on `mongodb://127.0.0.1:27017` or on Atlas (set `MONGO_URI` in `backend/.env`).

```bash
# 1. Backend  (terminal 1)
cd backend
npm install
npm run seed      # loads sample companies, jobs, students and applications
npm run dev       # API on http://localhost:5000

# 2. Frontend (terminal 2)
cd frontend
npm install
npm run dev       # UI on http://localhost:5173
```

Use the **Admin / Student** switch in the navbar to change roles. In Student mode, pick which student you are from the dropdown.

---

## Features

**Admin (placement cell)**
- Dashboard: totals, number of students placed, placement rate, highest package, an applications-by-status chart and recent activity
- Companies: add, edit, delete and search. Deleting a company also deletes its jobs and their applications
- Jobs: post and edit jobs with package, openings, minimum CGPA, eligible branches and a deadline. Search and filter by branch, type, salary or open/closed
- Students: register, edit, delete, and search by name, roll no or skill. Filter by branch or CGPA
- Applications: a Kanban board – drag a candidate between **Applied → Shortlisted → Interview → Selected / Rejected** – plus a filterable list view
- Dashboard funnel showing how far every application has progressed

**Student**
- A personal dashboard with "Jobs you can apply for", filtered to the student's branch and CGPA
- Every job card shows whether the student is **Eligible** or **Not eligible**. The job page explains why
- Apply, track status, and withdraw an application while it's still "Applied"
- Profile page with application history and placement status

**Business rules (checked on the server)**

| Rule | HTTP response |
|---|---|
| Student's branch must be in the job's eligible branches | `403 Forbidden` |
| Student's CGPA must be ≥ the job's minimum CGPA | `403 Forbidden` |
| Can't apply after the deadline | `400 Bad Request` |
| Can't apply to the same job twice (also a unique index) | `409 Conflict` |
| Duplicate roll no / email / company name | `409 Conflict` |
| Invalid fields / malformed id / malformed JSON | `400 Bad Request` |
| Record or route doesn't exist | `404 Not Found` |

---

## REST API

Base URL: `http://localhost:5000/api`

| Module | Method & endpoint | Description |
|---|---|---|
| Companies | `GET /companies?search=` | List and search companies (with job count) |
| | `GET /companies/:id` | Company with its jobs |
| | `POST /companies` · `PUT /companies/:id` · `DELETE /companies/:id` | Create / update / delete (cascades) |
| Jobs | `GET /jobs?search=&branch=&type=&minSalary=&status=open\|closed&company=` | Search and filter jobs |
| | `GET /jobs/:id` | Job details with applicant count |
| | `POST /jobs` · `PUT /jobs/:id` · `DELETE /jobs/:id` | Create / update / delete |
| Students | `GET /students?search=&branch=&minCgpa=` | Search and filter students |
| | `GET /students/:id` | Student profile with application history |
| | `POST /students` · `PUT /students/:id` · `DELETE /students/:id` | Register / update / delete |
| Applications | `GET /applications?status=&student=&job=` | Filter applications |
| | `GET /applications/:id` | Single application |
| | `POST /applications` | Apply (eligibility checks run here) |
| | `PUT /applications/:id` | Update status / remarks |
| | `DELETE /applications/:id` | Withdraw |
| Dashboard | `GET /stats` | Dashboard numbers |

### Postman
Import `backend/postman/PlacementAPI.postman_collection.json` and click **Run collection**. Its 43 requests cover every endpoint, both success and error cases, and each request has test assertions. The requests save the ids they create into collection variables, so run them in order.

---

## MongoDB collections

| Collection | Fields |
|---|---|
| `companies` | name (unique), industry, location, website, email, description |
| `jobs` | company → companies, title, description, location, type, salary (LPA), openings, minCgpa, eligibleBranches[], deadline |
| `students` | name, rollNo (unique), email (unique), phone, branch, cgpa, graduationYear, skills[] |
| `applications` | student → students, job → jobs, status, remarks · unique index on (student, job) |

---

## Folder structure

```
placement-management/
├── backend/
│   ├── controllers/   companyController, jobController, studentController, applicationController, statsController
│   ├── middleware/    validate.js (request validation), errorHandler.js (404 + central errors), logger.js
│   ├── models/        Company, Job, Student, Application
│   ├── routes/        companyRoutes, jobRoutes, studentRoutes, applicationRoutes, statsRoutes
│   ├── postman/       Postman collection (+ generator script)
│   ├── seed.js        sample data
│   └── server.js
└── frontend/
    └── src/
        ├── components/  Sidebar, KanbanBoard, PipelineFunnel, JobCard, CgpaRing, Avatar, Icon, StatCard, StatusBadge, SearchBar,
        │                FormField, ConfirmModal, PageHeader, Loader, EmptyState, ErrorMessage
        ├── pages/       Dashboard, Companies, CompanyDetails, CompanyForm, Jobs, JobDetails, JobForm, Students, StudentForm, StudentProfile, Applications, NotFound
        ├── context/     RoleContext (admin/student switch), ToastContext (notifications)
        ├── hooks/       useFetch
        ├── services/    api.js (Axios)
        ├── App.jsx
        └── main.jsx
```

---

## Assignment requirement checklist

| Requirement | Where it's met |
|---|---|
| 5–8 reusable React components | 16 components in `src/components` |
| 4–5 pages with React Router | 12 pages / 15 routes, including an admin-only route guard and a 404 page |
| 2–3 forms with validation | Company, Job and Student forms, each with client-side validation and server error display |
| GET, POST, PUT, DELETE | All four on every main resource |
| Separate Express route files | `backend/routes/*Routes.js` |
| Middleware | `express.json`, `cors`, request logger, validation middleware, ObjectId check, 404 handler, central error handler |
| 2–4 MongoDB collections | 4 collections with references and a unique compound index |
| Full CRUD on the main entity | Companies, jobs, students and applications |
| Search / filter | Jobs (text, branch, type, salary, open/closed), students (text, branch, CGPA), companies (text), applications (status, text) |
| Fetch / Axios | Axios instance with an error interceptor (`services/api.js`) |
| Postman testing | 43-request collection with assertions |
| Proper status codes and messages | 200 / 201 / 400 / 403 / 404 / 409 / 500 with JSON `{ success, message }` |
| Responsive UI | Responsive grid layout and collapsible mobile navbar |
