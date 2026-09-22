# TASKS — FraudLens

**Last updated:** 2026-09-22  
**Source of truth for "not done"**

---

## T-01 — ML Service: Gemini judge working end-to-end
- **Owner:** ML Agent
- **Depends on:** GEMINI_API_KEY set in `.env`
- **Acceptance:** POST /judge with scam text returns valid JSON with ffcs_risk ≥ 70
- **Status:** `OPEN`

## T-02 — Backend: /api/scan orchestration
- **Owner:** Backend Agent
- **Depends on:** T-01
- **Acceptance:** POST /api/scan returns full ScanResult with scamThreatIndex, signals, funnelStages, evidence, domainInfo
- **Status:** `OPEN`

## T-03 — Backend: RDAP domain age check
- **Owner:** Backend Agent
- **Depends on:** none (keyless)
- **Acceptance:** Calling checkDomain('techglobal-solutions-india.net') returns domainAgeDays ≤ 90
- **Status:** `OPEN`

## T-04 — Frontend: FunnelBar renders correctly
- **Owner:** Frontend Agent
- **Depends on:** T-02
- **Acceptance:** Scam sample shows ≥ 5 greyed stages; legit sample shows ≥ 5 green stages
- **Status:** `OPEN`

## T-05 — Frontend: Full result page renders
- **Owner:** Frontend Agent
- **Depends on:** T-02
- **Acceptance:** Gauge, radar chart, funnel bar, evidence panel, domain card all visible after scan
- **Status:** `OPEN`

## T-06 — Demo samples produce correct verdicts
- **Owner:** All
- **Depends on:** T-01, T-02, T-04, T-05
- **Acceptance:** Scam sample → red (≥61); Legit sample → green (≤30)
- **Status:** `OPEN`

## T-07 — GitHub repo public + all links valid
- **Owner:** Mohammed Rehan
- **Depends on:** none
- **Acceptance:** GitHub repo is public, all files committed, no secrets exposed
- **Status:** `OPEN`

## T-08 — Deploy to Vercel (frontend) + Render (backend + ML)
- **Owner:** Mohammed Rehan
- **Depends on:** T-06
- **Acceptance:** Live URL works, scan completes end-to-end in production
- **Status:** `OPEN`
