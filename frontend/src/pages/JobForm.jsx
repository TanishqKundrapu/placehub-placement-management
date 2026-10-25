import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BRANCHES, companyApi, jobApi, JOB_TYPES } from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { toDateInput } from '../utils';

const empty = {
  company: '',
  title: '',
  location: '',
  type: 'Full-time',
  salary: '',
  openings: 1,
  minCgpa: 0,
  eligibleBranches: [],
  deadline: '',
  description: '',
};

const validate = (f, isEdit) => {
  const e = {};
  if (!f.company) e.company = 'Select a company';
  if (!f.title.trim()) e.title = 'Job title is required';
  if (!f.location.trim()) e.location = 'Location is required';
  if (f.salary === '' || Number(f.salary) <= 0) e.salary = 'Enter a package greater than 0';
  if (!Number.isInteger(Number(f.openings)) || Number(f.openings) < 1) e.openings = 'At least 1 opening';
  if (f.minCgpa === '' || Number(f.minCgpa) < 0 || Number(f.minCgpa) > 10) e.minCgpa = 'CGPA must be between 0 and 10';
  if (f.eligibleBranches.length === 0) e.eligibleBranches = 'Select at least one branch';
  if (!f.deadline) e.deadline = 'Deadline is required';
  else if (!isEdit && new Date(f.deadline) < new Date(new Date().toDateString())) e.deadline = 'Deadline cannot be in the past';
  return e;
};

export default function JobForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ ...empty, company: params.get('company') || '' });
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loads = [companyApi.list().then((res) => setCompanies(res.data))];
    if (isEdit) {
      loads.push(
        jobApi.get(id).then(({ data }) =>
          setForm({ ...Object.fromEntries(Object.keys(empty).map((k) => [k, data[k] ?? empty[k]])), company: data.company?._id, deadline: toDateInput(data.deadline) })
        )
      );
    }
    Promise.all(loads)
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const toggleBranch = (b) => {
    const list = form.eligibleBranches.includes(b) ? form.eligibleBranches.filter((x) => x !== b) : [...form.eligibleBranches, b];
    setForm({ ...form, eligibleBranches: list });
    setErrors({ ...errors, eligibleBranches: undefined });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form, isEdit);
    setErrors(v);
    if (Object.keys(v).length) return;

    const body = { ...form, salary: Number(form.salary), openings: Number(form.openings), minCgpa: Number(form.minCgpa) };
    setSaving(true);
    setServerError('');
    try {
      const res = isEdit ? await jobApi.update(id, body) : await jobApi.create(body);
      toast(res.message);
      navigate(`/jobs/${res.data._id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader eyebrow="Campus drives" title={isEdit ? 'Edit job' : 'Post a job'} subtitle="Students only see Apply when they meet the branch, CGPA and deadline rules you set here." />
      <form className="card form" onSubmit={onSubmit} noValidate>
        <ErrorMessage message={serverError} />
        <div className="form-grid">
          <FormField
            label="Company"
            name="company"
            as="select"
            value={form.company}
            onChange={onChange}
            error={errors.company}
            options={companies.map((c) => ({ value: c._id, label: c.name }))}
          />
          <FormField label="Job title" name="title" value={form.title} onChange={onChange} error={errors.title} />
          <FormField label="Location" name="location" value={form.location} onChange={onChange} error={errors.location} />
          <FormField label="Job type" name="type" as="select" value={form.type} onChange={onChange} options={JOB_TYPES} />
          <FormField label="Package (LPA)" name="salary" type="number" step="0.1" min="0" value={form.salary} onChange={onChange} error={errors.salary} hint="Stipend in LPA for internships" />
          <FormField label="Openings" name="openings" type="number" min="1" value={form.openings} onChange={onChange} error={errors.openings} />
          <FormField label="Minimum CGPA" name="minCgpa" type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={onChange} error={errors.minCgpa} />
          <FormField label="Application deadline" name="deadline" type="date" value={form.deadline} onChange={onChange} error={errors.deadline} />
        </div>

        <fieldset className="field">
          <legend>Eligible branches</legend>
          <div className="check-group">
            {BRANCHES.map((b) => (
              <label key={b} className={`check-pill ${form.eligibleBranches.includes(b) ? 'checked' : ''}`}>
                <input type="checkbox" checked={form.eligibleBranches.includes(b)} onChange={() => toggleBranch(b)} />
                {b}
              </label>
            ))}
          </div>
          {errors.eligibleBranches && <small className="field-error">{errors.eligibleBranches}</small>}
        </fieldset>

        <FormField label="Job description" name="description" as="textarea" value={form.description} onChange={onChange} />
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </form>
    </>
  );
}
