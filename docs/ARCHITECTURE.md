# Architecture — FraudLens

**Last updated:** 2026-09-22

## Context Diagram

```
User (browser)
     │
     ▼
┌─────────────────────────────────────────────┐
│  Frontend  (React + Vite, port 5173)        │
│  - ScannerPage: text/URL input              │
│  - ScoreGauge, SignalRadar, FunnelBar       │
│  - EvidencePanel, DomainCard                │
└───────────────────┬─────────────────────────┘
                    │ POST /api/scan
                    ▼
┌─────────────────────────────────────────────┐
│  Backend  (Express + TypeScript, port 3001) │
│  - /api/scan route                          │
│  - domain.ts: RDAP + DNS MX check          │
│  - fusion.ts: weighted score calculation    │
└──────────┬──────────────────────────────────┘
           │ POST /judge          │ RDAP + DNS
           ▼                      ▼
┌─────────────────┐   ┌─────────────────────┐
│  ML Service     │   │  External (keyless) │
│  FastAPI + py   │   │  - rdap.org         │
│  - judge.py     │   │  - DNS MX lookup    │
│  - Gemini Flash │   └─────────────────────┘
└─────────────────┘
```

## Components

| Component | Responsibility | Key files |
|---|---|---|
| Frontend | UI, user input, result rendering | `src/pages/ScannerPage.tsx`, `src/components/*` |
| Backend | Orchestrate scan, domain checks, score fusion | `src/routes/scan.ts`, `src/services/*` |
| ML Service | Gemini call, FFCS logic, JSON output | `app/judge.py` |

## Data Flow

1. User pastes text → frontend POST `/api/scan`
2. Backend calls ML service `/judge` with text
3. ML service sends structured prompt to Gemini Flash
4. Gemini returns JSON: funnel stages, risks, evidence
5. Backend runs RDAP + DNS checks on extracted domain
6. Backend runs `fusionScore()` — weighted formula → ScamThreatIndex
7. Result JSON returned to frontend → renders all components

## Failure Modes

| Failure | Handling |
|---|---|
| Gemini API down | `_fallback_response()` returns neutral zero scores |
| RDAP timeout | `domainInfo.error` set, domain trust risk = 30 (mild) |
| DNS failure | `mxProvider` = "No MX records", adds 20 to domain risk |
| URL fetch fails | 400 error with clear message |

## External Dependencies

- `rdap.org` — free, keyless RDAP proxy (domain age)
- `dns` Node.js stdlib — MX record lookup
- Gemini Flash (Google AI Studio) — requires `GEMINI_API_KEY`
