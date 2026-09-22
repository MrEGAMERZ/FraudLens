# SECURITY — FraudLens

**Last updated:** 2026-09-22

## Assets to Protect

- `GEMINI_API_KEY` — Google AI Studio key, billed per token
- User-submitted text (transient, not stored)

## Secrets Handling

- **NEVER commit `.env` files.** Only `.env.example` (with placeholder values) is committed.
- `.gitignore` excludes all `.env*` files.
- API key is loaded via `python-dotenv` / `dotenv` Node package — never hardcoded.
- Before pushing: run `git grep GEMINI_API_KEY` — must only appear in `.env.example`.

## Threat Model

| Threat | Mitigation |
|---|---|
| API key leaked in commit | `.gitignore` + pre-push check |
| User text stored by ML service | Text is not persisted — only processed in memory |
| RDAP/DNS abuse | Keyless public APIs — no auth to steal |
| XSS via scanned text | React auto-escapes; no `dangerouslySetInnerHTML` |

## Never-Do List

- Never store scanned text to a database
- Never log full user input to console in production
- Never expose the Gemini API key in frontend code or public URLs
- Never commit `.env` (real keys)

## AI Disclaimer (required by event rules)

All results are informational only. FraudLens is not a legal tool and does not guarantee accuracy. Always verify suspicious messages through official channels.
