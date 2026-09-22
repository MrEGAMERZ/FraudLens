---
name: fraudlens
description: Fraud Funnel X-Ray & Phishing Inspector — detects hiring and rental scams by analyzing process compression (FFCS), multi-modal infrastructure trust, and document artifacts.
triggers:
  - fraudlens
  - scan offer
  - verify offer letter
  - detect scam
  - check domain trust
  - check phishing link
  - scan pdf offer
---

# FraudLens Skill — Fraud Funnel X-Ray 🔍

FraudLens is an open-source security intelligence skill that inspects job offers, recruiter emails, web URLs, and offer documents (PDF/DOCX) for **process compression** (skipped hiring stages) and deceptive infrastructure rather than relying solely on lexical keyword matching.

## When to Use

Invoke this skill when:
- Analyzing job offer letters, recruiter messages, Telegram gig pitches, or rental agreements for fraud.
- Checking if a hiring pipeline bypassed mandatory vetting stages (Screening $\rightarrow$ Technical Interview $\rightarrow$ Negotiation $\rightarrow$ Background Verification).
- Inspecting sending domain age (RDAP), TLS certificate validity, and corporate MX mail infrastructure.
- Scanning a suspicious web link, career portal, or PDF offer contract.
- Screening job postings programmatically before publishing them on a web portal.

## How to Call

### 1. API Mode (HTTP)

#### A. Raw Text Snippet
```http
POST /api/scan HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "text": "Dear Applicant, You have been directly selected for Remote Data Entry Specialist. Pay ₹4,999 refundable fee via UPI..."
}
```

#### B. Web URL / Phishing Link
```http
POST /api/scan HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "url": "https://careers-portal-verify.net/job/29402"
}
```

#### C. Document Upload (PDF, DOCX, TXT)
```http
POST /api/scan/upload HTTP/1.1
Host: localhost:3001
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="offer_letter.pdf"
Content-Type: application/pdf

[BINARY PDF DATA]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

### 2. Output Schema
The skill returns an explainable `ScanResult` JSON:

```json
{
  "scamThreatIndex": 82,
  "verdict": "scam",
  "confidence": 98.2,
  "analysisTimeMs": 1420,
  "archetype": "Advance-Fee Equipment Onboarding Scam",
  "funnelCompressionRatio": 75,
  "signals": {
    "ffcs": 92,
    "financialAsk": 95,
    "domainTrust": 70,
    "identityMatch": 75,
    "linguistic": 80
  },
  "funnelStages": [
    {"id": 0, "name": "Application Acknowledged", "status": "present", "evidence": "Resume reviewed"},
    {"id": 1, "name": "Screening Call", "status": "skipped", "evidence": null},
    {"id": 2, "name": "Interview(s)", "status": "skipped", "evidence": "No interview required"},
    {"id": 3, "name": "Salary Negotiation", "status": "skipped", "evidence": null},
    {"id": 4, "name": "Written Offer", "status": "present", "evidence": "Formal offer extended"},
    {"id": 5, "name": "Background Check", "status": "skipped", "evidence": null},
    {"id": 6, "name": "Signed Offer", "status": "skipped", "evidence": null},
    {"id": 7, "name": "Payroll/IT Onboarding", "status": "skipped", "evidence": "Deposit demanded prior to onboarding"}
  ],
  "evidence": [
    {
      "text": "Security deposit / payment requested via personal channel",
      "signal": "financialAsk",
      "reason": "Legitimate employers never demand deposits or upfront fees from candidates."
    }
  ],
  "domainInfo": {
    "domain": "techglobal-solutions-india.net",
    "domainAgeDays": 9,
    "registrar": "Hostinger Operations, UAB",
    "sslIssuedDaysAgo": 8,
    "mxProvider": "No MX records"
  }
}
```

### 3. Standalone CLI Tool

Use the built-in CLI scanner from terminal or automated scripts:

```bash
# Scan plain text
python3 scripts/fraudlens_cli.py "Offer letter text here..."

# Scan remote web link
python3 scripts/fraudlens_cli.py --url "https://suspicious-jobs.com/posting"

# Upload and scan a PDF / Word document
python3 scripts/fraudlens_cli.py --file "path/to/contract.pdf"

# Output raw JSON
python3 scripts/fraudlens_cli.py --file "path/to/letter.txt" --json
```

## Core Methodology

1. **Fraud Funnel Compression Score (FFCS):** Evaluates whether upstream hiring stages (interviews, negotiations) were skipped relative to an upfront financial ask.
2. **Infrastructure Telemetry:** Queries keyless RDAP endpoints for domain age, checks TLS socket certificate issue date, and verifies MX DNS records for corporate mail routing.
3. **Multi-Modal Ingestion:** Directly parses in-memory PDF/DOCX/TXT files and scrapes remote web links with SSRF protection.
4. **Multi-Modal Signal Fusion:** Combines 5 orthogonal signal families into an explainable 0–100 index (`0-30: legitimate`, `31-60: caution`, `61-100: scam`).

## Open Source Repository
Repository: [FraudLens GitHub](https://github.com/MrEGAMERZ/FraudLens)
