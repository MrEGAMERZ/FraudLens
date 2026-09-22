# TEST PLAN — FraudLens

**Last updated:** 2026-09-22

## Critical Paths

1. Scam text → Scam Threat Index ≥ 61 + funnel bar mostly grey
2. Legit text → Scam Threat Index ≤ 30 + funnel bar mostly green
3. Scan completes in < 10 seconds

## Demo Script (for judges — 90 seconds)

### Step 1: Load scam sample
Click "⚠️ Load Scam Sample" → Click "Scan Now"

**Expected:**
- Score gauge shows red, 61+
- Funnel bar: stages 1–6 show ✗ (skipped)
- Financial Ask signal bar is high (amber/red)
- Evidence panel shows "pay ₹4,999" flagged as financial ask
- Domain card: domain age < 30 days (if RDAP resolves)

### Step 2: Load legit sample
Click "✅ Load Legit Sample" → Click "Scan Now"

**Expected:**
- Score gauge shows green, ≤ 30
- Funnel bar: most stages show ✓ (present)
- All signal bars low
- Evidence panel: no or minimal red flags

## Pass / Fail Criteria

| Test | Pass | Fail |
|---|---|---|
| Scam STI | ≥ 61 | < 61 |
| Legit STI | ≤ 30 | > 30 |
| Scan speed | < 10s | > 15s |
| Funnel bar | Renders ≥ 6 stages | Missing or broken |
| Error handling | Shows message if ML down | White screen / crash |
| No secrets in repo | `git grep GEMINI_API_KEY` finds only `.env.example` | Key exposed |

## Fallback for Demo

If Gemini API is slow during live demo:
- Pre-run both sample scans and cache/screenshot results
- Show cached JSON in browser devtools if API stalls
