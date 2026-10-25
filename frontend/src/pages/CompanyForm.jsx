import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { companyApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const empty = { name: '', industry: '', location: '', website: '', email: '', description: '' };

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = 'Company name is required';
  if (!f.industry.trim()) e.industry = 'Industry is required';
  if (!f.location.trim()) e.location = 'Location is required';
  if (f.website && !/^https?:\/\//.test(f.website)) e.website = 'Must start with http:// or https://';
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email';
  return e;
};

export default function CompanyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    companyApi
      .get(id)
      .then((res) => setForm(Object.fromEntries(Object.keys(empty).map((k) => [k, res.data[k] ?? '']))))
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setServerError('');
    try {
      const res = isEdit ? await companyApi.update(id, form) : await companyApi.create(form);
      toast(res.message);
      navigate(`/companies/${res.data._id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Company' : 'Add Company'} subtitle="Recruiter details" />
      <form className="card form" onSubmit={onSubmit} noValidate>
        <ErrorMessage message={serverError} />
        <div className="form-grid">
          <FormField label="Company name" name="name" value={form.name} onChange={onChange} error={errors.name} />
          <FormField label="Industry" name="industry" value={form.industry} onChange={onChange} error={errors.industry} placeholder="e.g. IT Services" />
          <FormField label="Location" name="location" value={form.location} onChange={onChange} error={errors.location} />
          <FormField label="Website" name="website" value={form.website} onChange={onChange} error={errors.website} placeholder="https://" />
          <FormField label="HR email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        </div>
        <FormField label="Description" name="description" as="textarea" value={form.description} onChange={onChange} />
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Company' : 'Add Company'}
          </button>
        </div>
      </form>
    </>
  );
}
