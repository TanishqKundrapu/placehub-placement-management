export default function StatusBadge({ status }) {
  return <span className={`badge status-${String(status).toLowerCase()}`}>{status}</span>;
}
