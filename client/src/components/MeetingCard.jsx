import { Link } from 'react-router-dom';

export default function MeetingCard({ meeting, onDelete }) {
  const done = meeting.actionItems.filter((a) => a.done).length;
  return (
    <article className="card meeting">
      <Link to={`/history/${meeting.id}`} className="meeting-link">
        <h3>{meeting.title}</h3>
        <time dateTime={meeting.createdAt}>{new Date(meeting.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</time>
        <p>{meeting.summary.length > 140 ? meeting.summary.slice(0, 140) + '…' : meeting.summary}</p>
        <span className="pill">{meeting.actionItems.length ? `${done}/${meeting.actionItems.length} tasks done` : 'No action items'}</span>
      </Link>
      {onDelete && (
        <button className="btn ghost small" onClick={() => onDelete(meeting)} aria-label={`Delete ${meeting.title}`}>Delete</button>
      )}
    </article>
  );
}
