import { Link, useParams } from 'react-router-dom';
import { companyApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import JobCard from '../components/JobCard';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function CompanyDetails() {
  const { id } = useParams();
  const { isAdmin, currentStudent } = useRole();
  const { data: c, loading, error, reload } = useFetch(() => companyApi.get(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  return (
    <>
      <Link to={isAdmin ? '/companies' : '/jobs'} className="back"><Icon name="arrowLeft" size={15} /> {isAdmin ? 'All companies' : 'Browse jobs'}</Link>
      <section className="job-hero">
        <div className="job-hero-main">
          <Avatar name={c.name} size={64} square />
          <div>
            <span className="job-hero-company">{c.industry}</span>
            <h1>{c.name}</h1>
            <div className="job-hero-meta">
              <span><Icon name="pin" size={15} /> {c.location}</span>
              {c.website && <a href={c.website} target="_blank" rel="noreferrer"><Icon name="globe" size={15} /> Website</a>}
              {c.email && <span><Icon name="mail" size={15} /> {c.email}</span>}
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="hero-buttons">
            <Link to={`/companies/${c._id}/edit`} className="btn btn-ghost"><Icon name="edit" size={15} /> Edit</Link>
            <Link to={`/jobs/new?company=${c._id}`} className="btn btn-primary"><Icon name="plus" size={15} /> Post job</Link>
          </div>
        )}
      </section>
      {c.description && <p className="lead">{c.description}</p>}

      <div className="section-head">
        <h2>Jobs at {c.name} <span className="count">{c.jobs.length}</span></h2>
      </div>
      {c.jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="No jobs posted yet" />
      ) : (
        <div className="ticket-grid">
          {c.jobs.map((j) => (
            <JobCard key={j._id} job={{ ...j, company: { name: c.name } }} student={isAdmin ? null : currentStudent} />
          ))}
        </div>
      )}
    </>
  );
}
