import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getMeeting, toggleActionItem, deleteMeeting } from '../services/storage.js';
import { copyText, downloadText, formatSummary } from '../services/format.js';
import { useToast } from '../components/Toast.jsx';
import SummaryView from '../components/SummaryView.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function SummaryDetails() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(() => getMeeting(id));
  const [confirm, setConfirm] = useState(false);
  const notify = useToast();
  const navigate = useNavigate();

  if (!meeting) {
    return <EmptyState icon="🔍" title="Meeting not found" text="It may have been deleted, or it was saved in a different browser." actionLabel="Go to history" to="/history" />;
  }

  const toggle = (i) => setMeeting(toggleActionItem(id, i) || meeting);

  return (
    <>
      <Link to="/history" className="back">← All meetings</Link>
      <div className="row between wrap">
        <div>
          <h1>{meeting.title}</h1>
          <p className="muted">{new Date(meeting.createdAt).toLocaleString()}</p>
        </div>
        <div className="row wrap">
          <button className="btn ghost" onClick={async () => notify((await copyText(formatSummary(meeting))) ? 'Summary copied.' : 'Copy failed.', 'success')}>Copy</button>
          <button className="btn ghost" onClick={() => downloadText(meeting.title, formatSummary(meeting))}>Download .txt</button>
          <button className="btn danger ghost" onClick={() => setConfirm(true)}>Delete</button>
        </div>
      </div>
      <SummaryView meeting={meeting} onToggle={toggle} />
      {confirm && (
        <ConfirmDialog
          title="Delete this meeting?" message="It will be removed from this browser. This can't be undone."
          onCancel={() => setConfirm(false)}
          onConfirm={() => { deleteMeeting(id); notify('Meeting deleted.'); navigate('/history'); }}
        />
      )}
    </>
  );
}
