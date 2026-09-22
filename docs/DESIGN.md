# DESIGN — FraudLens

**Last updated:** 2026-09-22

## Core User Journey

1. Land on scanner page → see input area + two demo buttons
2. Paste suspicious text (or load demo sample)
3. Click Scan → 3–8 second wait with loading indicator
4. Results appear: gauge → radar → funnel bar → evidence → domain card
5. User understands verdict immediately from color + funnel visual

## Key Screens

### Scanner Page (only screen)

```
┌──────────────────────────────────────────────────────┐
│ 🔍 FraudLens   Fraud Funnel X-Ray                   │
├──────────────────────────────────────────────────────┤
│ [ Paste Text ] [ Paste URL ]                        │
│ ┌──────────────────────────────────────────────┐    │
│ │ textarea (8 rows)                            │    │
│ └──────────────────────────────────────────────┘    │
│ [⚠️ Load Scam]  [✅ Load Legit]      [🔍 Scan Now]  │
├────────────────┬─────────────────────────────────────┤
│  Score Gauge   │  Signal Radar + 5 bar breakdown     │
│  (SVG arc)     │                                     │
│   🔴 73/100    │                                     │
│  🚨 Scam       │                                     │
├────────────────┴─────────────────────────────────────┤
│  Hiring Process Funnel (8 stages, horizontal)        │
│  [1✓][2✗][3✗][4✗][5✗][6✗][7✗][8✗]                 │
├──────────────────────────┬───────────────────────────┤
│  Evidence Panel          │  Technical Trust Card     │
│  [Financial] "pay ₹4999" │  Domain: 9 days old ⚠️   │
│  "within 2 hours..."     │  MX: Unknown              │
└──────────────────────────┴───────────────────────────┘
```

## Color System

| Color | Meaning |
|---|---|
| `#10b981` (green) | Safe / present stage |
| `#f59e0b` (amber) | Caution / mild risk |
| `#ef4444` (red) | Scam / skipped stage |
| `#3b82f6` (blue) | UI accent / tabs |

## Empty / Error / Loading States

- **Loading:** "🔄 Scanning..." on button, input disabled
- **Error:** Red banner with clear message (e.g., "Is the backend running?")
- **No domain:** Domain card shows "No domain detected in text" gracefully
- **Evidence empty:** "No specific red flags detected in the text"
