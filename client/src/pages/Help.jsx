import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../services/api.js';

export default function Help() {
  const [status, setStatus] = useState({ state: 'checking' });
  useEffect(() => {
    checkHealth()
      .then((d) => setStatus({ state: 'ok', ai: d.aiConfigured }))
      .catch((e) => setStatus({ state: 'down', message: e.message }));
  }, []);

  return (
    <>
      <h1>Help &amp; settings</h1>
      <div className="stack">
        <section className="card section">
          <h2>How it works</h2>
          <ol>
            <li>Go to <Link to="/summarize">Summarize</Link> and paste your meeting notes.</li>
            <li>Press <strong>Generate Summary</strong> and wait a few seconds.</li>
            <li>Check off action items as they get done, then copy, download or save the summary.</li>
            <li>Find saved meetings any time in <Link to="/history">History</Link>.</li>
          </ol>
        </section>
        <section className="card section">
          <h2>Your data</h2>
          <p>Saved meetings are stored <strong>only in this browser</strong> (localStorage). There is no account and nothing is uploaded to a database. Clearing your browser data will remove them, so download anything important.</p>
          <p>Notes you summarize are sent to the MeetMind server, which passes them to Google Gemini. The API key stays on the server and is never sent to your browser.</p>
        </section>
        <section className="card section">
          <h2>Server status</h2>
          {status.state === 'checking' && <p className="muted">Checking…</p>}
          {status.state === 'ok' && (
            <p className="ok-text">✅ Server is running. {status.ai ? 'Gemini is configured.' : '⚠️ No Gemini API key found — add GEMINI_API_KEY to the .env file and restart the server.'}</p>
          )}
          {status.state === 'down' && <div className="alert" role="alert">{status.message}</div>}
        </section>
      </div>
    </>
  );
}
