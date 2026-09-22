# FraudLens — Fraud Funnel X-Ray 🔍

> **PromptWars × GEN AI Club Hackathon Submission**  
> *Track: Fake Offer Letter & Phishing Inspector | Presidency University*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fraud--lens--eosin.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://fraud-lens-eosin.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-MrEGAMERZ%2FFraudLens-181717?style=for-the-badge&logo=github)](https://github.com/MrEGAMERZ/FraudLens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)

---

### 🌐 Live Application
👉 **Experience the live scanner:** **[https://fraud-lens-eosin.vercel.app/](https://fraud-lens-eosin.vercel.app/)**

---

**FraudLens** is an explainable job offer and phishing scanner that detects **process compression**, not just scary keywords.

Scammers have already adapted their vocabulary — they use formal corporate tone, authentic letterheads, and real employer names. Keyword scanners are a year behind the scam. FraudLens evaluates the **shape of the hiring or rental process**: legitimate funnels have multiple stages (application → screening → interview → negotiation → offer → background check → onboarding). Fraudulent offers compress 6+ stages into 1 (*"You are selected, now pay ₹4,999"*).

---

## 🔑 The Core Innovation: Fraud Funnel Compression Score (FFCS)

Instead of asking *"does this email have scary words?"*, FraudLens models the canonical hiring pipeline:

```
STAGE 0 — Application acknowledged
STAGE 1 — Screening call / phone evaluation
STAGE 2 — Technical / behavioral interview(s)
STAGE 3 — Salary & role negotiation (two-way dialog)
STAGE 4 — Formal written conditional offer
STAGE 5 — Background & reference verification
STAGE 6 — Signed contract & onboarding paperwork
STAGE 7 — Payroll & equipment logistics (never upfront fee)
```

A fraudulent offer jumps directly from **Stage 0** to **Stage 7** (*"pay for your onboarding laptop"*). FraudLens maps every submitted text against this process graph and outputs:
- **Stages Present:** Verified through explicit text evidence.
- **Stages Explicitly Skipped:** Detected shortcuts (*"selected without interview"*, *"immediate joining"*).
- **Stage Ordering Violations:** Payment requested before any interview mention.
- **Funnel Compression Ratio:** `stages_present / stages_expected_before_ask`.

---

## 🛡️ Multi-Modal Signal Fusion (Scam Threat Index)

FraudLens does not rely on an opaque AI black box. It fuses **5 independent, inspectable signal families** into a transparent 0–100 score:

$$\text{ScamThreatIndex} = 0.35 \times \text{FFCS} + 0.20 \times \text{FinancialAsk} + 0.20 \times \text{DomainTrust} + 0.15 \times \text{IdentityMatch} + 0.10 \times \text{LinguisticMarkers}$$

| Signal | Description | Methodology |
|---|---|---|
| **Signal A: FFCS** (35%) | Measures stage skip ratio and process compression | Gemini Flash semantic process classifier |
| **Signal B: Financial Ask** (20%) | Evaluates payment type (refundable vs upfront fee), urgency pressure, and channel (UPI/Crypto vs corporate invoice) | Gemini structured fingerprinting |
| **Signal C: Domain & Infra** (20%) | Verifies sender domain age, registration date, TLS/SSL certificate issue age, and MX records | Keyless RDAP (`rdap.org`) + TLS Handshake + DNS MX inspection |
| **Signal D: Identity Verification** (15%) | Checks domain typosquatting and impersonation of known employers | Edit-distance / homoglyph heuristic against canonical domains |
| **Signal E: Linguistic Manipulation** (10%) | Detects manipulation techniques (authority mimicry, artificial scarcity, isolation language) | Gemini psychological manipulation classifier |

### Threat Bands:
- 🟢 **0 – 30:** Looks Legitimate
- 🟡 **31 – 60:** Exercise Caution (Irregularities Detected)
- 🔴 **61 – 100:** High-Confidence Scam Pattern

---

## 🏗️ Architecture

```
                       ┌─────────────────────────────────────────┐
                       │           User Browser / UI             │
                       │   https://fraud-lens-eosin.vercel.app   │
                       └────────────────────┬────────────────────┘
                                            │ HTTP / JSON
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │     Frontend (React + Vite + TS)       │
                       │     - ScoreGauge (Radial Verdict)       │
                       │     - FunnelBar (Skipped Stages Visual) │
                       │     - SignalRadar (5-Axis Risk Radar)   │
                       │     - EvidencePanel & DomainCard        │
                       └────────────────────┬────────────────────┘
                                            │ POST /api/scan
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │      Backend API (Node.js + Express)    │
                       │      - Orchestrates scan workflow       │
                       │      - TLS certificate verification     │
                       │      - Multi-signal fusion engine       │
                       └───────────┬───────────────────┬─────────┘
                                   │                   │
                  POST /judge      │                   │ RDAP, TLS & DNS lookups
                                   ▼                   ▼
      ┌──────────────────────────────────┐   ┌─────────────────────────────┐
      │   ML Service (FastAPI + Python)  │   │  External Infrastructure    │
      │   - Gemini 1.5/2.0 Flash Judge   │   │  - rdap.org (Keyless RDAP)  │
      │   - Structured JSON schema       │   │  - TLS / SSL Certificate    │
      │                                  │   │  - DNS MX Mail Verification │
      └──────────────────────────────────┘   └─────────────────────────────┘
```

---

## 📁 Repository Structure

```
FraudLens/
├── frontend/                  # React + Vite + TypeScript web application (Vercel)
│   ├── src/
│   │   ├── components/        # ScoreGauge, FunnelBar, SignalRadar, EvidencePanel, DomainCard
│   │   ├── pages/             # ScannerPage (main dashboard)
│   │   └── types.ts           # Shared TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── backend/                   # Node.js + Express + TypeScript API server
│   ├── src/
│   │   ├── routes/            # /api/scan endpoint
│   │   ├── services/          # domain.ts (RDAP/DNS/TLS), fusion.ts (weighted scoring)
│   │   └── types.ts           # Schema definitions
│   └── package.json
├── ml-service/                # Python FastAPI service for AI reasoning
│   ├── app/
│   │   ├── judge.py           # Gemini Flash prompt & process classifier
│   │   └── main.py            # FastAPI application endpoints
│   └── requirements.txt
├── docs/                      # Standard project documentation pack
│   ├── PRD.md                 # Problem statement, requirements, metrics
│   ├── ARCHITECTURE.md        # Deep dive into components and data flow
│   ├── DESIGN.md              # UI/UX design rationale and wireframes
│   ├── RULES.md               # Development rules & definition of done
│   ├── TASKS.md               # Task tracker and roadmap (all core tasks DONE)
│   ├── TEST_PLAN.md           # End-to-end demo script and verification
│   ├── SECURITY.md            # Threat model, secrets policy, safe handling
│   ├── DECISIONS.md           # Architecture Decision Records (ADRs)
│   ├── MEMORY.md              # Project memory and gotchas
│   └── AGENTS.md              # Multi-agent role division
└── README.md                  # Project overview and documentation
```

---

## 📋 Documentation Pack

All technical documentation is organized in [`docs/`](docs/):

| Document | Purpose |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product Requirements Document — problem, users, goals, non-goals, and constraints |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, component boundaries, failure modes, data flow |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual design system, component hierarchy, color palettes |
| [docs/RULES.md](docs/RULES.md) | Engineering standards, code conventions, testing requirements |
| [docs/TASKS.md](docs/TASKS.md) | Task tracking, dependencies, and implementation status |
| [docs/TEST_PLAN.md](docs/TEST_PLAN.md) | Test cases, verification steps, and demo walkthrough |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat modeling, privacy considerations, safe input sanitization |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture Decision Records (ADRs) |
| [docs/MEMORY.md](docs/MEMORY.md) | Engineering context and persistent learnings |
| [docs/AGENTS.md](docs/AGENTS.md) | Agent team layout and directory ownership |

---

## 🚀 Quick Start (Local Development)

### 1. ML Service (FastAPI + Gemini Flash)

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure Gemini API Key
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY from Google AI Studio

# Run ML service on http://localhost:8000
python app/main.py
```

### 2. Backend API (Express + TypeScript)

```bash
cd backend
npm install
cp .env.example .env

# Run backend API on http://localhost:3001
npm run dev
```

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install

# Run frontend on http://localhost:5173
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Demo Scenarios

- **Scam Case:** A letter congratulating the applicant, claiming immediate selection with no technical interview, demanding a ₹4,999 refundable equipment fee to a UPI ID within 24 hours.  
  *Result:* **FFCS Flagged (Stages 1-6 skipped)** + **Domain/TLS Risk High** → **Scam Threat Index ~85 (Red)**.
- **Legitimate Case:** A formal offer referencing an initial screening call, 2 rounds of technical interviews, salary negotiation, written benefits, conditional on background check, zero upfront fees.  
  *Result:* **Full Process Present** + **Legitimate Corporate Domain** → **Scam Threat Index ~12 (Green)**.

## 🔌 Open Source & Agent Skill Integration (`SKILL.md`)

FraudLens is built not just as a standalone web app, but as a **reusable security primitive** for other applications, developer platforms, and AI agents.

### 1. Integrate with AI Coding Agents (Claude Code, Gemini CLI, Antigravity, Cursor)

You can drop the FraudLens skill directly into your AI coding assistant:

```bash
# Copy the skill into your project or global agent directory
mkdir -p .agents/skills/fraudlens
cp skills/fraudlens/SKILL.md .agents/skills/fraudlens/SKILL.md
```

Your AI assistant can now audit offer letters or suspicious messages automatically during coding sessions via `/fraudlens`.

### 2. Standalone CLI Tool

Scan files or piped text directly from your terminal or CI/CD pipelines:

```bash
# Scan a text file directly
python3 scripts/fraudlens_cli.py --file offer_letter.txt

# Or scan via standard input
echo "Dear applicant, send Rs 4999 for laptop" | python3 scripts/fraudlens_cli.py
```

### 3. REST API for Job Boards & HR Tech Portals

Automate screening for job postings in your own React / Node.js platforms:

```typescript
import axios from 'axios'

async function checkJobPosting(offerText: string) {
  const { data } = await axios.post('https://fraud-lens-eosin.vercel.app/api/scan', {
    text: offerText
  })
  
  if (data.scamThreatIndex >= 61) {
    console.warn('Flagged as scam! Skipped stages:', data.funnelStages.filter(s => s.status === 'skipped'))
  }
}
```

---

## 👥 Team & Acknowledgments

Built for **PromptWars × GEN AI Club Hackathon**, Presidency University (September 2026).
- Track: Fake Offer Letter & Phishing Inspector
- Developed by **Mohammad Rehan** ([@MrEGAMERZ](https://github.com/MrEGAMERZ))
- Live Web Application: [https://fraud-lens-eosin.vercel.app/](https://fraud-lens-eosin.vercel.app/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
