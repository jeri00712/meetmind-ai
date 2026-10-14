// Meeting history lives only in this browser (localStorage).
const KEY = 'meetmind.meetings.v1';

export function loadMeetings() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const getMeeting = (id) => loadMeetings().find((m) => m.id === id);

export function saveMeeting(meeting) {
  const list = loadMeetings();
  const saved = { ...meeting, id: meeting.id || crypto.randomUUID(), createdAt: meeting.createdAt || new Date().toISOString() };
  const next = [saved, ...list.filter((m) => m.id !== saved.id)];
  return write(next) ? saved : null;
}

export const deleteMeeting = (id) => write(loadMeetings().filter((m) => m.id !== id));

export function toggleActionItem(id, index) {
  const list = loadMeetings();
  const m = list.find((x) => x.id === id);
  if (!m || !m.actionItems[index]) return null;
  m.actionItems[index].done = !m.actionItems[index].done;
  write(list);
  return m;
}
