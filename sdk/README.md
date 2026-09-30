# FraudLens SDKs

Official client libraries to integrate FraudLens fraud detection into your own applications, pipelines, and tools.

**Live API:** `https://fraudlens-sqzh.onrender.com`

---

## 📦 Python SDK

### Install

```bash
pip install httpx
# Clone the repo and install locally for now:
pip install -e sdk/python/
```

### Quick Start

```python
from fraudlens import FraudLens

client = FraudLens()  # Uses the public hosted API by default

# ── Scan an email or recruiter message ──────────────────────────────────────
result = client.scan_text("""
    Congratulations! You have been selected for Remote Data Entry Specialist.
    No interview required. Please pay ₹4,999 security deposit via UPI within 2 hours.
""")

print(result.verdict)            # "scam"
print(result.scam_threat_index)  # 87
print(result.ffcs_stage_summary) # {"present": 2, "skipped": 6, "total": 8}
print(result.is_scam)            # True

# ── Scan a suspicious URL ────────────────────────────────────────────────────
result = client.scan_url("https://techglobal-careers-india.net/apply")
print(result.domain_info.domain_age_days)  # 9

# ── Scan a PDF / Word offer letter ───────────────────────────────────────────
result = client.scan_file("offer_letter.pdf")
for stage in result.funnel_stages:
    print(f"{stage.name}: {stage.status}")

# ── Context manager ──────────────────────────────────────────────────────────
with FraudLens() as client:
    result = client.scan_text("Your offer text here...")
```

### Self-Hosted

```python
from fraudlens import FraudLens

# Point to your own local or cloud instance
client = FraudLens(base_url="http://localhost:3001")
```

---

## 📦 TypeScript / JavaScript SDK

### Install

```bash
# Clone and link locally:
cd sdk/typescript && npm install && npm run build
```

### Quick Start (TypeScript)

```typescript
import { FraudLens } from './sdk/typescript/dist'

const client = new FraudLens()

// Scan raw text
const result = await client.scanText(`
  You have been selected! No interview required.
  Pay Rs 4999 as a refundable equipment deposit via UPI.
`)

console.log(result.verdict)          // "scam"
console.log(result.scamThreatIndex)  // 87
console.log(result.isScam)           // true
console.log(result.skippedStages.map(s => s.name))
// ["Screening Call", "Interview(s)", "Salary Negotiation", ...]

// Scan a URL
const urlResult = await client.scanUrl('https://careers-portal-india.net')
console.log(urlResult.domainInfo?.domainAgeDays) // 11
```

### Quick Start (JavaScript / Node.js)

```javascript
const { FraudLens } = require('./sdk/typescript/dist')

const client = new FraudLens()

client.scanText('Pay deposit via UPI to claim your offer...')
  .then(result => {
    if (result.isScam) {
      console.warn(`SCAM — Threat Index: ${result.scamThreatIndex}/100`)
    }
  })
```

---

## 📋 Full Response Schema

```typescript
{
  scamThreatIndex: number        // 0-100. >60 = scam.
  verdict: "safe" | "caution" | "scam"
  confidence: number             // 0-100
  archetype: string | null       // e.g. "Advance-Fee Equipment Scam"
  funnelCompressionRatio: number // % of hiring stages skipped (0-100)

  signals: {
    ffcs: number                 // Process compression score
    financialAsk: number         // Upfront money demand severity
    domainTrust: number          // Infrastructure risk
    identityMatch: number        // Identity mismatch signals
    linguistic: number           // Urgency & coercion language
  }

  funnelStages: [                // All 8 canonical hiring stages
    { id: 0, name: "Application Acknowledged", status: "present" | "skipped" | "unknown", evidence: string | null },
    { id: 1, name: "Screening Call",            status: ..., evidence: ... },
    { id: 2, name: "Interview(s)",              status: ..., evidence: ... },
    { id: 3, name: "Salary Negotiation",        status: ..., evidence: ... },
    { id: 4, name: "Written Offer",             status: ..., evidence: ... },
    { id: 5, name: "Background Check",          status: ..., evidence: ... },
    { id: 6, name: "Signed Offer",              status: ..., evidence: ... },
    { id: 7, name: "Payroll Onboarding",        status: ..., evidence: ... },
  ]

  domainInfo: {
    domain: string
    domainAgeDays: number        // <30 days is a major red flag
    registrar: string
    sslIssuedDaysAgo: number
    mxProvider: string
  } | null

  evidence: [
    { text: string, signal: string, reason: string }
  ]

  processingTimeMs: number
}
```

---

## 🔌 Direct REST API

No SDK required. Hit the API directly from any language:

```bash
# Text scan
curl -X POST https://fraudlens-sqzh.onrender.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"text": "Pay Rs 4999 to activate your offer..."}'

# URL scan
curl -X POST https://fraudlens-sqzh.onrender.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://careers-techglobal-india.net"}'

# Document upload
curl -X POST https://fraudlens-sqzh.onrender.com/api/scan \
  -F "file=@offer_letter.pdf"
```

---

## 📄 License

MIT — Free to use in personal, commercial, and open-source projects.
