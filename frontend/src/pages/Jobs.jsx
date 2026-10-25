import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi, BRANCHES, jobApi, JOB_TYPES } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';

const filterDefs = [
  { name: 'branch', label: 'All branches', options: BRANCHES.map((b) => ({ value: b, label: b })) },
  { name: 'type', label: 'All types', options: JOB_TYPES.map((t) => ({ value: t, label: t })) },
  {
    name: 'minSalary',
    label: 'Any salary',
    options: [3, 5, 10, 20].map((s) => ({ value: s, label: `₹${s}+ LPA` })),
  },
  {
    name: 'status',
    label: 'Open & closed',
    options: [
      { value: 'open', label: 'Open only' },
      { value: 'closed', label: 'Closed only' },
    ],
  },
];

export default function Jobs() {
  const { isAdmin, currentStudent, studentId } = useRole();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const { data, loading, error, reload } = useFetch(() => jobApi.list({ search, ...filters }), [search, JSON.stringify(filters)]);
  const myApps = useFetch(
    () => (!isAdmin && studentId ? applicationApi.list({ student: studentId }) : Promise.resolve({ data: [] })),
    [isAdmin, studentId]
  );
  const appliedIds = new Set((myApps.data || []).map((a) => a.job?._id));

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Campus drives' : 'Opportunities'}
        title={isAdmin ? 'Job postings' : 'Browse jobs'}
        subtitle={isAdmin ? 'Every full-time drive and internship this season, open drives first.' : 'Roles open to your branch are highlighted. Eligibility is checked before you apply.'}
        actions={isAdmin && <Link to="/jobs/new" className="btn btn-primary"><Icon name="plus" size={16} /> Post a job</Link>}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by job title, company or location"
        filters={filterDefs}
        filterValues={filters}
        onFilterChange={(name, value) => setFilters((f) => ({ ...f, [name]: value || undefined }))}
      />
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : data?.length === 0 ? (
        <EmptyState icon="briefcase" title="No jobs match these filters" message="Clear a filter or search for a different company." />
      ) : (
        <>
          <p className="result-count">{data?.length} job{data?.length === 1 ? '' : 's'}</p>
          <div className="ticket-grid">
            {data?.map((j) => (
              <JobCard key={j._id} job={j} student={isAdmin ? null : currentStudent} applied={appliedIds.has(j._id)} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
