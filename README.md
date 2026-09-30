<div align="center">

# 🔍 FraudLens

### AI-Powered Fraud Funnel X-Ray & Phishing Intelligence Engine

[![CI](https://github.com/MrEGAMERZ/FraudLens/actions/workflows/ci.yml/badge.svg)](https://github.com/MrEGAMERZ/FraudLens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live App](https://img.shields.io/badge/Live%20App-Vercel-black?logo=vercel)](https://fraud-lens-eosin.vercel.app/)
[![API](https://img.shields.io/badge/API-Render-blue?logo=render)](https://fraudlens-sqzh.onrender.com/api/health)
[![Hack2Skill Score](https://img.shields.io/badge/Hack2Skill%20Score-95.36%2F100-brightgreen)](https://hack2skill.com)
[![Top 5](https://img.shields.io/badge/Rank-%235%20of%20341-gold)](https://hack2skill.com)

**Built for PromptWars × GEN AI Club — Presidency University, September 2026**

[**Live App →**](https://fraud-lens-eosin.vercel.app/) · [**API Docs →**](sdk/README.md) · [**Python SDK →**](sdk/python/) · [**TypeScript SDK →**](sdk/typescript/)

</div>

---

## 🎯 Chosen Vertical

**Fake Offer Letter & Phishing Inspector**

Traditional fraud detectors scan for "spam keywords" — but modern scammers use generative AI to write grammatically perfect, convincing offers. FraudLens takes a fundamentally different approach: instead of reading what the message *says*, it evaluates the structural *shape* of the hiring process itself.

---

## 🧠 Approach and Logic

### The Core Innovation: Fraud Funnel Compression Score (FFCS)

Legitimate corporate hiring follows a rigid, ordered process:

```
Application → Screening Call → Interview(s) → Salary Negotiation
→ Written Offer → Background Check → Signed Offer → Payroll Onboarding
```

Scammers cannot replicate this pipeline. They artificially **compress** the funnel, skipping stages 2–6 to rush directly toward a financial ask. FraudLens detects this **process collapse** — a pattern that is invisible to keyword-based tools but impossible for scammers to hide.

---

## ⚙️ How the Solution Works

**1. Smart, Dynamic Assistant (Counter-Inquiry Generator)**
FraudLens acts as a dynamic assistant, using Gemini to generate safe, tactical counter-inquiries based on the specific threat pattern detected. It uses **logical decision making based on user context** — drafting different responses for different scenarios (e.g., demanding a corporate CIN, refusing deposits, requesting an in-person walk-in) — empowering users to verify legitimacy safely.

**2. Multi-Modal Processing Pipeline**
Users can paste raw text, submit a suspicious URL (FraudLens scrapes and parses it), or upload a document (PDF, DOCX, or TXT). All parsing happens strictly in-memory — nothing is persisted.

**3. Dual-Layer AI Evaluation**
The FastAPI ML Service sends content to `gemini-2.5-flash` to extract all 8 funnel stages and calculate signal scores. If the Gemini API hits rate limits or timeouts, a deterministic local heuristic engine takes over **instantly** — guaranteeing 100% operational uptime for every demo.

---

## ✨ Features

| Feature | Description |
|---|---|
| **FFCS Engine** | Maps text against 8 canonical hiring stages; detects structural compression |
| **Multi-Modal Ingestion** | Text, live URL scraping, PDF / DOCX / TXT document upload |
| **Scam Threat Index** | 0–100 composite score fusing 5 orthogonal signal families |
| **Domain Intelligence** | RDAP domain age, TLS certificate age, MX record verification |
| **Counter-Inquiry Generator** | Gemini-powered AI that drafts safe tactical response emails |
| **Threat Library** | 6 documented scam archetypes with educational content |
| **CLI Tool** | Standalone Python scanner for terminal and CI/CD pipelines |
| **Open-Source SDK** | Python & TypeScript clients for integrating into your own systems |
| **Agent Skill** | `SKILL.md` — Drop into any AI coding assistant (Gemini CLI, Claude Code, Cursor) |
| **Zero-Retention Privacy** | All uploads processed strictly in-memory; never written to disk |
| **100% Uptime** | Heuristic fallback engine activates if primary LLM is unavailable |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User (Browser / CLI / SDK)                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  React Frontend      │  Vercel
                    │  (Vite + TypeScript) │  fraud-lens-eosin.vercel.app
                    └──────────┬──────────┘
                               │ /api/scan (proxied)
                    ┌──────────▼──────────┐
                    │  Express API Gateway │  Render
                    │  (TypeScript)        │  fraudlens-sqzh.onrender.com
                    │  ├─ Helmet + CORS    │
                    │  ├─ Rate Limiting    │
                    │  ├─ PDF/DOCX Parser  │
                    │  ├─ URL Scraper      │
                    │  └─ In-Memory Cache  │
                    └──────────┬──────────┘
                               │ /judge
              ┌────────────────▼─────────────────────┐
              │         FastAPI ML Service             │  Render
              │         (Python 3.11)                  │  fraudlens-ml.onrender.com
              │  ┌─────────────────────────────────┐  │
              │  │  gemini-2.5-flash (Primary)      │  │
              │  │  → Auto-fallback chain           │  │
              │  │  → Local Heuristic Judge         │  │
              │  └─────────────────────────────────┘  │
              └──────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Run Locally

```bash
git clone https://github.com/MrEGAMERZ/FraudLens.git
cd FraudLens
```

**1. ML Service**
```bash
cd ml-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Add your GEMINI_API_KEY
python app/main.py             # http://localhost:8000
```

**2. Backend API**
```bash
cd backend
npm install
cp .env.example .env
npm run dev                    # http://localhost:3001
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

---

## 🔌 Integrate FraudLens

### Python SDK

```python
from fraudlens import FraudLens

client = FraudLens()  # Points to public API by default
result = client.scan_text("Pay Rs 4999 security deposit via UPI to activate offer...")

print(result.verdict)            # "scam"
print(result.scam_threat_index)  # 87
print(result.is_scam)            # True
print(result.ffcs_stage_summary) # {"present": 2, "skipped": 6, "total": 8}
```

### TypeScript / JavaScript SDK

```typescript
import { FraudLens } from './sdk/typescript/dist'

const client = new FraudLens()
const result = await client.scanText('You have been selected! No interview required...')

console.log(result.isScam)                              // true
console.log(result.scamThreatIndex)                     // 87
console.log(result.skippedStages.map(s => s.name))      // ["Screening Call", ...]
```

### REST API (Any Language)

```bash
curl -X POST https://fraudlens-sqzh.onrender.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"text": "Pay deposit via UPI to claim your laptop..."}'
```

> **See [sdk/README.md](sdk/README.md) for full SDK documentation, response schema, and curl examples.**

---

## 🧪 Testing

```bash
# Frontend unit tests (Vitest)
cd frontend && npm test -- --run

# ML Service integration tests (Pytest)
cd ml-service && pytest test_app.py -v
```

---

## 📁 Repository Structure

```
FraudLens/
├── frontend/          # React + Vite + TypeScript web application
├── backend/           # Express + TypeScript API gateway
├── ml-service/        # FastAPI + Python ML service (Gemini + heuristic fallback)
├── sdk/
│   ├── python/        # pip-installable Python SDK
│   ├── typescript/    # npm-installable TypeScript/JavaScript SDK
│   └── README.md      # SDK integration guide
├── scripts/
│   └── fraudlens_cli.py  # Standalone CLI scanner
├── skills/
│   └── fraudlens/SKILL.md # Open-source AI Agent Skill
├── docs/              # Architecture, PRD, Security, Design docs
└── .github/workflows/ # CI pipeline (build + test all 3 services)
```

---

## 📌 Assumptions Made

1. **Recruitment Process Linearity:** Legitimate employers follow a multi-stage vetting process. They never require upfront equipment deposits or fees via personal payment rails (UPI, gift cards, crypto).
2. **Domain Identity as Trust Anchor:** Authentic corporate communication originates from enterprise domains with established DNS routing and registration age (>90 days). Newly registered keyword-permuted lookalikes represent high-risk patterns.
3. **Candidate Data Privacy:** All document parsing operates strictly in-memory with zero disk persistence of personally identifiable content.
4. **Resilience Against API Outages:** External LLM APIs can rate-limit during high-concurrency periods. FraudLens incorporates a zero-downtime local heuristic fallback.
5. **Human-in-the-Loop Defense:** FraudLens is an assistive tool, not an opaque black box. It provides explainable evidence and actionable counter-inquiry templates.

---

## 👤 Author

**Mohammad Rehan Shaik** — [@MrEGAMERZ](https://github.com/MrEGAMERZ)

- 🏆 Top 5 Finalist (out of 341 teams) — PromptWars × GEN AI Club, Hack2Skill
- 📊 AI Evaluation Score: **95.36 / 100** (Efficiency: 100 · Security: 98 · Problem Alignment: 99)
- 🚀 Live App: [fraud-lens-eosin.vercel.app](https://fraud-lens-eosin.vercel.app/)

---

## 📄 License

[MIT](LICENSE) — Free to use in personal, commercial, and open-source projects.
