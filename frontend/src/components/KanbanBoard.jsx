import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { STATUSES } from '../services/api';

const hints = {
  Applied: 'New applications',
  Shortlisted: 'Cleared screening',
  Interview: 'In interview rounds',
  Selected: 'Offer made',
  Rejected: 'Closed',
};

// Hiring pipeline board: drag a candidate to another column (or use the menu on the card) to change status
export default function KanbanBoard({ applications, onMove }) {
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null);

  // The card id travels in the drag data (required by Firefox, and independent of React re-renders)
  const drop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId;
    const app = applications.find((a) => a._id === id);
    if (app && app.status !== status) onMove(app._id, status);
    setDragId(null);
    setOver(null);
  };

  return (
    <div className="board" role="list">
      {STATUSES.map((status) => {
        const items = applications.filter((a) => a.status === status);
        return (
          <section
            key={status}
            className={`lane lane-${status.toLowerCase()} ${over === status ? 'is-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status);
            }}
            onDragLeave={() => setOver((o) => (o === status ? null : o))}
            onDrop={(e) => drop(e, status)}
            aria-label={`${status}: ${items.length}`}
          >
            <header className="lane-head">
              <span className="status-dot" />
              <strong>{status}</strong>
              <span className="lane-count">{items.length}</span>
              <span className="lane-hint">{hints[status]}</span>
            </header>
            <div className="lane-body">
              {items.length === 0 && <div className="lane-empty">Drop a candidate here</div>}
              {items.map((a) => (
                <article
                  key={a._id}
                  className={`kcard ${dragId === a._id ? 'is-dragging' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', a._id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDragId(a._id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOver(null);
                  }}
                >
                  <div className="kcard-top">
                    <Avatar name={a.student?.name} size={32} />
                    <div className="kcard-who">
                      <Link to={`/students/${a.student?._id}`}>{a.student?.name}</Link>
                      <span className="mono">{a.student?.branch} · CGPA {a.student?.cgpa}</span>
                    </div>
                  </div>
                  <Link to={`/jobs/${a.job?._id}`} className="kcard-job">
                    <span>{a.job?.title}</span>
                    <span className="muted">{a.job?.company?.name} · ₹{a.job?.salary} LPA</span>
                  </Link>
                  <label className="kcard-move">
                    <span className="sr-only">Move {a.student?.name} to</span>
                    <select value={a.status} onChange={(e) => onMove(a._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s === a.status ? `In ${s}` : `Move to ${s}`}</option>)}
                    </select>
                  </label>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
