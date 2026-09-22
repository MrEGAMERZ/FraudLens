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

### 🎥 Project Demo

![Project Demo](docs/assets/brag.gif)

---

## 🎯 Problem Statement Alignment & High-Impact Value

| Dimension | Real-World Reality & Alignment |
|---|---|
| **The Root Challenge** | Generative AI has eliminated obvious phishing signals (grammar errors, broken syntax, crude formatting). Modern scammers generate convincing, professional communications. Traditional security tools rely on **static keyword lists** — which fail because scammers constantly adapt their vocabulary. |
| **User Needs & Vulnerability** | Students, fresh graduates, and remote job seekers are uniquely vulnerable during high-stress hiring periods. They need **auditable explainability** (understanding *why* an offer is fake) and an **active defense strategy** before making irreversible financial transfers (UPI deposits, equipment fees). |
| **Core Objectives & Solution** | FraudLens shifts fraud detection from **vocabulary to process structure**. By analyzing **Process Compression (FFCS)** across the 8 canonical recruitment stages, FraudLens catches scams regardless of how well-written they are. |
| **Measurable Real-World Impact** | 1. **Zero-Day Scam Detection:** Flags new fraud templates on day 1 by evaluating stage skipping rather than known phrase lists.<br>2. **Active Threat Mitigation:** Equips victims with the **AI Safe Counter-Inquiry Generator** to test recruiter legitimacy without exposing personal data.<br>3. **Zero-Retention Privacy:** No user documents or sensitive resumes are stored on disk. |

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

## 📥 Multi-Modal Ingestion Engine (3 Input Modalities)

FraudLens is engineered to ingest solicitations across all real-world attack vectors:

| Ingestion Mode | Input Vector | Processing Engine & Security Controls | Max Limit |
|---|---|---|---|
| **📝 Text Snippet** | Direct paste from email, WhatsApp, Telegram, or LinkedIn | Instant sanitization, entity extraction, and NLP preprocessing | Up to 60,000 chars |
| **🌐 Web URL / Link** | Career portal links, phishing URLs, or rental listing pages | **SSRF Defense Guard** (blocks `localhost`, RFC-1918 private subnets & AWS/GCP metadata `169.254.169.254`), HTML tag stripping, and direct domain extraction for RDAP/DNS checks | 8s timeout, 3MB body |
| **📄 Document Upload** | Official offer letters, employment contracts, and PDFs | In-memory parsing via `pdf-parse` (PDF) and `mammoth` (DOCX) with zero temporary disk writes for complete data privacy | Up to 25MB file size |

All three ingestion pathways funnel into the unified multi-signal evaluation pipeline, ensuring consistent scoring regardless of input format.

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
     [ 📝 Raw Text ]         [ 🌐 Web Link / URL ]         [ 📄 Document PDF/DOCX ]
            │                         │                               │
            └─────────────────────────┼───────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────────────────────┐
                        │      Frontend & CLI Scanner Interfaces  │
                        │   - Single Page App (Vercel / React)    │
                        │   - Standalone CLI (scripts/cli.py)     │
                        └────────────────────┬────────────────────┘
                                             │ HTTP POST /api/scan | /api/scan/upload
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │      Backend API (Node.js + Express)    │
                        │      - In-Memory Document Extractor     │
                        │      - SSRF-Guarded URL Scraper         │
                        │      - Domain Intelligence (RDAP/TLS/MX)│
                        │      - Multi-Signal Fusion Engine       │
                        │      - Resilient Local Judge Fallback   │
                        └───────────┬───────────────────┬─────────┘
                                    │                   │
                   POST /judge      │                   │ RDAP, TLS & DNS lookups
                                    ▼                   ▼
       ┌──────────────────────────────────┐   ┌─────────────────────────────┐
       │   ML Service (FastAPI + Python)  │   │  External Infrastructure    │
       │   - Gemini 1.5/2.0 Flash Judge   │   │  - rdap.org (Keyless RDAP)  │
       │   - 8-Stage Process Classifier   │   │  - TLS / SSL Certificate    │
       │   - Structured JSON Schema       │   │  - DNS MX Mail Verification │
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
├── scripts/                   # Standalone CLI tools
│   └── fraudlens_cli.py       # Terminal & CI/CD scanner for text, URLs & documents
├── skills/                    # Reusable agent skills
│   └── fraudlens/
│       └── SKILL.md           # Open-source agent skill for Claude Code, Gemini & Antigravity
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

### 2. Standalone Multi-Modal CLI Tool

Scan text, remote URLs, or uploaded documents directly from your terminal or CI/CD pipelines:

```bash
# Scan plain text directly
python3 scripts/fraudlens_cli.py "Dear applicant, send Rs 4999 for laptop"

# Scan a suspicious web link or job posting URL (with SSRF protection)
python3 scripts/fraudlens_cli.py --url "https://careers-verify-india.net/job/492"

# Upload and scan a PDF or Word document (.pdf, .docx, .txt)
python3 scripts/fraudlens_cli.py --file "contract_offer.pdf"

# Pipe content directly from standard input
cat offer_letter.txt | python3 scripts/fraudlens_cli.py --json
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
    console.warn(`[FRAUD ALERT] Threat Index ${data.scamThreatIndex}/100! Skipped stages:`, 
      data.funnelStages.filter((s: any) => s.status === 'skipped').map((s: any) => s.name)
    )
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
