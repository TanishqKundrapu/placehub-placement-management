import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationApi, jobApi, STATUSES } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import { deadlineText, formatDate, isOpen } from '../utils';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin, currentStudent, studentId } = useRole();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const job = useFetch(() => jobApi.get(id), [id]);
  const apps = useFetch(() => {
    if (isAdmin) return applicationApi.list({ job: id });
    return studentId ? applicationApi.list({ job: id, student: studentId }) : Promise.resolve({ data: [] });
  }, [id, isAdmin, studentId]);

  if (job.loading) return <Loader />;
  if (job.error) return <ErrorMessage message={job.error} onRetry={job.reload} />;

  const j = job.data;
  const open = isOpen(j.deadline);
  const myApp = !isAdmin ? apps.data?.[0] : null;
  const checks = currentStudent
    ? [
        { label: 'Applications open', detail: open ? deadlineText(j.deadline) : `Closed on ${formatDate(j.deadline)}`, ok: open },
        { label: 'Branch eligible', detail: `${currentStudent.branch} — accepted: ${j.eligibleBranches.join(', ')}`, ok: j.eligibleBranches.includes(currentStudent.branch) },
        { label: 'CGPA requirement', detail: `You have ${currentStudent.cgpa}, minimum is ${j.minCgpa}`, ok: currentStudent.cgpa >= j.minCgpa },
      ]
    : [];
  const eligible = checks.every((c) => c.ok);

  const apply = async () => {
    setBusy(true);
    try {
      const res = await applicationApi.create({ student: studentId, job: id });
      toast(res.message);
      apps.reload();
      job.reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    try {
      const res = await applicationApi.remove(myApp._id);
      toast(res.message);
      apps.reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      const res = await applicationApi.update(appId, { status });
      toast(res.message);
      apps.reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const deleteJob = async () => {
    try {
      const res = await jobApi.remove(id);
      toast(res.message);
      navigate('/jobs');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <Link to="/jobs" className="back"><Icon name="arrowLeft" size={15} /> All jobs</Link>

      <section className="job-hero">
        <div className="job-hero-main">
          <Avatar name={j.company?.name} size={64} square />
          <div>
            <Link to={`/companies/${j.company?._id}`} className="job-hero-company">{j.company?.name}</Link>
            <h1>{j.title}</h1>
            <div className="job-hero-meta">
              <span><Icon name="pin" size={15} /> {j.location}</span>
              <span><Icon name="briefcase" size={15} /> {j.type}</span>
              <span className={`pill ${open ? 'pill-open' : 'pill-closed'}`}>{open ? 'Accepting applications' : 'Closed'}</span>
            </div>
          </div>
        </div>
        <div className="job-hero-pay">
          <span>Package</span>
          <strong>₹{j.salary}<small>LPA</small></strong>
        </div>
      </section>

      <div className="facts">
        <div><span>Deadline</span><strong>{formatDate(j.deadline)}</strong><em>{deadlineText(j.deadline)}</em></div>
        <div><span>Openings</span><strong>{j.openings}</strong><em>positions</em></div>
        <div><span>Minimum CGPA</span><strong>{j.minCgpa}</strong><em>out of 10</em></div>
        <div><span>Applicants</span><strong>{j.applicantCount}</strong><em>so far</em></div>
      </div>

      <div className="split split-wide">
        <section className="panel">
          <h2>About the role</h2>
          <p>{j.description || 'No description provided.'}</p>
          <h3 className="sub">Eligible branches</h3>
          <div className="branch-row">
            {j.eligibleBranches.map((b) => <span key={b} className={`branch ${currentStudent?.branch === b && !isAdmin ? 'branch-mine' : ''}`}>{b}</span>)}
          </div>
          {isAdmin && (
            <div className="panel-actions">
              <Link to={`/jobs/${id}/edit`} className="btn btn-ghost"><Icon name="edit" size={15} /> Edit job</Link>
              <button className="btn btn-danger-ghost" onClick={() => setConfirm(true)}><Icon name="trash" size={15} /> Delete</button>
            </div>
          )}
        </section>

        {!isAdmin && (
          <aside className="panel apply-panel">
            <h2>Your eligibility</h2>
            {!currentStudent ? (
              <p className="muted">Choose a student under “Viewing as” to check eligibility.</p>
            ) : (
              <>
                <ul className="checklist">
                  {checks.map((c) => (
                    <li key={c.label} className={c.ok ? 'ok' : 'no'}>
                      <span className="check-icon"><Icon name={c.ok ? 'check' : 'x'} size={14} stroke={2.6} /></span>
                      <div><strong>{c.label}</strong><span>{c.detail}</span></div>
                    </li>
                  ))}
                </ul>
                {myApp ? (
                  <div className="applied-box">
                    <div><span className="muted small">Applied on {formatDate(myApp.createdAt)}</span><StatusBadge status={myApp.status} /></div>
                    {myApp.remarks && <p className="small muted">“{myApp.remarks}”</p>}
                    {myApp.status === 'Applied' && <button className="btn btn-quiet btn-block" onClick={withdraw}>Withdraw application</button>}
                  </div>
                ) : eligible ? (
                  <button className="btn btn-primary btn-block btn-lg" onClick={apply} disabled={busy}>
                    {busy ? 'Applying…' : <>Apply now <Icon name="arrowRight" size={16} /></>}
                  </button>
                ) : (
                  <>
                    <p className="small muted">You don’t meet every requirement for this drive.</p>
                    {/* Sends the request anyway, to show the server enforcing the same rules */}
                    <button className="btn btn-ghost btn-block" onClick={apply} disabled={busy}>Try applying anyway</button>
                  </>
                )}
              </>
            )}
          </aside>
        )}
      </div>

      {isAdmin && (
        <section className="panel panel-flush">
          <div className="panel-head padded">
            <h2>Applicants <span className="count">{apps.data?.length || 0}</span></h2>
          </div>
          <ErrorMessage message={apps.error} />
          {apps.data?.length === 0 ? (
            <p className="muted padded">No applications yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Applied</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {apps.data?.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <div className="cell-person">
                          <Avatar name={a.student?.name} size={32} />
                          <div>
                            <Link to={`/students/${a.student?._id}`} className="strong-link">{a.student?.name}</Link>
                            <span className="mono small muted">{a.student?.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="branch">{a.student?.branch}</span></td>
                      <td className="mono">{a.student?.cgpa}</td>
                      <td className="mono small">{formatDate(a.createdAt)}</td>
                      <td>
                        <select className={`status-select status-${a.status.toLowerCase()}`} value={a.status} onChange={(e) => updateStatus(a._id, e.target.value)} aria-label="Application status">
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ConfirmModal open={confirm} title="Delete this job?" message="All applications for this job will also be deleted." onConfirm={deleteJob} onCancel={() => setConfirm(false)} />
    </>
  );
}
