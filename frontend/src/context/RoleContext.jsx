import { createContext, useContext, useEffect, useState } from 'react';
import { studentApi } from '../services/api';

// Simple role switch (no login): Admin (placement cell) or a selected Student
const RoleContext = createContext(null);

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => read('role', 'admin'));
  const [studentId, setStudentId] = useState(() => read('studentId', ''));
  const [students, setStudents] = useState([]);

  const refreshStudents = () =>
    studentApi
      .list()
      .then((res) => {
        setStudents(res.data);
        // Keep the selected student valid
        if (!res.data.some((s) => s._id === studentId)) setStudentId(res.data[0]?._id || '');
      })
      .catch(() => setStudents([]));

  useEffect(() => {
    refreshStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('role', role);
      localStorage.setItem('studentId', studentId);
    } catch {
      /* storage unavailable */
    }
  }, [role, studentId]);

  const currentStudent = students.find((s) => s._id === studentId) || null;

  return (
    <RoleContext.Provider
      value={{ role, setRole, isAdmin: role === 'admin', studentId, setStudentId, currentStudent, students, refreshStudents }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
