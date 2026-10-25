import { Link, useParams } from 'react-router-dom';
import { studentApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils';

export default function StudentProfile() {
  const { id } = useParams();
  const { data: s, loading, error, reload } = useFetch(() => studentApi.get(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const offers = s.applications.filter((a) => a.status === 'Selected');

  return (
    <>
      <PageHeader
        title={s.name}
        subtitle={`${s.rollNo} · ${s.branch} · Class of ${s.graduationYear}`}
        actions={<Link to={`/students/${s._id}/edit`} className="btn btn-ghost">Edit Profile</Link>}
      />

      <div className="grid-2 grid-wide-left">
        <section className="card detail-card">
          <dl className="details">
            <div><dt>CGPA</dt><dd>{s.cgpa}</dd></div>
            <div><dt>Email</dt><dd>{s.email}</dd></div>
            <div><dt>Phone</dt><dd>{s.phone}</dd></div>
            <div><dt>Applications</dt><dd>{s.applications.length}</dd></div>
          </dl>
          <h3 className="sub">Skills</h3>
          <div className="chips">
            {s.skills.length ? s.skills.map((k) => <span key={k} className="chip">{k}</span>) : <span className="muted">No skills added</span>}
          </div>
        </section>
        <aside className={`card placed-card ${offers.length ? 'is-placed' : ''}`}>
          <span className="stat-label">Placement status</span>
          <span className="stat-value">{offers.length ? 'Placed' : 'Not placed yet'}</span>
          {offers.map((o) => (
            <span key={o._id} className="muted small">
              {o.job?.company?.name} · ₹{o.job?.salary} LPA
            </span>
          ))}
        </aside>
      </div>

      <section className="card">
        <h2 className="card-title">Application history</h2>
        {s.applications.length === 0 ? (
          <p className="muted">No applications yet. <Link to="/jobs" className="link">Browse jobs</Link></p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Job</th><th>Company</th><th>Package</th><th>Applied on</th><th>Status</th></tr>
              </thead>
              <tbody>
                {s.applications.map((a) => (
                  <tr key={a._id}>
                    <td>{a.job ? <Link to={`/jobs/${a.job._id}`} className="link">{a.job.title}</Link> : 'Deleted job'}</td>
                    <td>{a.job?.company?.name}</td>
                    <td>{a.job && `₹${a.job.salary} LPA`}</td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
