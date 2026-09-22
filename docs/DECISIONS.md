# DECISIONS — FraudLens

**Last updated:** 2026-09-22

---

### 2026-09-22 — Use Gemini Flash as AI judge (not OpenAI)

- **Context:** Event rules require Google products only. Also cost-efficient for hackathon.
- **Decision:** Gemini Flash via Google AI Studio (`gemini-1.5-flash`)
- **Alternatives considered:** OpenAI GPT-4o (disqualified by event rules), Claude Sonnet (disqualified)
- **Consequences:** Must set `GEMINI_API_KEY`. Response format validated via prompt engineering + JSON parse.

---

### 2026-09-22 — Single structured LLM call (not per-signal calls)

- **Context:** 3-hour build window. Multiple LLM calls = slow, expensive, rate-limited.
- **Decision:** One Gemini call returns all signal data as structured JSON.
- **Alternatives considered:** Separate calls per signal family (more expensive, slower)
- **Consequences:** Prompt is longer but simpler to debug. Fallback on JSON parse error.

---

### 2026-09-22 — RDAP for domain age (not WHOIS)

- **Context:** WHOIS requires paid APIs or parsing unstructured text. RDAP is free, structured JSON, keyless.
- **Decision:** Use `rdap.org` proxy — plain HTTP GET, standard JSON, no key.
- **Alternatives considered:** Paid WHOIS API, regex WHOIS parsing
- **Consequences:** Some TLDs have incomplete RDAP data. Handled gracefully — domain age is optional.

---

### 2026-09-22 — Monorepo (frontend + backend + ml-service in one repo)

- **Context:** Hackathon — one public GitHub link required. Single repo is simpler.
- **Decision:** Monorepo with `frontend/`, `backend/`, `ml-service/` dirs.
- **Alternatives considered:** Separate repos per service (more GitHub links to manage)
- **Consequences:** One `git clone`, one repo link for submission.
