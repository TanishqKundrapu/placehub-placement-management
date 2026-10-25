import { useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
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
        eyebrow="Recruiters"
        title="Companies"
        subtitle="Organisations recruiting on campus this season."
        actions={<Link to="/companies/new" className="btn btn-primary"><Icon name="plus" size={16} /> Add company</Link>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, industry or location" />
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : data?.length === 0 ? (
        <EmptyState icon="building" title="No companies found" message={search ? 'Try a different search.' : 'Add the first recruiter to start posting jobs.'} />
      ) : (
        <div className="company-grid">
          {data?.map((c) => (
            <article key={c._id} className="company">
              <Link to={`/companies/${c._id}`} className="company-link">
                <Avatar name={c.name} size={52} square />
                <div className="company-name">
                  <h3>{c.name}</h3>
                  <span>{c.industry}</span>
                </div>
              </Link>
              {c.description && <p className="company-desc">{c.description}</p>}
              <div className="company-facts">
                <span><Icon name="pin" size={14} /> {c.location}</span>
                <span><Icon name="briefcase" size={14} /> {c.jobCount} job{c.jobCount === 1 ? '' : 's'}</span>
              </div>
              <div className="company-actions">
                <Link to={`/companies/${c._id}/edit`} className="icon-btn" aria-label={`Edit ${c.name}`}><Icon name="edit" size={16} /></Link>
                <button className="icon-btn icon-btn-danger" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)}><Icon name="trash" size={16} /></button>
              </div>
            </article>
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
