# MEMORY — FraudLens

**Last updated:** 2026-09-22  
**For agents — read this before coding**

## Current Status

Scaffold complete. All three services have starter files. Docs pack created. GitHub setup pending (needs `gh auth login` + `sudo chown` fix for Homebrew). Next: install dependencies, run each service, verify end-to-end scan.

## Demo Path

1. Run ML service: `cd ml-service && python app/main.py`
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173
5. Click "Load Scam Sample" → Scan → expect red score, funnel mostly grey
6. Click "Load Legit Sample" → Scan → expect green score, funnel mostly green

## Known Gotchas

- Directory was named `PromtWars ` (trailing space) — now renamed to `FraudLens`
- `gh` CLI needs Homebrew permissions fixed: run `sudo chown -R $(whoami) /opt/homebrew ...` in terminal
- Gemini response sometimes wraps JSON in markdown fences — `judge.py` strips these
- RDAP may return empty for some Indian TLDs — handled gracefully
- Frontend proxy: Vite proxies `/api` to `:3001` in dev. In production, set `VITE_API_URL`

## Important Links

- Hackathon rules: `_PROMPTWARS X GEN AI Document.pdf`
- Project idea spec: `FraudLens_Project_Idea.md`
- Event submission: Hack2Skill dashboard
- Tag on LinkedIn: @Hack2Skill @Google For Developers @GEN AI CLUB + #promptwars
