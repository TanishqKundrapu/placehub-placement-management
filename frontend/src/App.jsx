import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { useRole } from './context/RoleContext';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyForm from './pages/CompanyForm';
import CompanyDetails from './pages/CompanyDetails';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import JobForm from './pages/JobForm';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import StudentProfile from './pages/StudentProfile';
import Applications from './pages/Applications';
import NotFound from './pages/NotFound';

// Pages only the placement cell (admin) can open
function AdminOnly({ children }) {
  const { isAdmin } = useRole();
  return isAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/companies" element={<AdminOnly><Companies /></AdminOnly>} />
            <Route path="/companies/new" element={<AdminOnly><CompanyForm /></AdminOnly>} />
            <Route path="/companies/:id/edit" element={<AdminOnly><CompanyForm /></AdminOnly>} />
            <Route path="/companies/:id" element={<CompanyDetails />} />

            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<AdminOnly><JobForm /></AdminOnly>} />
            <Route path="/jobs/:id/edit" element={<AdminOnly><JobForm /></AdminOnly>} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            <Route path="/students" element={<AdminOnly><Students /></AdminOnly>} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/:id/edit" element={<StudentForm />} />
            <Route path="/students/:id" element={<StudentProfile />} />

            <Route path="/applications" element={<Applications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <footer className="footer">PlaceHub · GITAM Training &amp; Placement Cell · React · Express · MongoDB</footer>
      </main>
    </div>
  );
}
