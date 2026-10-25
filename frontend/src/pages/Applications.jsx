import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applicationApi, STATUSES } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils';

export default function Applications() {
  const { isAdmin, studentId } = useRole();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const [toWithdraw, setToWithdraw] = useState(null);

  const { data, loading, error, reload } = useFetch(() => {
    if (!isAdmin && !studentId) return Promise.resolve({ data: [] });
    return applicationApi.list({ status: status || undefined, student: isAdmin ? undefined : studentId });
  }, [status, isAdmin, studentId]);

  // Client-side text filter over the loaded rows
  const q = search.trim().toLowerCase();
  const rows = (data || []).filter(
    (a) =>
      !q ||
      [a.student?.name, a.student?.rollNo, a.job?.title, a.job?.company?.name].some((v) => v?.toLowerCase().includes(q))
  );

  const updateStatus = async (id, next) => {
    try {
      const res = await applicationApi.update(id, { status: next });
      toast(res.message);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const withdraw = async () => {
    try {
      const res = await applicationApi.remove(toWithdraw._id);
      toast(res.message);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
    setToWithdraw(null);
  };

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Applications' : 'My Applications'}
        subtitle={isAdmin ? 'Move candidates through the hiring pipeline' : 'Track where each application stands'}
      />

      <div className="tabs" role="tablist">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} role="tab" aria-selected={status === s} className={status === s ? 'active' : ''} onClick={() => setParams(s ? { status: s } : {})}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <input type="search" className="input search-input" placeholder="Filter by student, roll no, job or company" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Filter applications" />
      </div>
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : rows.length === 0 ? (
        <EmptyState title="No applications" message={isAdmin ? 'Nothing matches this filter.' : 'Apply to a job to see it here.'} action={!isAdmin && <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                {isAdmin && <th>Student</th>}
                <th>Job</th><th>Company</th><th>Package</th><th>Applied</th><th>Status</th>
                {!isAdmin && <th aria-label="Actions" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a._id}>
                  {isAdmin && (
                    <td>
                      <Link to={`/students/${a.student?._id}`} className="link">{a.student?.name}</Link>
                      <div className="muted small">{a.student?.rollNo} · {a.student?.branch} · {a.student?.cgpa}</div>
                    </td>
                  )}
                  <td><Link to={`/jobs/${a.job?._id}`} className="link">{a.job?.title}</Link></td>
                  <td>{a.job?.company?.name}</td>
                  <td>₹{a.job?.salary} LPA</td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    {isAdmin ? (
                      <select className={`input input-sm status-select status-${a.status.toLowerCase()}`} value={a.status} onChange={(e) => updateStatus(a._id, e.target.value)} aria-label="Application status">
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <StatusBadge status={a.status} />
                    )}
                  </td>
                  {!isAdmin && (
                    <td className="row-actions">
                      {a.status === 'Applied' && (
                        <button className="btn btn-sm btn-danger-ghost" onClick={() => setToWithdraw(a)}>Withdraw</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toWithdraw}
        title="Withdraw application?"
        message={`Your application for ${toWithdraw?.job?.title} will be removed.`}
        confirmText="Withdraw"
        onConfirm={withdraw}
        onCancel={() => setToWithdraw(null)}
      />
    </>
  );
}
