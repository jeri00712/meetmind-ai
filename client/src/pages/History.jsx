import { useMemo, useState } from 'react';
import { loadMeetings, deleteMeeting } from '../services/storage.js';
import MeetingCard from '../components/MeetingCard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';

export default function History() {
  const [meetings, setMeetings] = useState(loadMeetings);
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const notify = useToast();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? meetings.filter((m) => `${m.title} ${m.summary}`.toLowerCase().includes(q)) : meetings;
  }, [meetings, query]);

  function confirmDelete() {
    deleteMeeting(toDelete.id);
    setMeetings(loadMeetings());
    setToDelete(null);
    notify('Meeting deleted.');
  }

  return (
    <>
      <h1>Meeting history</h1>
      <p className="lead">Saved on this device only.</p>
      {meetings.length === 0 ? (
        <EmptyState icon="🗂️" title="Nothing saved yet" text="Summarize a meeting and press “Save to history” to keep it here." actionLabel="Summarize a meeting" to="/summarize" />
      ) : (
        <>
          <input className="search" type="search" placeholder="Search by title or summary…" aria-label="Search meetings" value={query} onChange={(e) => setQuery(e.target.value)} />
          {shown.length === 0 ? (
            <p className="muted">No meetings match “{query}”.</p>
          ) : (
            <div className="grid3">{shown.map((m) => <MeetingCard key={m.id} meeting={m} onDelete={setToDelete} />)}</div>
          )}
        </>
      )}
      {toDelete && (
        <ConfirmDialog title="Delete this meeting?" message={`“${toDelete.title}” will be removed from this browser. This can't be undone.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}
