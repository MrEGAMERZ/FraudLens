# PRD — FraudLens

**Last updated:** 2026-09-22  
**Status:** MVP — Hackathon submission

## Problem

Job seekers and renters receive fake offer letters that bypass spam filters because they use formal tone, letterheads, and real company names. Existing scanners use keyword lists — but scammers have adapted their vocabulary. A keyword-based scanner is already behind the scam it is scanning.

## Target User

- Job seekers receiving suspicious offer letters
- Renters receiving suspicious rental agreement demands
- Hackathon judges evaluating genuinely novel AI approaches

## Goals

- Detect fraud by measuring **process compression**, not vocabulary
- Show users exactly which hiring stages were skipped (visual funnel bar)
- Produce an explainable score with 5 named, auditable signal families
- Demo must work live with two contrasting samples in < 30 seconds

## Non-Goals

- Not a legal tool — informational only
- Not a browser extension (stretch goal, not MVP)
- Not a trained ML model — uses Gemini Flash prompt engineering

## Success Metrics

- Scam sample → Scam Threat Index ≥ 61 (red)
- Legit sample → Scam Threat Index ≤ 30 (green)
- Full scan completes in < 10 seconds
- Funnel bar clearly shows skipped stages on scam sample

## Constraints

- **Time:** Single hackathon day build
- **AI:** Google products only (Gemini API via Google AI Studio)
- **Team:** 3 agents (frontend, backend, ML) + 1 orchestrating developer
- **Submission:** Public GitHub + deployed link + LinkedIn post required
