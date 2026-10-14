import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { loadMeetings } from '../services/storage.js';
import MeetingCard from '../components/MeetingCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

const features = [
  ['📋', 'AI Meeting Summaries', 'Paste your notes and get a short, clear overview in seconds.'],
  ['✅', 'Key Decisions', 'See what was actually decided — nothing made up.'],
  ['🎯', 'Action Items', 'Who does what, with a checkbox to track progress.'],
  ['📅', 'Deadline Tracking', 'Every date mentioned, gathered in one place.'],
];

export default function Home() {
  const recent = useMemo(() => loadMeetings().slice(0, 3), []);
  return (
    <>
      <section className="hero">
        <h1>Turn Meetings into <em>Meaningful Action.</em></h1>
        <p className="lead">
          MeetMind AI reads your meeting notes and gives you a friendly, organized summary — so everyone knows what was decided and what happens next.
        </p>
        <Link className="btn big" to="/summarize">Summarize a Meeting →</Link>
      </section>

      <section aria-labelledby="f-title">
        <h2 id="f-title" className="sr-only">Features</h2>
        <div className="grid4">
          {features.map(([icon, t, d]) => (
            <div className="card feature" key={t}>
              <div className="feature-icon" aria-hidden="true">{icon}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="row between">
          <h2>Recent meetings</h2>
          {recent.length > 0 && <Link to="/history">See all</Link>}
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No meetings yet" text="Your saved summaries will show up here." actionLabel="Summarize your first meeting" to="/summarize" />
        ) : (
          <div className="grid3">{recent.map((m) => <MeetingCard key={m.id} meeting={m} />)}</div>
        )}
      </section>
    </>
  );
}
