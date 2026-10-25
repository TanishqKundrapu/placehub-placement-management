import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationApi, jobApi, STATUSES } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import { checkEligibility, formatDate, isOpen } from '../utils';

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
  const myApp = !isAdmin ? apps.data?.[0] : null;
  const eligibility = currentStudent ? checkEligibility(j, currentStudent) : null;

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
      <PageHeader
        title={j.title}
        subtitle={
          <>
            <Link to={`/companies/${j.company?._id}`} className="link">{j.company?.name}</Link> · {j.location}
          </>
        }
        actions={
          isAdmin && (
            <>
              <Link to={`/jobs/${id}/edit`} className="btn btn-ghost">Edit</Link>
              <button className="btn btn-danger-ghost" onClick={() => setConfirm(true)}>Delete</button>
            </>
          )
        }
      />

      <div className="grid-2 grid-wide-left">
        <section className="card detail-card">
          <dl className="details">
            <div><dt>Package</dt><dd>₹ {j.salary} LPA</dd></div>
            <div><dt>Type</dt><dd>{j.type}</dd></div>
            <div><dt>Openings</dt><dd>{j.openings}</dd></div>
            <div><dt>Min CGPA</dt><dd>{j.minCgpa}</dd></div>
            <div><dt>Deadline</dt><dd>{formatDate(j.deadline)} {!isOpen(j.deadline) && <span className="badge badge-closed">Closed</span>}</dd></div>
            <div><dt>Applicants</dt><dd>{j.applicantCount}</dd></div>
          </dl>
          <h3 className="sub">Eligible branches</h3>
          <div className="chips">
            {j.eligibleBranches.map((b) => <span key={b} className="chip">{b}</span>)}
          </div>
          {j.description && (
            <>
              <h3 className="sub">About the role</h3>
              <p>{j.description}</p>
            </>
          )}
        </section>

        {!isAdmin && (
          <aside className="card apply-card">
            <h2 className="card-title">Your application</h2>
            {!currentStudent ? (
              <p className="muted">Select or register a student to apply.</p>
            ) : myApp ? (
              <>
                <p>Applied on {formatDate(myApp.createdAt)}</p>
                <StatusBadge status={myApp.status} />
                {myApp.remarks && <p className="muted small">Remarks: {myApp.remarks}</p>}
                {myApp.status === 'Applied' && (
                  <button className="btn btn-danger-ghost btn-block" onClick={withdraw}>Withdraw application</button>
                )}
              </>
            ) : eligibility.ok ? (
              <>
                <p className="ok-text">✓ You are eligible for this role.</p>
                <button className="btn btn-primary btn-block" onClick={apply} disabled={busy}>
                  {busy ? 'Applying...' : 'Apply now'}
                </button>
              </>
            ) : (
              <>
                <p className="bad-text">You cannot apply:</p>
                <ul className="reasons">
                  {eligibility.reasons.map((r) => <li key={r}>{r}</li>)}
                </ul>
                {/* Lets the backend rule be demonstrated even when the UI already knows the answer */}
                <button className="btn btn-ghost btn-block" onClick={apply} disabled={busy}>Try applying anyway</button>
              </>
            )}
          </aside>
        )}
      </div>

      {isAdmin && (
        <section className="card">
          <h2 className="card-title">Applicants ({apps.data?.length || 0})</h2>
          <ErrorMessage message={apps.error} />
          {apps.data?.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Applied</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {apps.data?.map((a) => (
                    <tr key={a._id}>
                      <td><Link to={`/students/${a.student?._id}`} className="link">{a.student?.name}</Link><div className="muted small">{a.student?.rollNo}</div></td>
                      <td>{a.student?.branch}</td>
                      <td>{a.student?.cgpa}</td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        <select className={`input input-sm status-select status-${a.status.toLowerCase()}`} value={a.status} onChange={(e) => updateStatus(a._id, e.target.value)} aria-label="Application status">
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

      <ConfirmModal
        open={confirm}
        title="Delete this job?"
        message="All applications for this job will also be deleted."
        onConfirm={deleteJob}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
