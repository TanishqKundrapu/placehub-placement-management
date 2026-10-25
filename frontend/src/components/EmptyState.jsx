export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">∅</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
