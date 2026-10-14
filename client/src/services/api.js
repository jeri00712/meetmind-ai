// All backend calls go through here. In dev, Vite proxies /api to the Express server.
const BACKEND_DOWN = 'Cannot reach the MeetMind server. Make sure it is running (npm run server) and try again.';

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error(BACKEND_DOWN);
  }
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON response */ }
  if (!res.ok) throw new Error(data?.error || (res.status >= 500 ? BACKEND_DOWN : 'Something went wrong.'));
  return data;
}

export const checkHealth = () => request('/api/health');

export const summarizeMeeting = (title, notes) =>
  request('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, notes }),
  });
