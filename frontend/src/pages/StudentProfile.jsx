import { Link, useParams } from 'react-router-dom';
import { studentApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import CgpaRing from '../components/CgpaRing';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils';

export default function StudentProfile() {
  const { id } = useParams();
  const { isAdmin } = useRole();
  const { data: s, loading, error, reload } = useFetch(() => studentApi.get(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const offers = s.applications.filter((a) => a.status === 'Selected');
  const best = offers.reduce((m, o) => (o.job?.salary > (m?.job?.salary || 0) ? o : m), null);

  return (
    <>
      {isAdmin && <Link to="/students" className="back"><Icon name="arrowLeft" size={15} /> All students</Link>}

      <section className="profile">
        <div className="profile-id">
          <Avatar name={s.name} size={76} />
          <div>
            <span className="eyebrow">{s.branch} · Class of {s.graduationYear}</span>
            <h1>{s.name}</h1>
            <div className="job-hero-meta">
              <span className="mono">{s.rollNo}</span>
              <span><Icon name="mail" size={15} /> {s.email}</span>
              <span><Icon name="phone" size={15} /> {s.phone}</span>
            </div>
            <div className="skill-row">{s.skills.length ? s.skills.map((k) => <span key={k} className="skill">{k}</span>) : <span className="muted small">No skills added</span>}</div>
          </div>
        </div>
        <div className="profile-side">
          <CgpaRing value={s.cgpa} />
          <div className={`placed ${offers.length ? 'is-placed' : ''}`}>
            <span>Placement status</span>
            <strong>{offers.length ? 'Placed' : 'Not placed yet'}</strong>
            {best && <em>{best.job?.company?.name} · ₹{best.job?.salary} LPA</em>}
          </div>
          <Link to={`/students/${s._id}/edit`} className="btn btn-ghost btn-sm"><Icon name="edit" size={14} /> Edit profile</Link>
        </div>
      </section>

      <section className="panel panel-flush">
        <div className="panel-head padded">
          <h2>Applications <span className="count">{s.applications.length}</span></h2>
        </div>
        {s.applications.length === 0 ? (
          <p className="muted padded">No applications yet. <Link to="/jobs" className="link">Browse jobs</Link></p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Job</th><th>Package</th><th>Applied on</th><th>Status</th></tr>
              </thead>
              <tbody>
                {s.applications.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="cell-person">
                        <Avatar name={a.job?.company?.name} size={32} square />
                        <div>
                          {a.job ? <Link to={`/jobs/${a.job._id}`} className="strong-link">{a.job.title}</Link> : 'Deleted job'}
                          <span className="small muted">{a.job?.company?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="mono">{a.job && `₹${a.job.salary} LPA`}</td>
                    <td className="mono small">{formatDate(a.createdAt)}</td>
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
