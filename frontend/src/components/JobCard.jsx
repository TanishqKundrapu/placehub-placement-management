import { Link } from 'react-router-dom';
import { checkEligibility, formatDate, isOpen } from '../utils';

export default function JobCard({ job, student, applied }) {
  const open = isOpen(job.deadline);
  const eligibility = student ? checkEligibility(job, student) : null;

  return (
    <Link to={`/jobs/${job._id}`} className="card job-card">
      <div className="job-card-top">
        <div className="company-avatar" aria-hidden="true">
          {job.company?.name?.[0] || '?'}
        </div>
        <div className="job-card-title">
          <h3>{job.title}</h3>
          <span className="muted">{job.company?.name || 'Unknown company'}</span>
        </div>
        <span className={`badge ${open ? 'badge-open' : 'badge-closed'}`}>{open ? 'Open' : 'Closed'}</span>
      </div>

      <div className="job-meta">
        <span>₹ {job.salary} LPA</span>
        <span>{job.type}</span>
        <span>{job.location}</span>
      </div>

      <div className="chips">
        {job.eligibleBranches.map((b) => (
          <span key={b} className="chip">
            {b}
          </span>
        ))}
        {job.minCgpa > 0 && <span className="chip chip-outline">CGPA ≥ {job.minCgpa}</span>}
      </div>

      <div className="job-card-foot">
        <span className="muted small">Apply by {formatDate(job.deadline)}</span>
        {applied ? (
          <span className="badge status-applied">Applied</span>
        ) : eligibility ? (
          <span className={`badge ${eligibility.ok ? 'badge-open' : 'badge-closed'}`}>{eligibility.ok ? 'Eligible' : 'Not eligible'}</span>
        ) : (
          <span className="muted small">{job.applicantCount ?? 0} applicants</span>
        )}
      </div>
    </Link>
  );
}
