import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '📝', title, text, actionLabel, to }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && <Link className="btn" to={to}>{actionLabel}</Link>}
    </div>
  );
}
