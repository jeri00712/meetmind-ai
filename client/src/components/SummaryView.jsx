const Section = ({ icon, title, children }) => (
  <section className="card section">
    <h2><span aria-hidden="true">{icon}</span> {title}</h2>
    {children}
  </section>
);
const Bullets = ({ items }) =>
  items.length ? <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="muted">Not specified.</p>;

export default function SummaryView({ meeting, onToggle }) {
  return (
    <div className="stack">
      <Section icon="📋" title="Meeting Summary"><p>{meeting.summary}</p></Section>
      <Section icon="💬" title="Key Discussion Points"><Bullets items={meeting.discussionPoints} /></Section>
      <Section icon="✅" title="Key Decisions"><Bullets items={meeting.decisions} /></Section>
      <Section icon="🎯" title="Action Items">
        {meeting.actionItems.length === 0 ? (
          <p className="muted">Not specified.</p>
        ) : (
          <ul className="tasks">
            {meeting.actionItems.map((a, i) => (
              <li key={i} className={a.done ? 'done' : ''}>
                <label>
                  <input type="checkbox" checked={!!a.done} onChange={() => onToggle(i)} />
                  <span>
                    <strong>{a.task}</strong>
                    <small>Owner: {a.assignee} · Deadline: {a.deadline} · {a.done ? 'Completed' : 'Pending'}</small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section icon="📅" title="Deadlines">
        {meeting.deadlines.length === 0 ? (
          <p className="muted">Not specified.</p>
        ) : (
          <ul>{meeting.deadlines.map((d, i) => <li key={i}><strong>{d.date}</strong> — {d.item}</li>)}</ul>
        )}
      </Section>
    </div>
  );
}
