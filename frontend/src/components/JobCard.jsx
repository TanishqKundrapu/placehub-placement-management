import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import Icon from './Icon';
import { checkEligibility, daysLeft, deadlineText, isOpen } from '../utils';

// Job shown as an "offer ticket": company stub on the left, role and package on the right
export default function JobCard({ job, student, applied }) {
  const open = isOpen(job.deadline);
  const eligibility = student ? checkEligibility(job, student) : null;
  const days = daysLeft(job.deadline);
  const urgency = !open ? 'closed' : days <= 3 ? 'urgent' : days <= 7 ? 'soon' : 'calm';
  // Deadline bar: fills up over the final 30 days
  const fill = open ? Math.max(6, Math.min(100, 100 - (days / 30) * 100)) : 100;

  let tag = null;
  if (applied) tag = <span className="tag tag-applied"><Icon name="check" size={13} /> Applied</span>;
  else if (eligibility) tag = eligibility.ok
    ? <span className="tag tag-ok"><Icon name="check" size={13} /> Eligible</span>
    : <span className="tag tag-no"><Icon name="x" size={13} /> Not eligible</span>;

  return (
    <Link to={`/jobs/${job._id}`} className={`ticket ${open ? '' : 'is-closed'}`}>
      <div className="ticket-stub">
        <Avatar name={job.company?.name || '?'} size={46} square />
        <span className="ticket-type">{job.type === 'Internship' ? 'Intern' : 'FTE'}</span>
      </div>
      <div className="ticket-body">
        <div className="ticket-head">
          <div className="ticket-title">
            <span className="ticket-company">{job.company?.name || 'Unknown company'}</span>
            <h3>{job.title}</h3>
          </div>
          <div className="ticket-pay">
            <strong>{job.salary}</strong>
            <span>LPA</span>
          </div>
        </div>

        <div className="ticket-meta">
          <span><Icon name="pin" size={14} /> {job.location}</span>
          <span><Icon name="users" size={14} /> {job.openings} opening{job.openings === 1 ? '' : 's'}</span>
          {job.minCgpa > 0 && <span className="mono">CGPA ≥ {job.minCgpa}</span>}
        </div>

        <div className="ticket-branches">
          {job.eligibleBranches.map((b) => (
            <span key={b} className={`branch ${student && student.branch === b ? 'branch-mine' : ''}`}>{b}</span>
          ))}
        </div>

        <div className="ticket-foot">
          <div className={`deadline deadline-${urgency}`}>
            <span className="deadline-text"><Icon name="clock" size={13} /> {deadlineText(job.deadline)}</span>
            <span className="deadline-bar"><span style={{ width: `${fill}%` }} /></span>
          </div>
          {tag || <span className="muted small">{job.applicantCount ?? 0} applicant{job.applicantCount === 1 ? '' : 's'}</span>}
        </div>
      </div>
    </Link>
  );
}
