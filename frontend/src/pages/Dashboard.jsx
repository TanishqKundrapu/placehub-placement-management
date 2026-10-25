import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { applicationApi, getStats, jobApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import JobCard from '../components/JobCard';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import CgpaRing from '../components/CgpaRing';
import PipelineFunnel from '../components/PipelineFunnel';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { checkEligibility, deadlineText, formatDate, greeting } from '../utils';

export default function Dashboard() {
  const { isAdmin } = useRole();
  return isAdmin ? <AdminDashboard /> : <StudentDashboard />;
}

function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(getStats);
  const open = useFetch(() => jobApi.list({ status: 'open' }), []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const closing = (open.data || []).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow eyebrow-light">Placement season 2026 – 27</span>
          <h1>
            <span className="hero-figure">{data.placementRate}%</span> of students placed
          </h1>
          <p>
            {data.placed} of {data.students} registered students hold an offer. {data.openJobs} drive{data.openJobs === 1 ? ' is' : 's are'} open right now across {data.companies} recruiters.
          </p>
          <div className="hero-actions">
            <Link to="/jobs/new" className="btn btn-gold"><Icon name="plus" size={16} /> Post a job</Link>
            <Link to="/applications" className="btn btn-glass"><Icon name="board" size={16} /> Review applications</Link>
          </div>
        </div>
        {data.topPackage && (
          <div className="offer-card">
            <span className="offer-label"><Icon name="trophy" size={14} /> Highest offer this season</span>
            <div className="offer-amount">
              <span className="rupee">₹</span>{data.topPackage.salary}<span className="offer-unit">LPA</span>
            </div>
            <div className="offer-company">
              <Avatar name={data.topPackage.company} size={34} square />
              <div>
                <strong>{data.topPackage.company}</strong>
                <span>{data.topPackage.title}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="stat-row">
        <StatCard label="Recruiters" value={data.companies} icon="building" hint="Companies on campus" />
        <StatCard label="Open drives" value={data.openJobs} icon="briefcase" hint={`${data.jobs} posted in total`} />
        <StatCard label="Students" value={data.students} icon="users" hint="Registered for placements" />
        <StatCard label="Applications" value={data.applications} icon="board" hint="Across all drives" accent />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Hiring pipeline</h2>
            <p className="muted">How far every application has progressed this season</p>
          </div>
          <Link to="/applications" className="link">Open board <Icon name="arrowRight" size={15} /></Link>
        </div>
        <PipelineFunnel counts={data.statusCounts} />
      </section>

      <div className="split">
        <section className="panel">
          <div className="panel-head">
            <h2>Recent movement</h2>
          </div>
          {data.recent.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <ul className="feed">
              {data.recent.map((a) => (
                <li key={a._id}>
                  <Avatar name={a.student?.name} size={36} />
                  <div className="feed-text">
                    <strong>{a.student?.name}</strong>
                    <span>{a.job?.title} · {a.job?.company?.name}</span>
                  </div>
                  <div className="feed-side">
                    <StatusBadge status={a.status} />
                    <span className="mono small muted">{formatDate(a.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Closing soon</h2>
            <Link to="/jobs" className="link">All jobs <Icon name="arrowRight" size={15} /></Link>
          </div>
          <ul className="closing">
            {closing.map((j) => (
              <li key={j._id}>
                <Link to={`/jobs/${j._id}`}>
                  <Avatar name={j.company?.name} size={36} square />
                  <div className="feed-text">
                    <strong>{j.title}</strong>
                    <span>{j.company?.name} · ₹{j.salary} LPA</span>
                  </div>
                  <span className="closing-when">{deadlineText(j.deadline)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function StudentDashboard() {
  const { currentStudent: student, studentId } = useRole();
  const jobs = useFetch(() => jobApi.list({ status: 'open' }), []);
  const apps = useFetch(() => (studentId ? applicationApi.list({ student: studentId }) : Promise.resolve({ data: [] })), [studentId]);

  if (!student) {
    return (
      <EmptyState
        icon="user"
        title="Choose who you are"
        message="Pick your name under “Viewing as” in the sidebar, or register a new student profile to start applying."
        action={<Link to="/students/new" className="btn btn-primary">Register as a student</Link>}
      />
    );
  }
  if (jobs.loading || apps.loading) return <Loader />;

  const myApps = apps.data || [];
  const appliedIds = new Set(myApps.map((a) => a.job?._id));
  const eligible = (jobs.data || []).filter((j) => checkEligibility(j, student).ok && !appliedIds.has(j._id));
  const count = (...s) => myApps.filter((a) => s.includes(a.status)).length;
  const offers = myApps.filter((a) => a.status === 'Selected');

  return (
    <>
      <section className="hero hero-student">
        <div className="hero-copy">
          <span className="eyebrow eyebrow-light">{student.rollNo} · {student.branch} · Class of {student.graduationYear}</span>
          <h1>{greeting()}, {student.name.split(' ')[0]}</h1>
          <p>
            {eligible.length
              ? `${eligible.length} open drive${eligible.length === 1 ? ' matches' : 's match'} your branch and CGPA.`
              : 'You have applied to every open drive you are eligible for.'}{' '}
            {count('Shortlisted', 'Interview') ? `${count('Shortlisted', 'Interview')} application${count('Shortlisted', 'Interview') === 1 ? ' is' : 's are'} moving forward.` : ''}
          </p>
          <div className="hero-chips">
            <span><strong>{myApps.length}</strong> applied</span>
            <span><strong>{count('Shortlisted', 'Interview')}</strong> in progress</span>
            <span><strong>{offers.length}</strong> offer{offers.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div className="hero-ring">
          <CgpaRing value={student.cgpa} size={132} />
        </div>
      </section>

      <ErrorMessage message={jobs.error || apps.error} />

      {offers.length > 0 && (
        <div className="offer-banner">
          <Icon name="trophy" size={22} />
          <div>
            <strong>Congratulations! You have {offers.length === 1 ? 'an offer' : `${offers.length} offers`}</strong>
            <span>{offers.map((o) => `${o.job?.company?.name} · ${o.job?.title}`).join('  ·  ')}</span>
          </div>
        </div>
      )}

      <div className="section-head">
        <h2>Open roles that match you</h2>
        <Link to="/jobs" className="link">Browse all jobs <Icon name="arrowRight" size={15} /></Link>
      </div>
      {eligible.length === 0 ? (
        <EmptyState icon="check" title="You’re all caught up" message="New drives you are eligible for will appear here." />
      ) : (
        <div className="ticket-grid">
          {eligible.slice(0, 4).map((j) => (
            <JobCard key={j._id} job={j} student={student} />
          ))}
        </div>
      )}
    </>
  );
}
