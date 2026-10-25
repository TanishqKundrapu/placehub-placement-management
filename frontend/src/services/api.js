import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Turn server error responses into a readable message
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || (err.request ? 'Cannot reach the server. Is the backend running?' : err.message);
    return Promise.reject(new Error(message));
  }
);

const crud = (resource) => ({
  list: (params) => api.get(`/${resource}`, { params }),
  get: (id) => api.get(`/${resource}/${id}`),
  create: (body) => api.post(`/${resource}`, body),
  update: (id, body) => api.put(`/${resource}/${id}`, body),
  remove: (id) => api.delete(`/${resource}/${id}`),
});

export const companyApi = crud('companies');
export const jobApi = crud('jobs');
export const studentApi = crud('students');
export const applicationApi = crud('applications');
export const getStats = () => api.get('/stats');

export const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
export const JOB_TYPES = ['Full-time', 'Internship'];
export const STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
