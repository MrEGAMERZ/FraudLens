# PRD — FraudLens

**Last updated:** 2026-09-22  
**Status:** MVP — Hackathon submission

## 🎯 Problem Statement Alignment & High Impact

### 1. The Root Challenge
Modern Generative AI enables scammers to generate grammatically impeccable, highly persuasive offer letters and rental solicitations that bypass traditional email filters. Legacy fraud detection tools rely on static keyword blacklists (e.g. searching for "urgent", "lottery", "fee"), which fail because threat actors continuously adapt their vocabulary. 

### 2. User Needs & Target Vulnerability Profile
- **Primary Users:** University students, fresh college graduates, and remote entry-level job seekers navigating high-volume application cycles.
- **Secondary Users:** Renters seeking subleases and gig workers responding to remote task recruitment.
- **Critical Need:** Users require transparent, explainable forensic reasoning—not an arbitrary black-box score—and actionable counter-measures before transferring irreversible funds (UPI deposits, equipment fees).

### 3. Core Objectives & Solution
FraudLens shifts fraud detection from **vocabulary to process structure**. By modeling the 8 canonical recruitment milestones (Application → Screening → Interview → Negotiation → Offer → Background Check → Contract → Onboarding), FraudLens detects **Process Compression (FFCS)** where multiple vetting stages are skipped to rush victims into financial transfer.

## Target User

- Job seekers evaluating suspicious employment contracts and offer letters
- Students facing upfront deposit demands for campus placement drives
- Hackathon and enterprise evaluators assessing explainable AI security systems

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
