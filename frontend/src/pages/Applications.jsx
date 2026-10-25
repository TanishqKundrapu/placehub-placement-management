import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applicationApi, STATUSES } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import KanbanBoard from '../components/KanbanBoard';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils';

const STEPS = ['Applied', 'Shortlisted', 'Interview', 'Selected'];

export default function Applications() {
  const { isAdmin, studentId } = useRole();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [view, setView] = useState(status ? 'list' : 'board');
  const [search, setSearch] = useState('');
  const [toWithdraw, setToWithdraw] = useState(null);

  const { data, setData, loading, error, reload } = useFetch(() => {
    if (!isAdmin && !studentId) return Promise.resolve({ data: [] });
    return applicationApi.list({ student: isAdmin ? undefined : studentId });
  }, [isAdmin, studentId]);

  const q = search.trim().toLowerCase();
  const rows = (data || []).filter(
    (a) =>
      (!status || a.status === status) &&
      (!q || [a.student?.name, a.student?.rollNo, a.job?.title, a.job?.company?.name].some((v) => v?.toLowerCase().includes(q)))
  );

  // Optimistic update: move the card immediately, roll back if the server refuses
  const move = async (id, next) => {
    const before = data;
    setData((d) => d.map((a) => (a._id === id ? { ...a, status: next } : a)));
    try {
      const res = await applicationApi.update(id, { status: next });
      toast(res.message);
    } catch (err) {
      setData(before);
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

  const counts = Object.fromEntries(STATUSES.map((s) => [s, (data || []).filter((a) => a.status === s).length]));

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Hiring pipeline' : 'Your applications'}
        title={isAdmin ? 'Applications' : 'My applications'}
        subtitle={isAdmin ? 'Drag a candidate to another column to change their status.' : 'Track where each application stands.'}
        actions={
          isAdmin && (
            <div className="segmented segmented-light" role="group" aria-label="View">
              <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}><Icon name="board" size={15} /> Board</button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Icon name="list" size={15} /> List</button>
            </div>
          )
        }
      />

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={17} />
          <input type="search" placeholder="Search by student, roll number, job or company" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search applications" />
        </label>
        {(view === 'list' || !isAdmin) && (
          <div className="chips-filter" role="tablist">
            {['', ...STATUSES].map((s) => (
              <button key={s || 'all'} role="tab" aria-selected={status === s} className={status === s ? 'active' : ''} onClick={() => setParams(s ? { status: s } : {})}>
                {s || 'All'} <span>{s ? counts[s] : (data || []).length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : isAdmin && view === 'board' ? (
        <KanbanBoard applications={rows} onMove={move} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="board"
          title="No applications here"
          message={isAdmin ? 'Nothing matches this filter.' : 'When you apply to a job it will appear here with its progress.'}
          action={!isAdmin && <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>}
        />
      ) : isAdmin ? (
        <div className="panel panel-flush table-wrap">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Job</th><th>Package</th><th>Applied</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="cell-person">
                      <Avatar name={a.student?.name} size={32} />
                      <div>
                        <Link to={`/students/${a.student?._id}`} className="strong-link">{a.student?.name}</Link>
                        <span className="mono small muted">{a.student?.rollNo} · {a.student?.branch} · {a.student?.cgpa}</span>
                      </div>
                    </div>
                  </td>
                  <td><Link to={`/jobs/${a.job?._id}`} className="strong-link">{a.job?.title}</Link><div className="small muted">{a.job?.company?.name}</div></td>
                  <td className="mono">₹{a.job?.salary} LPA</td>
                  <td className="mono small">{formatDate(a.createdAt)}</td>
                  <td>
                    <select className={`status-select status-${a.status.toLowerCase()}`} value={a.status} onChange={(e) => move(a._id, e.target.value)} aria-label="Application status">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="track-list">
          {rows.map((a) => {
            // An offer completes every step; otherwise the current status is the step in progress
            const reached = a.status === 'Selected' ? STEPS.length : STEPS.indexOf(a.status);
            return (
              <article key={a._id} className="track">
                <div className="track-head">
                  <Avatar name={a.job?.company?.name} size={42} square />
                  <div className="track-title">
                    <Link to={`/jobs/${a.job?._id}`}>{a.job?.title}</Link>
                    <span className="muted">{a.job?.company?.name} · ₹{a.job?.salary} LPA · applied {formatDate(a.createdAt)}</span>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.status === 'Rejected' ? (
                  <p className="track-closed">This application was closed{a.remarks ? `: ${a.remarks}` : '.'}</p>
                ) : (
                  <ol className="steps">
                    {STEPS.map((s, i) => (
                      <li key={s} className={i < reached ? 'done' : i === reached ? 'current' : ''}>
                        <span className="step-dot">{i < reached ? <Icon name="check" size={12} stroke={3} /> : null}</span>
                        {s === 'Selected' ? 'Offer' : s}
                      </li>
                    ))}
                  </ol>
                )}
                {a.status === 'Applied' && (
                  <button className="btn btn-quiet btn-sm" onClick={() => setToWithdraw(a)}>Withdraw application</button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!toWithdraw}
        title="Withdraw this application?"
        message={`Your application for ${toWithdraw?.job?.title} at ${toWithdraw?.job?.company?.name} will be removed.`}
        confirmText="Withdraw"
        onConfirm={withdraw}
        onCancel={() => setToWithdraw(null)}
      />
    </>
  );
}
