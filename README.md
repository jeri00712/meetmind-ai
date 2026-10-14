# MeetMind AI

Turn meeting notes into clear summaries, decisions, action items and deadlines using Google Gemini.
React + Vite + React Router frontend, Node/Express backend, history stored in browser localStorage (no login).

## 1. Requirements
- Node.js 18 or newer (`node -v`)
- A free Gemini API key from https://aistudio.google.com/apikey

## 2. Setup (Windows PowerShell)
```powershell
cd meetmind-ai
npm run setup                      # installs server + client packages
Copy-Item .env.example .env
notepad .env                       # paste your key after GEMINI_API_KEY=
```
Save `.env` as plain **UTF-8** (Notepad's default is fine). Never commit `.env`.

## 3. Run in development (two terminals)
```powershell
# Terminal 1 – backend on http://localhost:5000
npm run server

# Terminal 2 – frontend on http://localhost:5173
npm run client
```
Open http://localhost:5173.
If PowerShell blocks `npm`, use `npm.cmd run server` / `npm.cmd run client`.

## 4. Run as one production server
```powershell
npm run build
npm start                          # http://localhost:5000 serves API + built app
```

## 5. Verify it works
1. **Backend:** open http://localhost:5000/api/health → `{"status":"ok","aiConfigured":true}`
2. **Frontend:** open http://localhost:5173 → Home loads; every nav link opens.
3. **AI:** Summarize → "Use sample notes" → Generate Summary → you should see a summary, decisions, 3 action items and deadlines.
4. **Validation:** clear the notes and press Generate → "Please paste some meeting notes first."
5. **History:** Save → open History → refresh the page (F5) → the meeting is still there. Tick an action item, refresh, it stays ticked. Delete asks for confirmation.
6. **Backend-down message:** stop the server, press Generate → friendly "Cannot reach the MeetMind server" error.

## Project layout
```
client/src/pages/       Home, Summarizer, History, SummaryDetails, Help
client/src/components/  Navbar, Logo, SummaryView, MeetingCard, ConfirmDialog, EmptyState, Toast
client/src/services/    api.js (backend calls), storage.js (localStorage), format.js (copy/download)
server/server.js        Express API: GET /api/health, POST /api/summarize
```

## Troubleshooting
- **Vite: "Failed to load PostCSS config … Unexpected token '﻿' … is not valid JSON"** – a `package.json` was saved with a BOM (invisible character), often by Windows PowerShell's `Out-File`/`Set-Content`. Vite finds PostCSS config by reading the nearest `package.json`. Fix: in VS Code click the encoding in the status bar → "Save with Encoding" → **UTF-8** (not "UTF-8 with BOM"). All files in this project are BOM-free.
- **503 "no Gemini API key"** – `.env` is missing, in the wrong folder (must be the project root), or the server wasn't restarted.
- **429** – free-tier quota reached; wait a minute.
