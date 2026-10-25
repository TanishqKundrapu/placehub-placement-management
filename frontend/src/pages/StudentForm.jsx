import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BRANCHES, studentApi } from '../services/api';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const empty = { name: '', rollNo: '', email: '', phone: '', branch: '', cgpa: '', graduationYear: new Date().getFullYear() + 1, skills: '' };

const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
  if (!/^[A-Za-z0-9]{5,15}$/.test(f.rollNo.trim())) e.rollNo = '5-15 letters/digits, e.g. VU21CSE0001';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email';
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
  if (!f.branch) e.branch = 'Select a branch';
  if (f.cgpa === '' || Number(f.cgpa) < 0 || Number(f.cgpa) > 10) e.cgpa = 'CGPA must be between 0 and 10';
  if (!/^\d{4}$/.test(String(f.graduationYear))) e.graduationYear = 'Enter a 4-digit year';
  return e;
};

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin, refreshStudents, setStudentId } = useRole();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    studentApi
      .get(id)
      .then(({ data }) =>
        setForm({ ...Object.fromEntries(Object.keys(empty).map((k) => [k, data[k] ?? ''])), skills: (data.skills || []).join(', ') })
      )
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

    const body = { ...form, cgpa: Number(form.cgpa), graduationYear: Number(form.graduationYear) };
    setSaving(true);
    setServerError('');
    try {
      const res = isEdit ? await studentApi.update(id, body) : await studentApi.create(body);
      toast(res.message);
      await refreshStudents();
      // A student registering themselves becomes the active student
      if (!isEdit && !isAdmin) setStudentId(res.data._id);
      navigate(`/students/${res.data._id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Student Profile' : 'Student Registration'} subtitle="Profile used for job eligibility" />
      <form className="card form" onSubmit={onSubmit} noValidate>
        <ErrorMessage message={serverError} />
        <div className="form-grid">
          <FormField label="Full name" name="name" value={form.name} onChange={onChange} error={errors.name} />
          <FormField label="Roll number" name="rollNo" value={form.rollNo} onChange={onChange} error={errors.rollNo} placeholder="VU21CSE0001" />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
          <FormField label="Phone" name="phone" type="tel" maxLength={10} value={form.phone} onChange={onChange} error={errors.phone} />
          <FormField label="Branch" name="branch" as="select" value={form.branch} onChange={onChange} error={errors.branch} options={BRANCHES} />
          <FormField label="CGPA" name="cgpa" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={onChange} error={errors.cgpa} />
          <FormField label="Graduation year" name="graduationYear" type="number" value={form.graduationYear} onChange={onChange} error={errors.graduationYear} />
          <FormField label="Skills" name="skills" value={form.skills} onChange={onChange} hint="Comma separated, e.g. React, Node.js, SQL" />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Profile' : 'Register'}
          </button>
        </div>
      </form>
    </>
  );
}
