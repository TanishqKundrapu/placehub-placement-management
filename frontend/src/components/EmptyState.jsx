import Icon from './Icon';

export default function EmptyState({ title = 'Nothing here yet', message, action, icon = 'layers' }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
