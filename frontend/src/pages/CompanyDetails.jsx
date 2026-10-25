import { Link, useParams } from 'react-router-dom';
import { companyApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import PageHeader from '../components/PageHeader';
import JobCard from '../components/JobCard';
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
      <PageHeader
        title={c.name}
        subtitle={`${c.industry} · ${c.location}`}
        actions={
          isAdmin && (
            <>
              <Link to={`/companies/${c._id}/edit`} className="btn btn-ghost">Edit</Link>
              <Link to={`/jobs/new?company=${c._id}`} className="btn btn-primary">+ Post Job</Link>
            </>
          )
        }
      />
      <div className="card detail-card">
        {c.description && <p>{c.description}</p>}
        <dl className="details">
          <div><dt>Website</dt><dd>{c.website ? <a href={c.website} target="_blank" rel="noreferrer">{c.website}</a> : '-'}</dd></div>
          <div><dt>HR Email</dt><dd>{c.email || '-'}</dd></div>
          <div><dt>Jobs posted</dt><dd>{c.jobs.length}</dd></div>
        </dl>
      </div>

      <div className="section-head">
        <h2>Jobs at {c.name}</h2>
      </div>
      {c.jobs.length === 0 ? (
        <EmptyState title="No jobs posted yet" />
      ) : (
        <div className="card-grid">
          {c.jobs.map((j) => (
            <JobCard key={j._id} job={{ ...j, company: { name: c.name } }} student={isAdmin ? null : currentStudent} />
          ))}
        </div>
      )}
    </>
  );
}
