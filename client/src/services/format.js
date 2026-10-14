export function formatSummary(m) {
  const bullets = (arr) => (arr.length ? arr.map((x) => `- ${x}`).join('\n') : 'Not specified.');
  const actions = m.actionItems.length
    ? m.actionItems.map((a) => `- [${a.done ? 'x' : ' '}] ${a.task} (Owner: ${a.assignee}; Deadline: ${a.deadline})`).join('\n')
    : 'Not specified.';
  const deadlines = m.deadlines.length ? m.deadlines.map((d) => `- ${d.item}: ${d.date}`).join('\n') : 'Not specified.';
  return [
    `MEETING: ${m.title}`,
    m.createdAt ? `DATE: ${new Date(m.createdAt).toLocaleString()}` : '',
    '', 'SUMMARY', m.summary,
    '', 'KEY DISCUSSION POINTS', bullets(m.discussionPoints),
    '', 'KEY DECISIONS', bullets(m.decisions),
    '', 'ACTION ITEMS', actions,
    '', 'DEADLINES', deadlines,
  ].join('\n');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadText(title, text) {
  const name = (title || 'meeting-summary').replace(/[^\w\-]+/g, '-').toLowerCase();
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.txt` });
  a.click();
  URL.revokeObjectURL(url);
}
