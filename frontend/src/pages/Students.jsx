import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRANCHES, studentApi } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
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
        eyebrow="Candidates"
        title="Students"
        subtitle="Students registered for this placement season."
        actions={<Link to="/students/new" className="btn btn-primary"><Icon name="plus" size={16} /> Register student</Link>}
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, roll number, e-mail or skill"
        filters={filterDefs}
        filterValues={filters}
        onFilterChange={(name, value) => setFilters((f) => ({ ...f, [name]: value || undefined }))}
      />
      <ErrorMessage message={error} onRetry={reload} />

      {loading && !data ? (
        <Loader />
      ) : data?.length === 0 ? (
        <EmptyState icon="users" title="No students found" message="Try another search or clear the filters." />
      ) : (
        <div className="panel panel-flush table-wrap">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Contact</th><th>Skills</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {data?.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="cell-person">
                      <Avatar name={s.name} size={34} />
                      <div>
                        <Link to={`/students/${s._id}`} className="strong-link">{s.name}</Link>
                        <span className="mono small muted">{s.rollNo}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="branch">{s.branch}</span></td>
                  <td>
                    <div className="cgpa-cell">
                      <span className="mono">{s.cgpa.toFixed(1)}</span>
                      <span className="cgpa-bar"><span style={{ width: `${s.cgpa * 10}%` }} /></span>
                    </div>
                  </td>
                  <td className="small"><div>{s.email}</div><div className="mono muted">{s.phone}</div></td>
                  <td><div className="skill-row">{s.skills.slice(0, 3).map((k) => <span key={k} className="skill">{k}</span>)}</div></td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/students/${s._id}/edit`} className="icon-btn" aria-label={`Edit ${s.name}`}><Icon name="edit" size={16} /></Link>
                      <button className="icon-btn icon-btn-danger" aria-label={`Delete ${s.name}`} onClick={() => setToDelete(s)}><Icon name="trash" size={16} /></button>
                    </div>
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
