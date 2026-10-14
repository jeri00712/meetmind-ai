import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const {
  GEMINI_API_KEY,
  GEMINI_MODEL = 'gemini-3.5-flash',
  GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite',
  PORT = 5000,
  APP_ORIGIN = 'http://localhost:5173',
} = process.env;

const MAX_NOTES = 20000;
const NS = 'Not specified.';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const app = express();
app.use(cors({ origin: APP_ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '100kb' }));

const SYSTEM = `You turn raw meeting notes into a structured summary.
Rules:
- Use ONLY information present in the notes. Never invent decisions, names, tasks or deadlines.
- If something is missing, use exactly "Not specified."
- Decisions must be explicitly stated in the notes; otherwise return an empty list.
- Keep the summary concise (2-4 sentences). Write in the language of the notes.`;

const schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    discussionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { task: { type: Type.STRING }, assignee: { type: Type.STRING }, deadline: { type: Type.STRING } },
        required: ['task', 'assignee', 'deadline'],
      },
    },
    deadlines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { item: { type: Type.STRING }, date: { type: Type.STRING } },
        required: ['item', 'date'],
      },
    },
  },
  required: ['summary', 'discussionPoints', 'decisions', 'actionItems', 'deadlines'],
};

const str = (v, d = NS) => (typeof v === 'string' && v.trim() ? v.trim() : d);
const list = (v) => (Array.isArray(v) ? v.map((x) => str(x, '')).filter(Boolean) : []);
const normalize = (r = {}) => ({
  summary: str(r.summary),
  discussionPoints: list(r.discussionPoints),
  decisions: list(r.decisions),
  actionItems: (Array.isArray(r.actionItems) ? r.actionItems : [])
    .map((a) => ({ task: str(a?.task, ''), assignee: str(a?.assignee), deadline: str(a?.deadline) }))
    .filter((a) => a.task),
  deadlines: (Array.isArray(r.deadlines) ? r.deadlines : [])
    .map((d) => ({ item: str(d?.item, ''), date: str(d?.date) }))
    .filter((d) => d.item),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retries when Google says "high demand" (503), then tries the fallback model.
async function generateWithRetry(params) {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL].filter((m, i, a) => m && a.indexOf(m) === i);
  let lastErr;
  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (err) {
        lastErr = err;
        if (err?.status !== 503) break;
        await sleep(1000 * (attempt + 1));
      }
    }
    if (![503, 404].includes(lastErr?.status)) break;
  }
  throw lastErr;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', aiConfigured: Boolean(ai) }));

app.post('/api/summarize', async (req, res) => {
  const { title = '', notes } = req.body || {};
  if (typeof notes !== 'string' || !notes.trim())
    return res.status(400).json({ error: 'Please paste some meeting notes first.' });
  if (notes.length > MAX_NOTES)
    return res.status(400).json({ error: `Notes are too long. The limit is ${MAX_NOTES.toLocaleString()} characters.` });
  if (typeof title !== 'string' || title.length > 200)
    return res.status(400).json({ error: 'The meeting title must be under 200 characters.' });
  if (!ai)
    return res.status(503).json({ error: 'The server has no Gemini API key. Add GEMINI_API_KEY to the .env file and restart.' });

  try {
    const response = await generateWithRetry({
      contents: `Meeting title: ${title.trim() || NS}\n\nMeeting notes:\n${notes.trim()}`,
      config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', responseSchema: schema, temperature: 0.2 },
    });
    res.json(normalize(JSON.parse(response.text)));
  } catch (err) {
    console.error('Gemini error:', err?.status || '', err?.message || err);
    if (err?.status === 503) return res.status(503).json({ error: 'Google\'s AI is very busy right now. Please try again in a minute.' });
    if (err?.status === 429) return res.status(429).json({ error: 'The AI service is busy or the quota is used up. Try again in a minute.' });
    if (err?.status === 404)
      return res.status(502).json({ error: `The AI model "${GEMINI_MODEL}" is not available any more. Set GEMINI_MODEL in .env to a current model (for example gemini-3.5-flash) and restart the server.` });
    if (err?.status === 400 || err?.status === 403)
      return res.status(502).json({ error: 'The AI service rejected the request. Check that your API key and model name are valid.' });
    res.status(502).json({ error: 'The AI service could not generate a summary. Please try again.' });
  }
});

// In production, serve the built React app from the same server.
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.listen(PORT, () => {
  console.log(`MeetMind AI server running on http://localhost:${PORT}`);
  if (!ai) console.warn('Warning: GEMINI_API_KEY is not set — /api/summarize will return an error.');
});