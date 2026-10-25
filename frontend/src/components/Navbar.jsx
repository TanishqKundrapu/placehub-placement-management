import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const adminLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/companies', label: 'Companies' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/students', label: 'Students' },
  { to: '/applications', label: 'Applications' },
];

export default function Navbar() {
  const { role, setRole, isAdmin, students, studentId, setStudentId } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const studentLinks = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/jobs', label: 'Browse Jobs' },
    { to: '/applications', label: 'My Applications' },
    { to: studentId ? `/students/${studentId}` : '/students/new', label: 'My Profile' },
  ];
  const links = isAdmin ? adminLinks : studentLinks;

  const switchRole = (next) => {
    setRole(next);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">P</span>
          <span>
            PlaceHub <small>Placement Cell</small>
          </span>
        </NavLink>

        <button className="menu-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} end={l.end} onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}

          <div className="role-switch">
            <div className="segmented" role="group" aria-label="Switch role">
              <button className={role === 'admin' ? 'active' : ''} onClick={() => switchRole('admin')}>
                Admin
              </button>
              <button className={role === 'student' ? 'active' : ''} onClick={() => switchRole('student')}>
                Student
              </button>
            </div>
            {!isAdmin && (
              <select
                className="input input-sm"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  navigate('/');
                }}
                aria-label="Viewing as student"
              >
                {students.length === 0 && <option value="">No students</option>}
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
