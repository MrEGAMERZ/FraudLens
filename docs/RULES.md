# RULES — FraudLens

**Last updated:** 2026-09-22

## Build & Run Commands

```bash
# ML Service
cd ml-service
cp .env.example .env      # add GEMINI_API_KEY
pip install -r requirements.txt
python app/main.py        # runs on :8000

# Backend
cd backend
cp .env.example .env
npm install
npm run dev               # runs on :3001

# Frontend
cd frontend
npm install
npm run dev               # runs on :5173, proxies /api → :3001
```

## Branch Strategy (from CLAUDE.md)

- `main` — protected, no direct push
- `dev` — all PRs target this branch
- `agent/frontend` — Frontend Agent work
- `agent/backend` — Backend Agent work
- `agent/ml-service` — ML Agent work

**⛔ PRs always target `dev`, never `main`.**

## Commit Format (conventional commits)

```
feat(frontend): add FunnelBar component
fix(backend): handle RDAP timeout gracefully
docs(prd): add success metrics
```

## Code Style

- TypeScript strict mode in frontend + backend
- Python type hints in ml-service
- No `any` types without comment explanation
- No hardcoded API keys — always use `.env`

## What Not to Commit

- `.env` files (real keys)
- `node_modules/`
- `__pycache__/`, `.pyc`
- `.DS_Store`

## Definition of Done

- Feature works end-to-end (not just written)
- TASKS.md updated (task marked DONE)
- MEMORY.md updated if status changed
- No exposed secrets
- Priority: **Working → Measurable → Explainable → Privacy-safe → Lightweight → Demoable**
