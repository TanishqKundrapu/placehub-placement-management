import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRANCHES, studentApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

const filterDefs = [
  { name: 'branch', label: 'All branches', options: BRANCHES.map((b) => ({ value: b, label: b })) },
  { name: 'minCgpa', label: 'Any CGPA', options: [6, 7, 8, 9].map((c) => ({ value: c, label: `CGPA ${c}+` })) },
];

export default function Students() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const toast = useToast();
  const { refreshStudents } = useRole();
  const { data, loading, error, reload } = useFetch(() => studentApi.list({ search, ...filters }), [search, JSON.stringify(filters)]);

  const confirmDelete = async () => {
    try {
      const res = await studentApi.remove(toDelete._id);
      toast(res.message);
      reload();
      refreshStudents();
    } catch (err) {
      toast(err.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Registered candidates for placements"
        actions={<Link to="/students/new" className="btn btn-primary">+ Register Student</Link>}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, roll no, email or skill"
        filters={filterDefs}
        filterValues={filters}
        onFilterChange={(name, value) => setFilters((f) => ({ ...f, [name]: value || undefined }))}
      />
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : data?.length === 0 ? (
        <EmptyState title="No students found" />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th><th>Name</th><th>Branch</th><th>CGPA</th><th>Email</th><th>Phone</th><th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data?.map((s) => (
                <tr key={s._id}>
                  <td className="mono">{s.rollNo}</td>
                  <td><Link to={`/students/${s._id}`} className="link">{s.name}</Link></td>
                  <td><span className="chip">{s.branch}</span></td>
                  <td>{s.cgpa}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td className="row-actions">
                    <Link to={`/students/${s._id}/edit`} className="btn btn-sm btn-ghost">Edit</Link>
                    <button className="btn btn-sm btn-danger-ghost" onClick={() => setToDelete(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title={`Delete ${toDelete?.name}?`}
        message="Their applications will also be deleted."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
