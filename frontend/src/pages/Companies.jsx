import { useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

export default function Companies() {
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => companyApi.list({ search }), [search]);

  const confirmDelete = async () => {
    try {
      const res = await companyApi.remove(toDelete._id);
      toast(res.message);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle="Recruiters visiting campus this season"
        actions={<Link to="/companies/new" className="btn btn-primary">+ Add Company</Link>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, industry or location" />
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : data?.length === 0 ? (
        <EmptyState title="No companies found" message={search ? 'Try a different search.' : 'Add the first recruiter.'} />
      ) : (
        <div className="card-grid">
          {data?.map((c) => (
            <div key={c._id} className="card company-card">
              <div className="job-card-top">
                <div className="company-avatar">{c.name[0]}</div>
                <div className="job-card-title">
                  <h3>
                    <Link to={`/companies/${c._id}`}>{c.name}</Link>
                  </h3>
                  <span className="muted">{c.industry}</span>
                </div>
              </div>
              <div className="job-meta">
                <span>{c.location}</span>
                <span>{c.jobCount} job(s)</span>
              </div>
              {c.description && <p className="muted small clamp">{c.description}</p>}
              <div className="card-actions">
                <Link to={`/companies/${c._id}`} className="btn btn-sm btn-ghost">View</Link>
                <Link to={`/companies/${c._id}/edit`} className="btn btn-sm btn-ghost">Edit</Link>
                <button className="btn btn-sm btn-danger-ghost" onClick={() => setToDelete(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title={`Delete ${toDelete?.name}?`}
        message="All jobs posted by this company and their applications will also be deleted."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
