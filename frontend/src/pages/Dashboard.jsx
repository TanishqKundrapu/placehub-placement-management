import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { applicationApi, getStats, jobApi, STATUSES } from '../services/api';
import useFetch from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { checkEligibility, formatDate } from '../utils';

export default function Dashboard() {
  const { isAdmin } = useRole();
  return isAdmin ? <AdminDashboard /> : <StudentDashboard />;
}

function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(getStats);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const max = Math.max(1, ...Object.values(data.statusCounts));

  return (
    <>
      <PageHeader
        title="Placement Dashboard"
        subtitle="Overview of the current placement season"
        actions={
          <>
            <Link to="/companies/new" className="btn btn-ghost">+ Company</Link>
            <Link to="/jobs/new" className="btn btn-primary">+ Post Job</Link>
          </>
        }
      />

      <div className="stat-grid">
        <StatCard label="Companies" value={data.companies} tone="indigo" />
        <StatCard label="Jobs posted" value={data.jobs} hint={`${data.openJobs} open now`} tone="cyan" />
        <StatCard label="Students" value={data.students} tone="amber" />
        <StatCard label="Applications" value={data.applications} tone="violet" />
        <StatCard label="Students placed" value={data.placed} hint={`${data.placementRate}% placement rate`} tone="green" />
        <StatCard
          label="Highest package"
          value={data.topPackage ? `₹${data.topPackage.salary} LPA` : '-'}
          hint={data.topPackage ? `${data.topPackage.company} · ${data.topPackage.title}` : ''}
          tone="rose"
        />
      </div>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Applications by status</h2>
          <div className="bars">
            {STATUSES.map((s) => (
              <Link to={`/applications?status=${s}`} key={s} className="bar-row">
                <span className="bar-label">{s}</span>
                <span className="bar-track">
                  <span className={`bar-fill fill-${s.toLowerCase()}`} style={{ width: `${(data.statusCounts[s] / max) * 100}%` }} />
                </span>
                <span className="bar-value">{data.statusCounts[s]}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Recent activity</h2>
          {data.recent.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <ul className="activity">
              {data.recent.map((a) => (
                <li key={a._id}>
                  <div>
                    <strong>{a.student?.name}</strong>
                    <span className="muted"> · {a.job?.title} at {a.job?.company?.name}</span>
                    <div className="muted small">Updated {formatDate(a.updatedAt)}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
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
        title="No student selected"
        message="Register a student profile to start applying for jobs."
        action={<Link to="/students/new" className="btn btn-primary">Register</Link>}
      />
    );
  }
  if (jobs.loading || apps.loading) return <Loader />;

  const appliedIds = new Set((apps.data || []).map((a) => a.job?._id));
  const eligible = (jobs.data || []).filter((j) => checkEligibility(j, student).ok && !appliedIds.has(j._id));
  const count = (s) => (apps.data || []).filter((a) => a.status === s).length;

  return (
    <>
      <PageHeader title={`Hi, ${student.name.split(' ')[0]}`} subtitle={`${student.rollNo} · ${student.branch} · CGPA ${student.cgpa}`} />
      <ErrorMessage message={jobs.error || apps.error} />

      <div className="stat-grid">
        <StatCard label="Applied" value={apps.data?.length || 0} tone="indigo" />
        <StatCard label="Shortlisted / Interview" value={count('Shortlisted') + count('Interview')} tone="amber" />
        <StatCard label="Offers" value={count('Selected')} tone="green" />
        <StatCard label="Eligible open jobs" value={eligible.length} tone="cyan" />
      </div>

      <div className="section-head">
        <h2>Jobs you can apply for</h2>
        <Link to="/jobs" className="link">Browse all jobs →</Link>
      </div>
      {eligible.length === 0 ? (
        <EmptyState title="No new eligible jobs" message="You have applied to every open job you are eligible for." />
      ) : (
        <div className="card-grid">
          {eligible.slice(0, 6).map((j) => (
            <JobCard key={j._id} job={j} student={student} />
          ))}
        </div>
      )}
    </>
  );
}
