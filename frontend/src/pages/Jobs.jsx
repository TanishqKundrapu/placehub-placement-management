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
        title={isAdmin ? 'Job Postings' : 'Browse Jobs'}
        subtitle={isAdmin ? 'All drives and internships' : 'Find roles that match your branch and CGPA'}
        actions={isAdmin && <Link to="/jobs/new" className="btn btn-primary">+ Post Job</Link>}
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
        <EmptyState title="No jobs match" message="Try clearing some filters." />
      ) : (
        <>
          <p className="muted small result-count">{data?.length} job(s) found</p>
          <div className="card-grid">
            {data?.map((j) => (
              <JobCard key={j._id} job={j} student={isAdmin ? null : currentStudent} applied={appliedIds.has(j._id)} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
