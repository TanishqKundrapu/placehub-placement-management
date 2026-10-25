import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import Icon, { BrandMark } from './Icon';
import Avatar from './Avatar';

const adminLinks = [
  { to: '/', label: 'Overview', icon: 'dashboard', end: true },
  { to: '/applications', label: 'Applications', icon: 'board' },
  { to: '/jobs', label: 'Job postings', icon: 'briefcase' },
  { to: '/companies', label: 'Companies', icon: 'building' },
  { to: '/students', label: 'Students', icon: 'users' },
];

// App shell navigation: fixed sidebar on desktop, slide-in drawer on small screens
export default function Sidebar() {
  const { role, setRole, isAdmin, students, studentId, setStudentId, currentStudent } = useRole();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const studentLinks = [
    { to: '/', label: 'My dashboard', icon: 'dashboard', end: true },
    { to: '/jobs', label: 'Browse jobs', icon: 'briefcase' },
    { to: '/applications', label: 'My applications', icon: 'board' },
    { to: studentId ? `/students/${studentId}` : '/students/new', label: 'My profile', icon: 'user' },
  ];
  const links = isAdmin ? adminLinks : studentLinks;

  const switchRole = (next) => {
    setRole(next);
    navigate('/');
  };

  return (
    <>
      <header className="topbar">
        <button className="icon-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Icon name="menu" size={22} />
        </button>
        <span className="brand-inline">
          <span className="brand-mark"><BrandMark size={18} /></span> PlaceHub
        </span>
      </header>

      <div className={`scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark"><BrandMark /></span>
          <span className="brand-text">
            PlaceHub
            <small>Training &amp; Placement Cell</small>
          </span>
        </NavLink>

        <div className="season">
          <span className="season-label">Placement season</span>
          <span className="season-year">2026 – 27</span>
          <span className="season-live"><span className="live-dot" /> Drives open</span>
        </div>

        <nav className="side-nav">
          <span className="side-heading">{isAdmin ? 'Placement cell' : 'Student'}</span>
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} end={l.end}>
              <Icon name={l.icon} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="viewer">
          <span className="side-heading">Viewing as</span>
          <div className="segmented" role="group" aria-label="Switch role">
            <button className={role === 'admin' ? 'active' : ''} onClick={() => switchRole('admin')}>Admin</button>
            <button className={role === 'student' ? 'active' : ''} onClick={() => switchRole('student')}>Student</button>
          </div>
          {isAdmin ? (
            <div className="viewer-card">
              <Avatar name="Placement Cell" size={36} square />
              <div>
                <strong>Placement Officer</strong>
                <span>GITAM · Visakhapatnam</span>
              </div>
            </div>
          ) : (
            <div className="viewer-card">
              <Avatar name={currentStudent?.name || '?'} size={36} />
              <div className="viewer-select">
                <select
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    navigate('/');
                  }}
                  aria-label="Choose student"
                >
                  {students.length === 0 && <option value="">No students yet</option>}
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <span className="mono">{currentStudent ? `${currentStudent.rollNo} · ${currentStudent.branch}` : 'Register to apply'}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
