# Agent Architecture — FraudLens

**Last updated:** 2026-09-22

Three autonomous agents split the work. Each owns a directory and a git branch.

---

## 🎨 Frontend Agent

**Branch:** `agent/frontend`  
**Directory:** `frontend/`  
**Stack:** React + Vite + TypeScript + Recharts

**Owns:**
- All UI components (`ScoreGauge`, `FunnelBar`, `SignalRadar`, `EvidencePanel`, `DomainCard`)
- `ScannerPage` — input, scan button, result layout
- CSS styling and responsive layout
- Demo sample text (pre-loaded for judges)

**Does NOT touch:** `backend/`, `ml-service/`

**How to start:**
```bash
cd frontend && npm install && npm run dev
```

---

## ⚙️ Backend Agent

**Branch:** `agent/backend`  
**Directory:** `backend/`  
**Stack:** Node.js + Express + TypeScript

**Owns:**
- `/api/scan` POST endpoint — orchestrates scan
- `domain.ts` — RDAP domain age + DNS MX lookup
- `fusion.ts` — weighted ScamThreatIndex formula
- Calls ML service `/judge`

**Does NOT touch:** `frontend/`, `ml-service/`

**How to start:**
```bash
cd backend && cp .env.example .env && npm install && npm run dev
```

---

## 🧠 ML / Vision Agent

**Branch:** `agent/ml-service`  
**Directory:** `ml-service/`  
**Stack:** Python + FastAPI + Gemini Flash

**Owns:**
- `judge.py` — Gemini Flash prompt + JSON parsing
- `/judge` FastAPI endpoint
- FFCS calculation logic
- Fallback responses when Gemini fails

**Does NOT touch:** `frontend/`, `backend/`

**How to start:**
```bash
cd ml-service && cp .env.example .env  # add GEMINI_API_KEY
pip install -r requirements.txt
python app/main.py
```

---

## Shared Contract

All agents agreed on this API shape in `docs/ARCHITECTURE.md`.
**Do not change the shape of `/judge` or `/api/scan` without updating both sides.**
