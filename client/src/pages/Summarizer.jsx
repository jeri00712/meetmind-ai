import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { summarizeMeeting } from '../services/api.js';
import { saveMeeting } from '../services/storage.js';
import { copyText, downloadText, formatSummary } from '../services/format.js';
import { useToast } from '../components/Toast.jsx';
import SummaryView from '../components/SummaryView.jsx';

const MAX = 20000;
const SAMPLE_TITLE = 'Website Launch Sync';
const SAMPLE_NOTES = `Attendees: Priya, Marcus, Dana.
We reviewed the status of the new website. Priya said the design is finished and only the contact page is left.
Marcus raised a concern about slow image loading on mobile. We agreed to compress all images before launch.
Decision: the launch date is moved to November 20.
Action: Marcus will compress the images by November 12.
Action: Dana will write the launch announcement email. No date was set.
Priya will share the final designs with the client on Friday.`;

export default function Summarizer() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const notify = useToast();
  const navigate = useNavigate();

  async function generate(e) {
    e.preventDefault();
    setError('');
    if (!notes.trim()) return setError('Please paste some meeting notes first.');
    if (notes.length > MAX) return setError(`Notes are too long (limit ${MAX.toLocaleString()} characters).`);
    setLoading(true);
    try {
      const data = await summarizeMeeting(title.trim(), notes);
      setResult({
        title: title.trim() || 'Untitled meeting',
        ...data,
        actionItems: data.actionItems.map((a) => ({ ...a, done: false })),
      });
      setSaved(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(i) {
    setResult((r) => ({ ...r, actionItems: r.actionItems.map((a, j) => (j === i ? { ...a, done: !a.done } : a)) }));
  }

  function save() {
    const s = saveMeeting({ ...result, id: saved?.id, createdAt: saved?.createdAt });
    if (!s) return notify('Could not save — your browser storage may be full or blocked.', 'error');
    setSaved(s);
    notify('Saved to your history.');
  }

  async function copy() {
    notify((await copyText(formatSummary(result))) ? 'Summary copied.' : 'Copy failed. Try the download button.', 'success');
  }

  function reset() {
    setResult(null); setSaved(null); setTitle(''); setNotes(''); setError('');
  }

  if (result) {
    return (
      <>
        <div className="row between wrap">
          <div>
            <p className="eyebrow">Your summary is ready</p>
            <h1>{result.title}</h1>
          </div>
          <div className="row wrap">
            <button className="btn ghost" onClick={copy}>Copy</button>
            <button className="btn ghost" onClick={() => downloadText(result.title, formatSummary(result))}>Download .txt</button>
            <button className="btn" onClick={save}>{saved ? 'Update saved copy' : 'Save to history'}</button>
            <button className="btn ghost" onClick={reset}>New summary</button>
          </div>
        </div>
        {saved && <p className="note">Saved. <button className="link" onClick={() => navigate(`/history/${saved.id}`)}>Open in history</button></p>}
        <SummaryView meeting={result} onToggle={toggle} />
      </>
    );
  }

  return (
    <>
      <h1>Summarize a meeting</h1>
      <p className="lead">Paste your notes below. We only use what's written there — missing details are marked "Not specified."</p>
      <form className="card form" onSubmit={generate} noValidate>
        <label htmlFor="title">Meeting title <span className="muted">(optional)</span></label>
        <input id="title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly project check-in" />

        <div className="row between">
          <label htmlFor="notes">Meeting notes</label>
          <button type="button" className="link" onClick={() => { setTitle(SAMPLE_TITLE); setNotes(SAMPLE_NOTES); setError(''); }}>Use sample notes</button>
        </div>
        <textarea id="notes" rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste or type your notes here…" aria-invalid={!!error} />
        <div className={`counter ${notes.length > MAX ? 'over' : ''}`}>{notes.length.toLocaleString()} / {MAX.toLocaleString()}</div>

        {error && <div className="alert" role="alert">{error}</div>}
        <button className="btn big" type="submit" disabled={loading}>
          {loading ? (<><span className="spinner" aria-hidden="true" /> Reading your notes…</>) : 'Generate Summary'}
        </button>
      </form>
    </>
  );
}
