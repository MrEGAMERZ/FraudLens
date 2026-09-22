---
name: fraudlens
description: Fraud Funnel X-Ray & Phishing Inspector — detects hiring and rental scams by analyzing process compression (FFCS) and multi-modal infrastructure trust.
triggers:
  - fraudlens
  - scan offer
  - verify offer letter
  - detect scam
  - check domain trust
---

# FraudLens Skill — Fraud Funnel X-Ray

FraudLens is an open-source security skill that inspects job offers, recruiter emails, and rental agreements for **process compression** (skipped hiring stages) rather than relying solely on keyword matching.

## When to Use

Invoke this skill when:
- Analyzing job offer letters, recruiter messages, or rental agreements for fraud.
- Checking if a job offer skipped critical hiring stages (Screening $\rightarrow$ Interview $\rightarrow$ Negotiation $\rightarrow$ Background Check).
- Inspecting sending domain age (RDAP), SSL certificate validity, and corporate MX mail infrastructure.
- Screening job postings programmatically before publishing them on a web portal.

## How to Call

### 1. API Mode (HTTP POST)
Send a JSON payload to the FraudLens API backend:

```http
POST /api/scan HTTP/1.1
Host: fraudlens-api.onrender.com
Content-Type: application/json

{
  "text": "Dear Applicant, You have been directly selected for Remote Data Entry Specialist. Pay ₹4,999 refundable fee via UPI..."
}
```

### 2. Output Schema
The skill returns a structured `ScanResult` JSON:

```json
{
  "scamThreatIndex": 92,
  "verdict": "scam",
  "signals": {
    "ffcs": 95,
    "financialAsk": 90,
    "domainTrust": 80,
    "identityMatch": 85,
    "linguistic": 70
  },
  "funnelStages": [
    {"id": 0, "name": "Application Acknowledged", "status": "present"},
    {"id": 1, "name": "Screening Call", "status": "skipped"},
    {"id": 2, "name": "Interview(s)", "status": "skipped"},
    {"id": 3, "name": "Salary Negotiation", "status": "skipped"},
    {"id": 4, "name": "Written Offer", "status": "present"},
    {"id": 5, "name": "Background Check", "status": "skipped"},
    {"id": 6, "name": "Signed Offer", "status": "skipped"},
    {"id": 7, "name": "Payroll/IT Onboarding", "status": "present"}
  ]
}
```

## Core Methodology

1. **Fraud Funnel Compression Score (FFCS):** Evaluates whether upstream hiring stages (interviews, negotiations) were skipped relative to an upfront financial ask.
2. **Infrastructure Telemetry:** Queries keyless RDAP endpoints for domain age, checks TLS socket certificate issue date, and verifies MX DNS records for corporate mail routing.
3. **Multi-Modal Signal Fusion:** Fuses signals into an explainable 0–100 index (`0-30: legitimate`, `31-60: caution`, `61-100: scam`).

## Open Source Repository
Repository: [FraudLens GitHub](https://github.com/rehan/FraudLens)
