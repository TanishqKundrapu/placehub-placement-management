export const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const isOpen = (deadline) => new Date(deadline) >= new Date();

// Mirrors the backend eligibility rules so the UI can explain them before applying
export const checkEligibility = (job, student) => {
  const reasons = [];
  if (!isOpen(job.deadline)) reasons.push('Deadline has passed');
  if (!job.eligibleBranches.includes(student.branch)) reasons.push(`${student.branch} branch is not eligible`);
  if (student.cgpa < job.minCgpa) reasons.push(`Requires CGPA ${job.minCgpa}, you have ${student.cgpa}`);
  return { ok: reasons.length === 0, reasons };
};

// yyyy-mm-dd for <input type="date">
export const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

// Whole days until a deadline (negative once it has passed)
export const daysLeft = (deadline) => Math.ceil((new Date(deadline) - new Date()) / 86400000);

export const deadlineText = (deadline) => {
  const d = daysLeft(deadline);
  if (d < 0) return 'Closed';
  if (d === 0) return 'Closes today';
  if (d === 1) return 'Closes tomorrow';
  return `Closes in ${d} days`;
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
